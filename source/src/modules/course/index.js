import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { stateCourseOptions } from '@constants/masterData';
const message = defineMessages({
    objectName: 'course',
});

const CourseListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const notification = useNotification();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const { execute: executeUpdateNewsPin, loading: updateNewsPinLoading } = useFetch(apiConfig.courses.update);

    const { formatMessage } = useIntl();

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.courses,
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
                if (!mixinFuncs.hasPermission([apiConfig.courses.getById.baseURL])) return {};
                return {
                    registration: ({ id, name, state, status }) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    navigate(
                                        `/course/registration?courseId=${id}&courseName=${encodeURIComponent(
                                            name,
                                        )}&courseState=${state}&courseStatus=${status}`,
                                    );
                                }}
                            >
                                <UsergroupDeleteOutlined />
                            </Button>
                        );
                    },
                };
            };
        },
    });

    const formatMoney = (amount) => {
        if (isNaN(amount)) {
            return 'Invalid amount';
        }
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

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
            width: 70,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                />
            ),
        },
        { title: <FormattedMessage defaultMessage="Tên Khóa Học" />, dataIndex: 'name', width: 200 },
        {
            title: <FormattedMessage defaultMessage="Tên môn học" />,
            width: 300,
            dataIndex: ['subject', 'subjectName'],
            render: (subjectName, record) => (
                <div>
                    <div>{record.subject?.subjectName}</div>
                    <div>{record.leader?.account?.fullName}</div>
                </div>
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Học phí" />,
            dataIndex: 'fee',
            align: 'right',
            render: (fee) => formatMoney(fee),
        },
        {
            title: <FormattedMessage defaultMessage="Ngày kết thúc" />,
            width: 180,
            dataIndex: 'dateEnd',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage id="courseListPage.status" defaultMessage="Trạng thái" />,
            width: 180,
            dataIndex: 'state',
            align: 'center',
            render: (state) => {
                const stateOption = stateCourseOptions.find((option) => option.value === state);
                return stateOption ? (
                    <Tag color={stateOption.color}>{translate.formatMessage(stateOption.label)}</Tag>
                ) : (
                    <FormattedMessage id="courseListPage.unknownStatus" defaultMessage="Không xác định" />
                );
            },
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                registration: {
                    permissions: apiConfig.courses.getById.baseURL,
                },
                edit: true,
                delete: true,
            },
            { width: '180px' },
        ),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.nameCourses),
        },
        {
            key: 'status',
            placeholder: translate.formatMessage(commonMessage.status),
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.course) }]}>
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
        </PageWrapper>
    );
};

export default CourseListPage;
