import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import {
    AppConstants,
    categoryKind,
    DEFAULT_FORMAT,
    DEFAULT_TABLE_ITEM_SIZE,
    DEFAULT_TABLE_ITEM_SIZE_XL,
} from '@constants';
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
import Icon from '@ant-design/icons/lib/components/Icon';

const message = defineMessages({
    objectName: 'course',
});

const StudentListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.student,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE_XL,
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
                if (!mixinFuncs.hasPermission([apiConfig.registration.getById.baseURL])) return {};
                return {
                    registration: ({ studentId, studentName }) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    navigate(
                                        `/student/course?studentId=${studentId}&studentName=${encodeURIComponent(
                                            studentName,
                                        )}`,
                                    );
                                }}
                            >
                                <Icon type="account-book" theme="twoTone" />
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
        return new Intl.NumberFormat('USA', {
            style: 'currency',
            currency: 'USD',
            useGrouping: false,
        }).format(amount);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            align: 'center',
            width: 40,
            render: (text, record, index) => {
                const { current, pageSize } = pagination;
                return (current - 1) * pageSize + index + 1;
            },
        },
        {
            title: '#',
            dataIndex: ['account', 'avatar'],
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
        { title: <FormattedMessage defaultMessage="Họ và tên" />, dataIndex: ['account', 'fullName'], width: 200 },
        { title: <FormattedMessage defaultMessage="Ngày sinh" />, dataIndex: ['account', 'birthday'], width: 200 },
        { title: <FormattedMessage defaultMessage="Số điện thoại" />, dataIndex: ['account', 'phone'], width: 150 },
        { title: <FormattedMessage defaultMessage="Email" />, dataIndex: ['account', 'email'], width: 200 },
        { title: <FormattedMessage defaultMessage="Trường" />, dataIndex: ['university', 'categoryName'], width: 500 },
        { title: <FormattedMessage defaultMessage="Hệ" />, dataIndex: ['studyClass', 'categoryName'], width: 150 },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                registration: true,
                edit: true,
                delete: true,
            },
            { width: '180px', fixed: 'right' },
        ),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.developerName),
        },
        {
            key: 'status',
            placeholder: translate.formatMessage(commonMessage.status),
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.student) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
        </PageWrapper>
    );
};

export default StudentListPage;
