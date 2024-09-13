import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { Button, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import BaseTable from '@components/common/table/BaseTable';
import { convertUtcToLocalTime } from '@utils';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { commonMessage } from '@locales/intl';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import ListPage from '@components/common/layout/ListPage';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';

const TestPlan = ({ projectId }) => {
    const translate = useTranslate();

    const location = useLocation();
    const navigate = useNavigate();

    const {
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
        apiConfig: apiConfig.testPlan,
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
                return `/project/test-plan/${dataRow.id}?${searchParams.toString()}`;
            };

            funcs.getCreateLink = () => {
                const searchParams = new URLSearchParams(window.location.search);
                return `/project/test-plan/create?${searchParams.toString()}`;
            };
        },
    });

    const columnsStory = [
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
            title: <FormattedMessage defaultMessage="Test Plan" />,
            dataIndex: 'name',
            width: 400,
        },
        {
            title: <FormattedMessage defaultMessage="Ngày tạo" />,
            width: 400,
            dataIndex: 'createdDate',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Đạt" />,
            dataIndex: 'totalTestCasePassed',
            width: 200,
            align: 'center',
            render: (value) => value || 0,
        },
        {
            title: <FormattedMessage defaultMessage="Không đạt" />,
            dataIndex: 'totalTestCaseFailed',
            width: 200,
            align: 'center',
            render: (value) => (
                <span style={{ color: 'red' }}>
                    {value || 0}
                </span>
            ),
        },
        {
            title: <FormattedMessage defaultMessage="Tổng" />,
            dataIndex: 'totalTestCase',
            width: 200,
            align: 'center',
            render: (value) => value || 0,
        },
        {
            title: <FormattedMessage defaultMessage="Kết quả" />,
            dataIndex: 'totalTestCase',
            width: 200,
            align: 'center',
            render: (text, record) => {
                if (record.totalTestCaseFailed) {
                    return <span style={{ color: 'red' }}>X</span>;
                } else {
                    return <span style={{ color: 'grey' }}>__</span>;
                }
            },
        },
        mixinFuncs.renderStatusColumn(),
        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.testPlan),
        },
    ];

    const handleSearch = (values) => {
        const params = new URLSearchParams(location.search);
        params.set('name', values.name || '');
        navigate({ search: params.toString() });
    };

    const handleReset = (values) => {
        const params = new URLSearchParams(location.search);

        if (params.has('name')) {
            params.delete('name');
        }

        navigate({ search: params.toString() });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const name = params.get('name');

        mixinFuncs.getList({ name });
    }, [location.search]);

    const handleNavigate = () => {
        const queryParams = new URLSearchParams(location.search);
        const projectName = queryParams.get('projectName');
        const projectId = queryParams.get('projectId');
        const storyName = queryParams.get('storyName');
        const storyId = queryParams.get('storyId');
        const active = true;

        navigate(`/project/task/summary-bug?projectId=${projectId}&storyId=${storyId}&storyName=${storyName}&active=${active}&projectName=${projectName}`);
    };

    return (
        <>
            <Button 
                onClick={handleNavigate}
                type="primary"  style={{ marginBottom : "8px", marginLeft: "950px" }}>Tổng hợp bug

            </Button>
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

export default TestPlan;
