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
import { Link, useNavigate } from 'react-router-dom';
import { stateCourseOptions } from '@constants/masterData';
const message = defineMessages({
    objectName: 'subject',
});

const SubjectListPage = () => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.subject,
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
        },
    });

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
            title: <FormattedMessage defaultMessage="Tên môn học" />,
            dataIndex: 'subjectName',
            render: (subjectName, record) => {
                console.log(record);
                return (
                    <Link to={`/subject/lecture/${record.id}?subjectName=${record.subjectName}`}>{subjectName}</Link>
                );
            },
        },
        {
            title: <FormattedMessage defaultMessage="Mã môn học" />,
            width: 300,
            dataIndex: 'subjectCode',
        },
        {
            title: <FormattedMessage defaultMessage="Ngày tạo" />,
            width: 180,
            dataIndex: 'createdDate',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
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
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.subject) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        rowKey={(record) => record.id}
                    />
                }
            />
        </PageWrapper>
    );
};

export default SubjectListPage;
