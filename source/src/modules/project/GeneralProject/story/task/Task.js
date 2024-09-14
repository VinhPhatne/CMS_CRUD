import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { Button, Modal, Tag } from 'antd';
import BaseTable from '@components/common/table/BaseTable';
import { convertUtcToLocalTime } from '@utils';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import { stateProjectOptions, statusOptions, stateTaskOptions, kindTaskOptions } from '@constants/masterData';
import ListPage from '@components/common/layout/ListPage';
import useFetch from '@hooks/useFetch';
import { useLocation, useNavigate } from 'react-router-dom';
import useDisclosure from '@hooks/useDisclosure';
import BugImage from '@assets/images/iconBug.jpg';
import FeatureImage from '@assets/images/iconFeature.jpg';
import TestCase from '@assets/images/iconTestcase.jpg';

const Task = ({ projectId }) => {
    const translate = useTranslate();
    const location = useLocation();
    const navigate = useNavigate();
    const stateValues = translate.formatKeys(stateProjectOptions, ['label']);
    const kindTaskValues = translate.formatKeys(kindTaskOptions, ['label']);

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

    const { execute: fetchAutoCompleteCategoryData ,data: category } = useFetch(apiConfig.projectCategory.autocomplete, {
        immediate: true,
        params: { projectId },
        mappingData: (response) => {
            return response.data.content.map((item) => ({
                label: item.projectCategoryName,
                value: item.id,
            }));
        },
    });

    const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

    useEffect(() => {
        fetchAutoCompleteData();
    }, [projectId, fetchAutoCompleteData]);

    useEffect(() => {
        fetchAutoCompleteCategoryData();
    }, [projectId, fetchAutoCompleteCategoryData]);

    useEffect(() => {
        if (autoCompleteData) {
            setAutoCompleteOptions(autoCompleteData);
        }
    }, [autoCompleteData]);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.projectTask,
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
                return `/project/task/${dataRow.id}?${searchParams.toString()}`;
            };

            funcs.getCreateLink = () => {
                const searchParams = new URLSearchParams(window.location.search);
                return `/project/task/create?${searchParams.toString()}`;
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
            title: '',
            dataIndex: 'kind',
            align: 'center',
            width: 10,
            render: (kind) => {
                let imageSrc = '';
                switch (kind) {
                                case 1:
                                    imageSrc = FeatureImage; 
                                    break;
                                case 2:
                                    imageSrc = BugImage; 
                                    break;
                                case 3:
                                    imageSrc = TestCase; 
                                    break;
                                default:
                                    imageSrc = ''; 
                }
                return imageSrc ? (
                    <img src={imageSrc} alt="Task kind" style={{ width: '20px', height: '20px' }} />
                ) : null;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Task" />,
            dataIndex: 'taskName',
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Danh mục" />,
            dataIndex: ['projectCategoryInfo', 'projectCategoryName'],
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Lập trình viên" />,
            dataIndex: ['developer', 'account', 'fullName'],
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Ngày bắt đầu" />,
            width: 250,
            dataIndex: 'startDate',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Ngày kết thúc" />,
            width: 250,
            dataIndex: 'dueDate',
            align: 'right',
            render: (createdDate) => {
                const createdDateLocal = convertUtcToLocalTime(createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT);
                return <div>{createdDateLocal}</div>;
            },
        },
        {
            title: <FormattedMessage defaultMessage="Thời gian" />,
            dataIndex: 'timeEstimate',
            width: 300,
        },
        {
            title: <FormattedMessage defaultMessage="Tình trạng" />,
            width: 100,
            dataIndex: 'state',
            render: (state) => {
                const stateOption = stateTaskOptions.find((option) => option.value === state);

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
            { width: '130px' },
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
            key: 'state',
            placeholder: translate.formatMessage(commonMessage.state),
            type: FieldTypes.SELECT,
            options: stateValues,
        },
        {
            key: 'categoryProjectId',
            type: FieldTypes.SELECT,
            placeholder: translate.formatMessage(commonMessage.category),
            options: category,
        },
        {
            key: 'kind',
            placeholder: translate.formatMessage(commonMessage.kind),
            type: FieldTypes.SELECT,
            options: kindTaskValues,
        },
    ];

    const handleSearch = (values) => {
        const params = new URLSearchParams(location.search);
        params.set('developerId', values.developerId || '');
        params.set('state', values.state || '');
        params.set('kind', values.kind || '');
        params.set('categoryProjectId', values.categoryProjectId || '');
        navigate({ search: params.toString() });
    };

    const handleReset = (values) => {
        const params = new URLSearchParams(location.search);

        if (params.has('developerId')) {
            params.delete('developerId');
        }
        if (params.has('state')) {
            params.delete('state');
        }
        if (params.has('kind')) {
            params.delete('kind');
        }
        if (params.has('categoryProjectId')) {
            params.delete('categoryProjectId');
        }
        navigate({ search: params.toString() });
    };

    const [selectedRow, setSselectedRow] = useState(null);
    const [isOpen, { open, close }] = useDisclosure();

    const handleRowClick = (record) => {
        setSselectedRow(record.description);
        open();
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const developerId = params.get('developerId');
        const state = params.get('state');
        const kind = params.get('kind');
        const categoryProjectId = params.get('categoryProjectId');

        mixinFuncs.getList({ developerId, state, kind, categoryProjectId });
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
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
                        onChange={mixinFuncs.changePagination}
                        columns={columnsStory}
                        dataSource={data}
                        pagination={pagination}
                    />
                }
            />
            <>
                <Modal title="Chi tiết task của dự án" open={isOpen} onCancel={close} onOk={close}>
                    <p>Mô tả: {selectedRow}</p>
                </Modal>
            </>
        </>
    );
};

export default Task;
