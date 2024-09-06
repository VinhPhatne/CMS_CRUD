import { Card, Checkbox, Col, Form, InputNumber, Row, Space, Table, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
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

    useEffect(() => {
        if (dataDetail) {
            form.setFieldsValue({
                ...dataDetail,
                studentId: dataDetail?.studentInfo?.id,
                status: dataDetail?.studentInfo?.account?.status,
                contractSign: "contractSign", 
                isIntern: dataDetail?.isIntern,
                state: dataDetail?.state,
                courseId: dataDetail?.courseId,
            });

            // Parse và định dạng schedule
            const schedule = dataDetail.schedule ? JSON.parse(dataDetail.schedule) : {};
            const updatedScheduleData = DAYS_OF_WEEK.map((day) => {
                if (schedule[day.key]) {
                    const [startTime, endTime] = schedule[day.key].split('-').map((time) => dayjs(time, 'HH[H]mm'));
                    return {
                        key: day.key,
                        label: day.label,
                        times: [
                            {
                                startTime,
                                endTime,
                            },
                        ],
                    };
                }
                return {
                    key: day.key,
                    label: day.label,
                    times: [
                        {
                            startTime: null,
                            endTime: null,
                        },
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
        // Cập nhật giá trị form
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const handleSubmit = (values) => {
        const finalValues = {
            ...values,
            contractSign: "contractSign", 
            courseId: courseId, 
            studentId: Number(values.studentId), 
            moneyState: 1,
            isIssuedCertify: 1, 
            status: dataDetail?.studentInfo?.account?.status,
            //schedule: JSON.stringify({}),
            state: Number(values.state), 
            isIntern: Number(values.isIntern), 
        };
    
        console.log('Form Values:', finalValues);
        return mixinFuncs.handleSubmit(finalValues);
    };

    const initialValues = {
        isIntern: 0, // Mặc định là 0
    };

    const handleCheckboxChange = (e) => {
        form.setFieldsValue({ isIntern: e.target.checked ? 1 : 0 });
    };

    const handleStudentIdChange = (value) => {
        form.setFieldsValue({ studentId: value });
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
                            onChange={(value) =>
                                handleTimeChange(record.key, 0, 'startTime', value)
                            }
                        />
                        <TimePicker
                            value={times[0]?.endTime}
                            format="HH:mm"
                            onChange={(value) =>
                                handleTimeChange(record.key, 0, 'endTime', value)
                            }
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
                            onChange={(value) =>
                                handleTimeChange(record.key, 1, 'startTime', value)
                            }
                        />
                        <TimePicker
                            value={times[1]?.endTime}
                            format="HH:mm"
                            onChange={(value) =>
                                handleTimeChange(record.key, 1, 'endTime', value)
                            }
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
                            onChange={(value) =>
                                handleTimeChange(record.key, 2, 'startTime', value)
                            }
                        />
                        <TimePicker
                            value={times[2]?.endTime}
                            format="HH:mm"
                            onChange={(value) =>
                                handleTimeChange(record.key, 2, 'endTime', value)
                            }
                        />
                    </Space>
                </Space>
            ),
        },
    ];

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange} initialValues={initialValues}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Tên sinh viên" />}
                            name={['studentId']}
                            apiConfig={apiConfig.student.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.account?.fullName })}
                            searchParams={(text) => ({ name: text })}
                            onChange={handleStudentIdChange} 
                            required
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
                    <Form.Item label={<FormattedMessage defaultMessage="Đăng kí thực tập" />} name="isIntern" valuePropName="checked">
                        <Checkbox onChange={handleCheckboxChange} />
                    </Form.Item>
                </Row>
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
