import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag } from 'antd';
import React from 'react';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { statusOptions } from '@constants/masterData';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import DatePickerField from '@components/common/form/DatePickerField';
import routes from '../routes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const message = defineMessages({
    objectName: 'day off',
});

dayjs.extend(customParseFormat);

const DeveloperDayOffPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { pathname: pagePath } = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const developerId = queryParams.get('developerId');
    const developerName = queryParams.get('developerName');

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
            funcs.getCreateLink = () => {
                return `${pagePath}/create?developerId=${developerId}&developerName=${developerName}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                const currentUrl = new URL(window.location.href);
                const searchParams = currentUrl.searchParams.toString();
                return `${pagePath}/${dataRow.id}?${searchParams}`;
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
        {
            title: <FormattedMessage defaultMessage="Tổng thời gian" />,
            dataIndex: 'totalHour',
            align: 'center',
            width: 150,
        },
        { title: <FormattedMessage defaultMessage="Lý do" />, dataIndex: 'note', align: 'center', width: 150 },

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
            key: 'fromDate',
            placeholder: 'Từ ngày',
            type: FieldTypes.DATE,
            format: DATE_FORMAT_DISPLAY, // Định dạng hiển thị
        },
        {
            key: 'toDate',
            placeholder: 'Tới ngày',
            type: FieldTypes.DATE,
            format: DATE_FORMAT_DISPLAY, // Định dạng hiển thị
        },
    ];

    const handleSearch = (filters) => {
        const { fromDate, toDate } = filters;
        let queryParams = new URLSearchParams(location.search);

        if (fromDate) {
            // Chuyển đổi từ ngày với định dạng mới
            const formattedStartDate = dayjs(fromDate, DATE_FORMAT_VALUE).format('YYYY-MM-DD'); // Thay đổi định dạng ở đây
            queryParams.set('fromDate', formattedStartDate);
        }

        if (toDate) {
            // Chuyển đổi đến ngày với định dạng mới
            const formattedEndDate = dayjs(toDate, DATE_FORMAT_VALUE).format('YYYY-MM-DD'); // Thay đổi định dạng ở đây
            queryParams.set('toDate', formattedEndDate);
        }

        // Cập nhật URL với các tham số truy vấn mới
        navigate(`${pagePath}?${queryParams.toString()}`);
    };

    return (
        <PageWrapper
            routes={[
                {
                    breadcrumbName: translate.formatMessage(commonMessage.developer),
                    path: routes.DeveloperListPage.path,
                },
                {
                    breadcrumbName: translate.formatMessage(commonMessage.dayOff),
                },
            ]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                    onSubmit: handleSearch,
                })}
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
