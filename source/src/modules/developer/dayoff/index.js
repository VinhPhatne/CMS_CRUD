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
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { stateCourseOptions } from '@constants/masterData';
const message = defineMessages({
    objectName: 'course',
});

const DeveloperDayOffPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.dayOff,
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
            title: <FormattedMessage defaultMessage="Ngày bắt đầu" />,
            width: 200,
            dataIndex: 'startDate',
            align: 'left',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Ngày kết thúc" />,
            width: 200,
            dataIndex: 'endDate',
            align: 'left',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        { title: <FormattedMessage defaultMessage="Tổng thời gian" />, dataIndex: 'totalHour',align: 'center', width: 150 },
        { title: <FormattedMessage defaultMessage="Lý do" />, dataIndex: 'note',align: 'center', width: 150 },

        {
            title: <FormattedMessage defaultMessage="Loại" />,
            width: 180,
            dataIndex: 'isCharged',
            align: 'center',
            render: (isCharged) => {
                if (isCharged) {
                    return <Tag color="red">Trừ tiền</Tag>;
                } else {
                    return <Tag color="green">Không trừ tiền</Tag>;
                }
            },
        },
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
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
        </PageWrapper>
    );
};

export default DeveloperDayOffPage;
