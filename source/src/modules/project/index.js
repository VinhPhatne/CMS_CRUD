import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Card, Col, DatePicker, Modal, Row, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import { useNavigate } from 'react-router-dom';
import useNotification from '@hooks/useNotification';
import useFetch from '@hooks/useFetch';
import { DollarTwoTone, FileDoneOutlined } from '@ant-design/icons';
import moment from 'moment';
import DatePickerField from '@components/common/form/DatePickerField';
import { DATE_FORMAT_DISPLAY } from '@constants/index';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { BaseForm } from '@components/common/form/BaseForm';
import SalaryModal from './SalaryModal';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const message = defineMessages({
    objectName: 'Dự Án',
});

const ProjectListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const notification = useNotification();

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [salary, setSalary] = useState();

    const convertUtcToLocalTime = (utcDate, format) => {
        return dayjs.utc(utcDate).local().format(format);
    };

    const stateValues = translate.formatKeys(stateProjectOptions, ['label']);
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const parseDate = (dateString) => {
        return dayjs(dateString, 'DD/MM/YYYY');
    };

    const handleIconClick = (id, isRegisteredSalaryPeriod, registerSalaryPeriod) => {
        if (isRegisteredSalaryPeriod && registerSalaryPeriod && registerSalaryPeriod.dueDate) {
            setSelectedProject({ id, registerSalaryPeriod });
            const parsedDate = dayjs(registerSalaryPeriod.dueDate, 'DD/MM/YYYY');
            if (parsedDate.isValid()) {
                setSelectedDate(parsedDate); 
            } else {
                setSelectedDate(null); 
            }
        } else {
            setSelectedProject({ id });
            setSelectedDate(null); 
        }
        setShowPreviewModal(true);
    };

    const closeModal = () => {
        setShowPreviewModal(false);
        setSelectedProject(null); 
        setSelectedDate(null);
    };

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.project,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };

            funcs.additionalActionColumnButtons = () => {
                return {
                    salary: ({ id, isRegisteredSalaryPeriod, registerSalaryPeriod }) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={handleIconClick}
                            >
                                <DollarTwoTone
                                    twoToneColor={isRegisteredSalaryPeriod ? (registerSalaryPeriod ? 'gray' : 'orange') : 'orange'}
                                />
                            </Button>
                        );
                    },
                };
            };
        },
    });

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            align: 'center',
            width: 80,
            render: (text, record, index) => index + 1,
        },
        {
            title: '#',
            dataIndex: 'avatar',
            align: 'center',
            width: 100,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                />
            ),
        },
        { 
            title: <FormattedMessage defaultMessage="Tên dự án" />, 
            dataIndex: 'name', 
            width: 450,
            render: (name, record) => (
                <a
                    onClick={() => {
                        const projectId = record.id; 
                        const projectName = encodeURIComponent(name); 
                        const url = `/project/project-tab?projectId=${projectId}&projectName=${projectName}&active=true`;
                        navigate(url); 
                    }}
                >
                    {name}
                </a>
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Ngày bắt đầu" />,
            width: 220,
            dataIndex: 'startDate',
            align: 'right',
            render: (startDate) => {
                const createdDateLocal = convertUtcToLocalTime(startDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },

        {
            title: <FormattedMessage defaultMessage="Ngày Kết Thúc" />,
            width: 220,
            dataIndex: 'endDate',
            align: 'right',
            render: (endDate) => {
                const createdDateLocal = convertUtcToLocalTime(endDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Tình trạng" />,
            width: 80,
            dataIndex: 'state',
            render: (state) => {
                const stateOption = stateProjectOptions.find(option => option.value === state);
                return stateOption ? (
                    <Tag color={stateOption.color}>
                        {translate.formatMessage(stateOption.label)}
                    </Tag>
                ) : (
                    <FormattedMessage defaultMessage="Không xác định" />
                );
            },
        },

        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                salary: true,
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    const searchFields = [
        {
            key: 'Tên dự án',
            placeholder: translate.formatMessage(commonMessage.Name),
        },

        {
            key: 'state',
            placeholder: 'Tình trạng',
            type: FieldTypes.SELECT,
            options: stateValues,
        },
        {
            key: 'status',
            placeholder: 'Trạng thái',
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(message.objectName) }]}   >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                    />
                } 
            />
            {/* <SalaryModal
                title={<FormattedMessage defaultMessage="Chọn ngày lương" />}
                width={500}
                open={showPreviewModal}
                onCancel={() => setShowPreviewModal(false)}
                footer={null}
                centered
            >
            </SalaryModal> */}
        </PageWrapper>
    );
};

export default ProjectListPage;