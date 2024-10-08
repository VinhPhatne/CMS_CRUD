import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { PlusSquareOutlined } from '@ant-design/icons';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { stateResgistration } from '@constants/masterData';
import useTranslate from '@hooks/useTranslate';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldTypes } from '@constants/formConfig';
import { commonMessage } from '@locales/intl';
import routes from '../routes';

const message = defineMessages({
    objectName: 'Registration Course',
});

const CourseRegistration = () => {
    const translate = useTranslate();
    const navigate = useNavigate();

    const location = useLocation();
    const stateValues = translate.formatKeys(stateResgistration, ['label']);

    const queryParams = new URLSearchParams(location.search);
    const studentId = queryParams.get('studentId');
    const studentName = queryParams.get('studentName');

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.registration,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content.map((item) => ({
                            ...item,
                            registrationId: item.id,
                            courseName: item.courseName,
                            courseState: item.state,
                        })),
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.additionalActionColumnButtons = () => {
                return {
                    registration: (record) => {
                        const { registrationId, courseName, courseState } = record;

                        return (
                            <Button
                                type="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                    navigate(
                                        `/student/registration-project?studentId=${studentId}&studentName=${encodeURIComponent(
                                            studentName,
                                        )}&registrationId=${registrationId}&courseName=${encodeURIComponent(
                                            courseName,
                                        )}&courseState=${courseState}`,
                                    );
                                }}
                            >
                                <PlusSquareOutlined />
                            </Button>
                        );
                    },
                };
            };
        },
    });

    const columns = [
        {
            title: 'Tên khoá học',
            dataIndex: 'courseName',
            width: 150,
        },
        {
            title: <FormattedMessage defaultMessage="Tổng dự án" />,
            dataIndex: 'totalProject',
            align: 'center',
            width: 120,
            render: (totalProject, record) => {
                const { minusTrainingProjectMoney } = record;

                return (
                    <>
                        <div>{`${totalProject}/3`}</div>
                    </>
                );
            },
        },
        {
            title: <FormattedMessage defaultMessage="Tỉ lệ đào tạo" />,
            dataIndex: 'Tốt',
            width: 120,
            //dataIndex: 'studentName',
        },
        {
            title: <FormattedMessage defaultMessage="Tỉ lệ dự án" />,
            dataIndex: 'Tốt',
            width: 120,
            //dataIndex: 'studentName',
        },
        {
            title: 'Lịch trình',
            dataIndex: 'schedule',
            width: 200,
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
                                <Tooltip
                                    key={index}
                                    title={scheduleTime || 'No schedule'} // Show time if available
                                    placement="top"
                                >
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
        {
            title: <FormattedMessage defaultMessage="Trạng thái" />,
            width: 180,
            dataIndex: 'state',
            align: 'center',
            render: (state) => {
                const stateOption = stateResgistration.find((option) => option.value === state);
                return stateOption ? (
                    <Tag color={stateOption.color}>{translate.formatMessage(stateOption.label)}</Tag>
                ) : (
                    <FormattedMessage id="courseListPage.unknownStatus" defaultMessage="Không xác định" />
                );
            },
        },
        mixinFuncs.renderActionColumn(
            {
                registration: true,
                edit: true,
                delete: true,
            },
            { width: '180px', fixed: 'right' },
        ),
    ];

    const searchFields = [
        {
            key: 'state',
            placeholder: translate.formatMessage(commonMessage.state),
            type: FieldTypes.SELECT,
            options: stateValues,
        },
    ];

    const [searchValues, setSearchValues] = useState({});

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const state = params.get('state');
        const studentId = params.get('studentId');
        const studentName = params.get('studentName');
    
        mixinFuncs.getList({ state, studentId, studentName });
    }, [location.search]);

    const handleSearch = (values) => {
        const params = new URLSearchParams(location.search);
    
        // Giữ lại tất cả các tham số hiện tại trong URL
        const studentId = params.get('studentId') || '';
        const studentName = params.get('studentName') || '';
    
        // Cập nhật tham số 'state' từ form tìm kiếm
        params.set('state', values.state || '');
    
        // Giữ lại các tham số khác
        params.set('studentId', studentId);
        params.set('studentName', studentName);
    
        // Điều hướng với URL mới chứa đầy đủ tham số
        navigate({ search: params.toString() });
    };

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.student), path: routes.StudentListPage.path },
                { breadcrumbName: translate.formatMessage(commonMessage.course) },
            ]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ 
                    fields: searchFields,
                    initialValues: queryFilter, 
                    onSearch: handleSearch,
                })}
                title={studentName}
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

export default CourseRegistration;
