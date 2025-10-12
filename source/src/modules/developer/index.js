import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined, UsergroupDeleteOutlined, BulbOutlined, FieldTimeOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE_XL } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { salaryKindOptions, statusOptions } from '@constants/masterData';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
const message = defineMessages({
    objectName: 'course',
});

const DeveloperListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const salaryValues = translate.formatKeys(salaryKindOptions, ['label']);

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.developer,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE_XL,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content.map((item) => ({
                            ...item,
                            name: item.accountDto?.fullName,
                        })),
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.additionalActionColumnButtons = () => {
                if (!mixinFuncs.hasPermission([apiConfig.courses.getById.baseURL])) return {};
                return {
                    project: (record) => {
                        const { id, name } = record;
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    navigate(
                                        `/developer/project?developerId=${id}&developerName=${encodeURIComponent(
                                            name,
                                        )}`,
                                    );
                                }}
                            >
                                <BulbOutlined />
                            </Button>
                        );
                    },
                    dayOff: (record) => {
                        const { id, name } = record;
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    navigate(
                                        `/developer/day-off-log?developerId=${id}&developerName=${encodeURIComponent(
                                            name,
                                        )}`,
                                    );
                                }}
                            >
                                <FieldTimeOutlined />
                            </Button>
                        );
                    },
                };
            };
            // funcs.additionalActionColumnButtons = () => {
            //     if (!mixinFuncs.hasPermission([apiConfig.courses.getById.baseURL])) return {};
            //     return {
            //         dayOff: (record) => {
            //             const { id, name } = record;
            //             return (
            //                 <Button
            //                     type="link"
            //                     style={{ padding: 0 }}
            //                     onClick={() => {
            //                         navigate(
            //                             `/developer/day-off-log?developerId=${id}&developerName=${encodeURIComponent(
            //                                 name,
            //                             )}`,
            //                         );
            //                     }}
            //                 >
            //                     <FieldTimeOutlined />
            //                 </Button>
            //             );
            //         },
            //     };
            // };
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
            dataIndex: ['accountDto', 'avatar'],
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
        { title: <FormattedMessage defaultMessage="Họ và tên" />, dataIndex: ['accountDto', 'fullName'], width: 200 },
        {
            title: <FormattedMessage defaultMessage="Vai trò" />,
            width: 150,
            dataIndex: ['developerRole', 'categoryName'],
        },
        {
            title: <FormattedMessage defaultMessage="Lương cứng" />,
            dataIndex: 'salary',
            align: 'right',
            width: 150,
            render: (fee) => formatMoney(fee),
        },
        {
            title: <FormattedMessage defaultMessage="Lương theo giờ	" />,
            dataIndex: 'hourlySalary',
            align: 'right',
            width: 150,
            render: (fee) => formatMoney(fee),
        },
        {
            title: <FormattedMessage defaultMessage="Số điện thoại" />,
            dataIndex: ['accountDto', 'phone'],
            width: 200,
            align: 'center',
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
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                project: true,
                dayOff: true,
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
            key: 'salaryKind',
            placeholder: translate.formatMessage(commonMessage.kind),
            type: FieldTypes.SELECT,
            options: salaryValues,
        },
        {
            key: 'status',
            placeholder: translate.formatMessage(commonMessage.status),
            type: FieldTypes.SELECT,
            options: statusValues,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.developer) }]}>
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

export default DeveloperListPage;
