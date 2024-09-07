import { Button, Card, Checkbox, Col, Form, InputNumber, Row, Space, Table, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { stateResgistration } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT } from '@constants/index';
import { formatDateString } from '@utils/index';
import BaseTable from '@components/common/table/BaseTable';

dayjs.extend(customParseFormat);

const DAYS_OF_WEEK = [
    { key: 't2', label: 'Thứ 2' },
    { key: 't3', label: 'Thứ 3' },
    { key: 't4', label: 'Thứ 4' },
    { key: 't5', label: 'Thứ 5' },
    { key: 't6', label: 'Thứ 6' },
    { key: 't7', label: 'Thứ 7' },
    { key: 'cn', label: 'Chủ Nhật' },
];

const RegisterCourseForm = ({
    formId,
    actions,
    dataDetail,
    onSubmit,
    setIsChangedFormValues,
    categories,
    isEditing,
}) => {
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const { execute: executeStudentSearch } = useFetch(apiConfig.student.autocomplete);

    const queryParams = new URLSearchParams(window.location.search);
    const courseId = queryParams.get('courseId');
    console.log('courseId', courseId);

    const translate = useTranslate();
    const statusValues = translate.formatKeys(stateResgistration, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const [scheduleData, setScheduleData] = useState(
        DAYS_OF_WEEK.map((day) => ({
            key: day.key,
            label: day.label,
            times: [
                { startTime: null, endTime: null },
                { startTime: null, endTime: null },
                { startTime: null, endTime: null },
            ],
        })),
    );

    const [timeValues, setTimeValues] = useState({
        monday: [null, null],
        tuesday: [null, null],
        wednesday: [null, null],
        thursday: [null, null],
        friday: [null, null],
    });

    useEffect(() => {
        if (dataDetail) {
            form.setFieldsValue({
                ...dataDetail,
                studentId: dataDetail?.studentInfo?.id,
                status: dataDetail?.studentInfo?.account?.status,
                contractSign: 'contractSign',
                isIntern: dataDetail?.isIntern,
                state: dataDetail?.state,
                courseId: dataDetail?.courseId,
            });

            const schedule = dataDetail.schedule ? JSON.parse(dataDetail.schedule) : {};
            const updatedScheduleData = DAYS_OF_WEEK.map((day) => {
                if (schedule[day.key]) {
                    const timeRanges = schedule[day.key].split('|').map((range) => {
                        const [startTime, endTime] = range.split('-').map((time) => dayjs(time, 'HH[H]mm'));
                        return { startTime, endTime };
                    });

                    const times = [
                        ...timeRanges,
                        ...Array(3 - timeRanges.length).fill({ startTime: null, endTime: null }),
                    ];

                    return {
                        key: day.key,
                        label: day.label,
                        times,
                    };
                }
                return {
                    key: day.key,
                    label: day.label,
                    times: [
                        { startTime: null, endTime: null },
                        { startTime: null, endTime: null },
                        { startTime: null, endTime: null },
                    ],
                };
            });

            setScheduleData(updatedScheduleData);
        }
    }, [dataDetail, form]);

    const handleTimeChange = (recordKey, index, field, value) => {
        const newScheduleData = scheduleData.map((item) => {
            if (item.key === recordKey) {
                const newTimes = item.times.map((time, i) =>
                    i === index
                        ? {
                            ...time,
                            [field]: value,
                        }
                        : time,
                );
                return {
                    ...item,
                    times: newTimes,
                };
            }
            return item;
        });
        setScheduleData(newScheduleData);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const handleReload = (day) => {
        const newScheduleData = scheduleData.map((item) => {
            if (item.key === day) {
                return {
                    ...item,
                    times: [
                        { startTime: null, endTime: null },
                        { startTime: null, endTime: null },
                        { startTime: null, endTime: null },
                    ],
                };
            }
            return item;
        });
        setScheduleData(newScheduleData);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const handleApplyAll = () => {
        const mondayTimes = scheduleData.find(day => day.key === 't2')?.times || [];
        const newScheduleData = scheduleData.map((item) => {
            if (['t3', 't4', 't5', 't6', 't7', 'cn'].includes(item.key)) {
                return {
                    ...item,
                    times: mondayTimes,
                };
            }
            return item;
        });
        setScheduleData(newScheduleData);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const handleSubmit = (values) => {
        const scheduleObj = scheduleData.reduce((acc, item) => {
            const validTimes = item.times.filter((time) => time.startTime && time.endTime);

            if (validTimes.length > 0) {
                const timeStrings = validTimes
                    .map((time) => `${time.startTime.format('HH[H]mm')}-${time.endTime.format('HH[H]mm')}`)
                    .join('|'); 

                acc[item.key] = timeStrings;
            }
            return acc;
        }, {});

        const scheduleJSON = JSON.stringify(scheduleObj);
        const finalValues = {
            ...values,
            contractSign: 'contractSign',
            courseId: courseId,
            studentId: Number(values.studentId),
            moneyState: 1,
            isIssuedCertify: 1,
            status: dataDetail?.studentInfo?.account?.status,
            schedule: scheduleJSON, 
            state: Number(values.state),
            isIntern: Number(values.isIntern),
        };

        console.log('Form Values:', finalValues);
        return mixinFuncs.handleSubmit(finalValues);
    };

    const initialValues = {
        isIntern: 0,
    };

    const handleCheckboxChange = (e) => {
        form.setFieldsValue({ isIntern: e.target.checked ? 1 : 0 });
    };

    const fetchStudentData = async (studentId) => {
        try {
            const response = await executeStudentSearch({
                name: '', 
                page: 0,
                size: 10,
                pageNumber: 0,
                ignoreRegistration: true,
                courseId: courseId,
            });
    
            const student = response?.data?.content?.find(student => student.account.id === studentId);
            return student;
        } catch (error) {
            console.error('Error fetching student data:', error);
            return null;
        }
    };

    const handleStudentIdChange = async (value) => {
        const student = await fetchStudentData(value);
        if (student) {
            form.setFieldsValue({
                studentId: student.account.id,
            });
        } else {
            form.setFieldsValue({
                studentId: value,
            });
        }
    };

    const columns = [
        {
            title: 'Thứ',
            dataIndex: 'label',
            width: '10%',
        },
        {
            title: 'Khung 1',
            dataIndex: 'times',
            render: (times = [], record) => (
                <Space direction="vertical">
                    <Space>
                        <TimePicker
                            value={times[0]?.startTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 0, 'startTime', value)}
                        />
                        <TimePicker
                            value={times[0]?.endTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 0, 'endTime', value)}
                        />
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Khung 2',
            dataIndex: 'times',
            render: (times = [], record) => (
                <Space direction="vertical">
                    <Space>
                        <TimePicker
                            value={times[1]?.startTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 1, 'startTime', value)}
                        />
                        <TimePicker
                            value={times[1]?.endTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 1, 'endTime', value)}
                        />
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Khung 3',
            dataIndex: 'times',
            render: (times = [], record) => (
                <Space direction="vertical">
                    <Space>
                        <TimePicker
                            value={times[2]?.startTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 2, 'startTime', value)}
                        />
                        <TimePicker
                            value={times[2]?.endTime}
                            format="HH:mm"
                            onChange={(value) => handleTimeChange(record.key, 2, 'endTime', value)}
                        />
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            render: (_, record) => (
                <Button onClick={() => handleReload(record.key)}>Reload</Button>
            ),
        },
    ];

    return (
        <BaseForm
            id={formId}
            onFinish={handleSubmit}
            form={form}
            onValuesChange={onValuesChange}
            initialValues={initialValues}
        >
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Tên sinh viên" />}
                            name={['studentId']}
                            apiConfig={apiConfig.student.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.account?.fullName })}
                            searchParams={(text) => ({
                                name: text,
                                page: 0, 
                                size: 10, 
                                pageNumber: 0, 
                                ignoreRegistration: true,
                                courseId: courseId,
                            })}
                            onChange={handleStudentIdChange}
                            required
                            disabled={isEditing}
                        />

                    </Col>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Tình trạng" />}
                            name="state"
                            options={statusValues}
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Form.Item
                        label={<FormattedMessage defaultMessage="Đăng kí thực tập" />}
                        name="isIntern"
                        valuePropName="checked"
                    >
                        <Checkbox onChange={handleCheckboxChange} />
                    </Form.Item>
                </Row>
                <Button onClick={handleApplyAll}>Áp dụng tất cả</Button>
                <Table
                    columns={columns}
                    dataSource={scheduleData}
                    pagination={false}
                    bordered
                    size="middle"
                    style={{ width: '100%' }}
                />
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default RegisterCourseForm;
