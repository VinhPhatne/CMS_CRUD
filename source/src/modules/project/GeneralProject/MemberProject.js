import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { Button, Tag, Tooltip } from 'antd';
import BaseTable from '@components/common/table/BaseTable';
import { convertUtcToLocalTime } from '@utils';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { commonMessage } from '@locales/intl';
import { FieldTypes } from '@constants/formConfig';
import { stateProjectOptions, statusOptions } from '@constants/masterData';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import axios from 'axios';
import useFetch from '@hooks/useFetch';
import { useLocation } from 'react-router-dom';
import AvatarField from '@components/common/form/AvatarField';
import { UserOutlined } from '@ant-design/icons';

const messages = defineMessages({
    objectName: {
        id: 'generalProjectPage.objectName',
        defaultMessage: 'Cài đặt chung',
    },
});

const MemberProject = ({ projectId }) => {
    const translate = useTranslate();
    const intl = useIntl();

    const location = useLocation();
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
        apiConfig: apiConfig.memberProject,
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
                let currentPath = window.location.pathname;
                if (currentPath.includes('/project-tab')) {
                    currentPath = currentPath.replace('/project-tab', '');
                }
                return `${currentPath}/member/${dataRow.id}?${searchParams.toString()}`;
            };

            funcs.getCreateLink = () => {
                const searchParams = new URLSearchParams(window.location.search);
                let currentPath = window.location.pathname;
                if (currentPath.includes('/project-tab')) {
                    currentPath = currentPath.replace('/project-tab', '');
                }
                return `${currentPath}/member/create?${searchParams.toString()}`;
            };
        },
    });

    const columnsStory = [
        {
            title: '#',
            dataIndex: ['developer', 'accountDto', 'avatar'],
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
            title: <FormattedMessage defaultMessage="Họ và tên" />,
            dataIndex: ['developer', 'accountDto', 'fullName'],
            width: 550,
        },
        {
            title: <FormattedMessage defaultMessage="Vai trò" />,
            dataIndex: ['projectRole', 'projectRoleName'],
            width: 200,
            align: 'center',
        },
        {
            title: <FormattedMessage defaultMessage="Trả lương" />,
            width: 100,
            dataIndex: 'isPaid',
            align: 'center',
            render: (isPaid) => {
                return isPaid ? (
                    <Tag color="green">
                        <FormattedMessage defaultMessage="Có trả lương" />
                    </Tag>
                ) : (
                    <Tag color="yellow">
                        <FormattedMessage defaultMessage="Không trả lương" />
                    </Tag>
                );
            },
        },
        {
            title: 'Lịch trình',
            dataIndex: 'schedule',
            align: 'center',
            render: (scheduleData) => {
                let parsedSchedule = {};
                try {
                    parsedSchedule = JSON.parse(scheduleData);
                } catch (e) {
                    console.error('Error parsing schedule data:', e);
                    return null;
                }

                const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                const dayMap = {
                    t2: 0,
                    t3: 1,
                    t4: 2,
                    t5: 3,
                    t6: 4,
                    t7: 5,
                    cn: 6,
                };

                return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {daysOfWeek.map((day, index) => {
                            const isToday = index === (new Date().getDay() + 6) % 7;
                            const dayKey = Object.keys(dayMap).find((key) => dayMap[key] === index);
                            const hasSchedule = dayKey && parsedSchedule[dayKey];
                            const scheduleTime = hasSchedule ? parsedSchedule[dayKey] : null;

                            return (
                                <Tooltip key={index} title={scheduleTime || 'No schedule'} placement="top">
                                    <div
                                        key={index}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            border: `2px solid ${isToday ? 'red' : 'black'}`,
                                            color: `${isToday ? 'red' : 'black'}`,
                                            marginRight: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            boxSizing: 'border-box',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {hasSchedule ? daysOfWeek[index] : ''}
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>
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

    const handleSearch = (values) => {
        const params = new URLSearchParams(location.search);
        params.set('developerId', values.developerId || '');
        params.set('status', values.status || '');
        history.push({ search: params.toString() });
    };

    return (
        <>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    initialValues: queryFilter,
                    onSearch: handleSearch,
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

export default MemberProject;
