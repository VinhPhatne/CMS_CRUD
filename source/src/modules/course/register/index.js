import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { stateResgistration } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
const message = defineMessages({
    objectName: 'course',
});

const RegistrationCourseListPage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const notification = useNotification();
    const statusValues = translate.formatKeys(stateResgistration, ['label']);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const { execute: executeUpdateNewsPin, loading: updateNewsPinLoading } = useFetch(apiConfig.courses.update);

    const location = useLocation();

    const { pathname: pagePath } = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const courseId = queryParams.get('courseId');
    const courseName = queryParams.get('courseName');
    const courseState = queryParams.get('courseState');
    const courseStatus = queryParams.get('courseStatus');

    console.log("check param >> ",courseId, courseName, courseState, courseStatus);
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.registration,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    console.log('Dataaaa >>> ', response.data.content);
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.getItemDetailLink = (dataRow) => {
                const currentUrl = new URL(window.location.href);
                const searchParams = currentUrl.searchParams.toString();
                return `${pagePath}/${dataRow.id}?${searchParams}`;
            };

            funcs.getCreateLink = () => {
                const currentUrl = new URL(window.location.href);
                const searchParams = currentUrl.searchParams.toString();
                return `${pagePath}/create?${searchParams}`;
            };
        },  
    });

    const formatMoney = (amount) => {
        if (isNaN(amount)) {
            return 'Invalid amount';
        }
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'avatar',
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
            title: 'Tên sinh viên',
            dataIndex: 'studentName', 
        },
        {
            title: <FormattedMessage defaultMessage="Giá khóa học" />,
            dataIndex: 'courseFee',
            render: (fee) => formatMoney(fee),
        },
        {
            title: <FormattedMessage defaultMessage="Số tiền đã đóng" />,
            dataIndex: 'totalMoneyInput',
            render: (fee) => formatMoney(fee),
        },
        {
            title: <FormattedMessage defaultMessage="Tổng dự án" />,
            dataIndex: 'totalProject',
            render: (totalProject, record) => {
                const { minusTrainingProjectMoney } = record; 
        
                return (
                    <>
                        <div>{`${totalProject}/3`}</div>
                        {minusTrainingProjectMoney !== 0 && (
                            <div style={{ color: 'orange' }}>
                                {minusTrainingProjectMoney.toLocaleString()} đ
                            </div>
                        )}
                    </>
                );
            },
        },
        {
            title: <FormattedMessage defaultMessage="Tỉ lệ đào tạo" />,
            dataIndex: 'totalLearnCourseTime',
            render: (time, record) => `${Math.round((time / record.totalAssignedCourseTime) * 100)}%`,
        },
        {
            title: <FormattedMessage defaultMessage="Tỉ lệ dự án" />,
            dataIndex: 'studentName',
        },
        {
            title: 'Lịch trình',
            dataIndex: 'schedule',
            render: (scheduleData) => {
                const today = (new Date().getDay() + 6) % 7; 
                const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; 
                const fullDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; 
        
                return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        {fullDaysOfWeek.map((day, index) => {
                            const isToday = index === today; 
                            const hasSchedule = scheduleData[index];
        
                            return (
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
                                    }}
                                    title={day} 
                                >
                                    {hasSchedule ? daysOfWeek[index] : ''} 
                                </div>
                            );
                        })}
                    </div>
                );
            },
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: translate.formatMessage(commonMessage.news) }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                    />
                }
            />
            <Modal
                title={<FormattedMessage defaultMessage="Preview" />}
                width={1000}
                open={showPreviewModal}
                footer={null}
                centered
                onCancel={() => setShowPreviewModal(false)}
            ></Modal>
        </PageWrapper>
    );
};

export default RegistrationCourseListPage;
