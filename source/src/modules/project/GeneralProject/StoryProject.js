import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { Button, Tag } from 'antd';
import BaseTable from '@components/common/table/BaseTable';
import { convertUtcToLocalTime } from '@utils';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';

const messages = defineMessages({
    objectName: {
        id: 'generalProjectPage.objectName',
        defaultMessage: 'Cài đặt chung',
    },
});

const StoryProject = ({ projectId }) => {
    const translate = useTranslate();
    const intl = useIntl();

    const location = useLocation();
    const navigate = useNavigate();
    const stateValues = translate.formatKeys(stateProjectOptions, ['label']);

    const {
        loading: autoCompleteLoading,
        execute: fetchAutoCompleteData,
        data: autoCompleteData,
    } = useFetch(apiConfig.memberProject.autocomplete, {
        immediate: true,
        params: { projectId },
        mappingData: (response) => {
            return response.data.content.map((item) => ({
                label: item.developer.account.fullName,
                value: item.developer.id,
            }));
        },
    });

    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

    useEffect(() => {
        fetchAutoCompleteData();
    }, [projectId, fetchAutoCompleteData]);

    useEffect(() => {
        if (autoCompleteData) {
            setAutoCompleteOptions(autoCompleteData);
        }
    }, [autoCompleteData]);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.story,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            //objectName: intl.formatMessage(messages.objectName),
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
            funcs.getItemDetailLink = (dataRow) => {
                const searchParams = new URLSearchParams(window.location.search);
                return `/story/task/${dataRow.id}?${searchParams.toString()}`;
            };

            funcs.getCreateLink = () => {
                const searchParams = new URLSearchParams(window.location.search);
                return `/story/task/create?${searchParams.toString()}`;
            };
        },
    });

    const columnsStory = [
        {
            title: <FormattedMessage defaultMessage="Tên story" />,
            dataIndex: 'storyName',
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Người thực hiện" />,
            dataIndex: ['developerInfo', 'account', 'fullName'],
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Ngày tạo" />,
            width: 250,
            dataIndex: 'createdDate',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },

        {
            title: <FormattedMessage defaultMessage="Tình trạng" />,
            width: 100,
            dataIndex: 'state',
            render: (state) => {
                const stateOption = stateProjectOptions.find((option) => option.value === state);

                return stateOption ? (
                    <Tag color={stateOption.color}>{translate.formatMessage(stateOption.label)}</Tag>
                ) : (
                    <Tag color="default">
                        <FormattedMessage defaultMessage="Không xác định" />
                    </Tag>
                );
            },
        },

        mixinFuncs.renderActionColumn(
            //{ editSetting: mixinFuncs.hasPermission([apiConfig.story.update?.baseURL]), delete: false },
            {
                edit: true,
                delete: true,
            },
            { width: '100px' },
        ),
    ];

    const searchFields = [
        {
            key: 'developerId',
            type: FieldTypes.SELECT,
            placeholder: translate.formatMessage(commonMessage.nameCourses),
            options: autoCompleteOptions,
            loading: autoCompleteLoading,
        },
        {
            key: 'status',
            placeholder: translate.formatMessage(commonMessage.status),
            type: FieldTypes.SELECT,
            options: stateValues,
        },
    ];

    const handleSearch = (values) => {
        const params = new URLSearchParams(location.search);
        params.set('developerId', values.developerId || '');
        params.set('status', values.status || '');
        navigate({ search: params.toString() });
    };

    const handleReset = (values) => {
        const params = new URLSearchParams(location.search);

        if (params.has('developerId')) {
            params.delete('developerId');
        }
        if (params.has('status')) {
            params.delete('status');
        }
        navigate({ search: params.toString() });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const developerId = params.get('developerId');
        const status = params.get('status');

        mixinFuncs.getList({ developerId, status });
    }, [location.search]);

    return (
        <>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: queryFilter,
                    onSearch: handleSearch,
                    onReset: handleReset,
                })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columnsStory}
                        dataSource={data}
                        pagination={pagination}
                    />
                }
            />
        </>
    );
};

export default StoryProject;
