import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { Button, Tag } from 'antd';
import BaseTable from '@components/common/table/BaseTable';
import { convertUtcToLocalTime } from '@utils';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import ListPage from '@components/common/layout/ListPage';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';


const StoryProject = ({ projectId, activeTab }) => {
    const translate = useTranslate();

    const location = useLocation();
    const navigate = useNavigate();
    const stateValues = translate.formatKeys(stateProjectOptions, ['label']);
    const [searchValues, setSearchValues] = useState({});

    const storageKey = `searchValues_${activeTab}`;

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
            render: (name, record) => {
                const params = new URLSearchParams(location.search);
                const projectId = params.get('projectId');
                const projectName = encodeURIComponent(params.get('projectName'));
                const storyId = record.id;
                const storyName = encodeURIComponent(name);
                const url = `/project/task?projectId=${projectId}&storyId=${storyId}&storyName=${storyName}&active=true&projectName=${projectName}`;
                return <a onClick={() => navigate(url)}>{name}</a>;
            },
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
            placeholder: translate.formatMessage(commonMessage.developerName),
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
        localStorage.setItem(storageKey, JSON.stringify(values));
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
        localStorage.removeItem(storageKey);
    };

    useEffect(() => {
        const savedSearchValues = JSON.parse(localStorage.getItem(storageKey)) || {};
        setSearchValues(savedSearchValues);

        const params = new URLSearchParams(location.search);
        const developerId = params.get('developerId');
        const status = params.get('status');
        mixinFuncs.getList({ developerId, status });
    }, [location.search, activeTab]);

    return (
        <>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: searchValues,
                    onSearch: handleSearch,
                    onReset: handleReset,
                    activeTab: activeTab,
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
