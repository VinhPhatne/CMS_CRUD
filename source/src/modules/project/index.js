import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import { useNavigate } from 'react-router-dom';
import useNotification from '@hooks/useNotification';
import useFetch from '@hooks/useFetch';
import { DollarTwoTone } from '@ant-design/icons';
import DatePickerField from '@components/common/form/DatePickerField';
import { DATE_FORMAT_DISPLAY } from '@constants/index';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { BaseForm } from '@components/common/form/BaseForm';
import useDisclosure from '@hooks/useDisclosure';
import { useForm } from 'antd/es/form/Form';
import { formatDateString } from '@utils/index';
import { convertUtcToLocalTime } from '@utils';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const message = defineMessages({
    objectName: 'Dự án',
});

const ProjectListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const notification = useNotification();

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [salary, setSalary] = useState();
    const [isOpen, { open, close }] = useDisclosure();
    const [isEditing, setIsEditing] = useState(false);

    const [form] = useForm();

    const { loading: fetchingDate, execute: fetchSalaryPeriodDate } = useFetch(
        apiConfig.registerSalaryPeriod.getNewSalaryPeriodDate,
        {
            immediate: false,
            mappingData: ({ data }) => data.dueDate,
        },
    );

    const { execute: registerSalary } = useFetch(apiConfig.registerSalaryPeriod.create, {
        immediate: false,
    });
    const { execute: updateRegisterSalary } = useFetch(apiConfig.registerSalaryPeriod.update, {
        immediate: false,
    });

    const stateValues = translate.formatKeys(stateProjectOptions, ['label']);
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const handleIconClick = async (id, dueDate, registerSalaryId) => {
        dueDate != null ? setIsEditing(true) : setIsEditing(false);
        registerSalaryId != null ? setSalary(registerSalaryId) : null;

        setSelectedProject(id);
        try {
            const result = await fetchSalaryPeriodDate({
                pathParams: { projectId: id },
                onCompleted: (data) => {
                    if (data.data) {
                        setSelectedDate(dayjs(data.data, DATE_FORMAT_DISPLAY));
                    } else {
                        setSelectedDate(null);
                    }
                    open();
                },
                onError: (error) => {
                    notification({
                        type: 'error',
                        title: 'Error',
                        message: error.message || 'Failed to fetch salary period date.',
                    });
                },
            });
            if (dueDate) {
                form.setFieldsValue({
                    dueDate: dayjs(dueDate, DATE_FORMAT_DISPLAY),
                });
            } else {
                form.resetFields();
            }
        } catch (error) {
            console.error('Failed to fetch salary period date:', error.message);
        }
    };

    const handleSubmit = async (values) => {
        values.dueDate = formatDateString(values.dueDate, DEFAULT_FORMAT);
        if (!isEditing) {
            const dataCreate = {
                ...values,
                selectedProject,
            };
            try {
                await registerSalary({
                    method: 'POST',
                    data: dataCreate,
                    onCompleted: (response) => {
                        window.location.reload();
                        close();
                    },
                    onError: (error) => {
                        console.error('Error creating task:', error);
                    },
                });
            } catch (error) {
                console.error('Error saving task:', error);
            }
        } else {
            const dataUpdate = {
                ...values,
                id: salary,
            };
            try {
                await updateRegisterSalary({
                    method: 'PUT',
                    data: dataUpdate,
                    onCompleted: (response) => {
                        window.location.reload();
                        close();
                    },
                    onError: (error) => {
                        console.error('Error creating task:', error);
                    },
                });
            } catch (error) {
                console.error('Error saving task:', error);
            }
        }
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
                        const dueDate = isRegisteredSalaryPeriod ? registerSalaryPeriod.dueDate : null;
                        const registerSalaryId = isRegisteredSalaryPeriod ? registerSalaryPeriod.id : null;
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => handleIconClick(id, dueDate, registerSalaryId)}
                            >
                                <DollarTwoTone
                                    twoToneColor={
                                        isRegisteredSalaryPeriod ? (registerSalaryPeriod ? 'gray' : 'orange') : 'orange'
                                    }
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
            width: 40,
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
                const stateOption = stateProjectOptions.find((option) => option.value === state);
                return stateOption ? (
                    <Tag color={stateOption.color}>{translate.formatMessage(stateOption.label)}</Tag>
                ) : (
                    <FormattedMessage defaultMessage="Không xác định" />
                );
            },
        },

        //mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                salary: true,
                edit: true,
                delete: true,
            },
            { width: '180px' },
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
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(message.objectName) }]}>
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
            <Modal
                title={isEditing ? 'Cập nhật tính lương dự án' : 'Đăng ký tính lương dự án'}
                open={isOpen}
                onCancel={close}
                footer={null}
            >
                <BaseForm onFinish={handleSubmit} form={form} style={{ margin: 0 }}>
                    <DatePickerField
                        name="dueDate"
                        label={<FormattedMessage defaultMessage="Ngày kết thúc" />}
                        format={DATE_FORMAT_DISPLAY}
                        disabledDate={(current) => current && current <= selectedDate.startOf('day')}
                        style={{ width: '100%' }}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn kết thúc',
                            },
                        ]}
                    />
                    <Button onClick={close} style={{ marginRight: '16px' }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                        {isEditing ? 'Cập nhật' : 'Đăng ký'}
                    </Button>
                </BaseForm>
            </Modal>
        </PageWrapper>
    );
};

export default ProjectListPage;
