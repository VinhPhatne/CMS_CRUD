import { Button, Card, Col, Form, InputNumber, Row, Space, Table, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import CropImageField from '@components/common/form/CropImageField';
import { AppConstants } from '@constants';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { statusOptions } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT } from '@constants/index';
import { formatDateString } from '@utils/index';

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

const DeveloperForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

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

    const handleTimeChange = (recordKey, index, field, value) => {
        const newScheduleData = scheduleData.map((item) => {
            if (item.key === recordKey) {
                const newTimes = item.times.map((time, i) => (i === index ? { ...time, [field]: value } : time));
                return {
                    ...item,
                    times: newTimes,
                };
            }
            return item;
        });
        setScheduleData(newScheduleData);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
        setIsChangedFormValues(true);
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
        setIsChangedFormValues(true);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const handleApplyAll = () => {
        const mondayTimes = scheduleData.find((day) => day.key === 't2')?.times || [];
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
        setIsChangedFormValues(true);
        form.setFieldsValue({ schedule: JSON.stringify(newScheduleData) });
    };

    const uploadFile = (file, onSuccess, onError, setImageUrl) => {
        executeUpFile({
            data: {
                type: 'AVATAR',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    setImageUrl(response.data.filePath);
                    setIsChangedFormValues(true);
                }
            },
            onError: (error) => {
                onError();
            },
        });
    };

    const handleSubmit = (values) => {
        values.birthday = formatDateString(values.birthday, DEFAULT_FORMAT);
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
            avatar: avatarUrl,
            schedule: scheduleJSON,
            status: 1,
            salaryKind: 0,
            level: 1,
        };
        console.log('Form Values:', finalValues);
        return mixinFuncs.handleSubmit(finalValues);
    };

    useEffect(() => {
        if (!isEditing > 0) {
            form.setFieldsValue({
                status: statusValues[1].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        dataDetail.birthday =
            dataDetail?.accountDto?.birthday && dayjs(dataDetail?.accountDto?.birthday, DEFAULT_FORMAT);
        form.setFieldsValue({
            ...dataDetail,
            fullName: dataDetail?.accountDto?.fullName,
            phone: dataDetail?.accountDto?.phone,
            email: dataDetail?.accountDto?.email,
            hourlySalary: dataDetail?.hourlySalary,
            salary: dataDetail?.salary,
            developerId: dataDetail?.leader?.accountDto?.id,
            developerRoleId: dataDetail?.developerRole?.id,
            studentId: dataDetail?.leader?.student?.id,
        });
        setAvatarUrl(dataDetail?.accountDto?.avatar);

        const schedule = dataDetail.schedule ? JSON.parse(dataDetail.schedule) : {};
        const updatedScheduleData = DAYS_OF_WEEK.map((day) => {
            if (schedule[day.key]) {
                const timeRanges = schedule[day.key].split('|').map((range) => {
                    const [startTime, endTime] = range.split('-').map((time) => dayjs(time, 'HH[H]mm'));
                    return { startTime, endTime };
                });

                const times = [...timeRanges, ...Array(3 - timeRanges.length).fill({ startTime: null, endTime: null })];

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
    }, [dataDetail, form]);

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
            render: (_, record) => <Button onClick={() => handleReload(record.key)}>Reload</Button>,
        },
    ];

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={24}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Avatar" />}
                            name="avatar"
                            imageUrl={avatarUrl && `${AppConstants.contentRootUrl}${avatarUrl}`}
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setAvatarUrl)}
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <TextField required label={<FormattedMessage defaultMessage="Họ và tên" />} name="fullName" />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            name="birthday"
                            label={<FormattedMessage defaultMessage="Ngày sinh" />}
                            placeholder="Ngày sinh"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <TextField required label={<FormattedMessage defaultMessage="Số Điện Thoại" />} name="phone" />
                    </Col>
                    <Col span={12}>
                        <TextField required label={<FormattedMessage defaultMessage="Email" />} name="email" />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label={<FormattedMessage defaultMessage="Lương theo giờ" />}
                            name="hourlySalary"
                            required
                        >
                            <InputNumber
                                addonAfter="$"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                max={10000000000}
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<FormattedMessage defaultMessage="Lương" />} name="salary" required>
                            <InputNumber
                                addonAfter="$"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                max={10000000000}
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Leader" />}
                            name={['developerId']}
                            apiConfig={apiConfig.developer.autocomplete}
                            mappingOptions={(item) => ({ value: item.account.id, label: item.account.fullName })}
                            searchParams={(text) => ({ name: text })}
                            required
                        />
                    </Col>

                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Vai trò dự án" />}
                            name={['developerRoleId']}
                            apiConfig={apiConfig.category.autocomplete}
                            mappingOptions={(item) => ({
                                value: item.id,
                                label: item.categoryName,
                            })}
                            initialSearchParams={{ kind: 4 }}
                            searchParams={(text) => ({ name: text })}
                            required
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Sinh viên" />}
                            name={['studentId']}
                            apiConfig={apiConfig.student.autocomplete}
                            mappingOptions={(item) => ({ value: item.account.id, label: item.account.fullName })}
                            searchParams={(text) => ({ name: text })}
                        />
                    </Col>

                    <Col span={12}>
                        <TextField required label={<FormattedMessage defaultMessage="Mật khẩu" />} name="password" />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Trạng thái" />}
                            name="status"
                            options={statusValues}
                        />
                    </Col>
                </Row>
                <Col span={6}>
                    <div style={{ marginTop: '4px', fontSize: '14px' }}>Lịch trình</div>
                </Col>
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

export default DeveloperForm;
