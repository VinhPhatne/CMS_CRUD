import { Card, Col, Form, InputNumber, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
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
import RichTextField from '@components/common/form/RichTextField';

dayjs.extend(customParseFormat);

const StoryProjectForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const projectId = queryParams.get('projectId');

    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        if (values.dateComplete != null) values.dateComplete = formatDateString(values.dateComplete, DEFAULT_FORMAT);
        values.projectId = projectId;
        values.status = 1;
        values.state = 1;
        console.log('check data', values);
        return mixinFuncs.handleSubmit({ ...values });
    };
    useEffect(() => {
        if (!isEditing > 0) {
            form.setFieldsValue({
                status: statusValues[1].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        dataDetail.dateComplete = dataDetail.dateComplete && dayjs(dataDetail.dateComplete, DEFAULT_FORMAT);
        dataDetail.dateEnd = dataDetail.dateEnd && dayjs(dataDetail.dateEnd, DEFAULT_FORMAT);
        form.setFieldsValue({
            ...dataDetail,
            developerId: dataDetail?.developerInfo?.id,
        });
    }, [dataDetail]);

    const handleStudentIdChange = (value) => {
        form.setFieldsValue({ developerId: value });
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField required label={<FormattedMessage defaultMessage="Tên story" />} name="storyName" />
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Người thực hiện" />}
                            name={['developerId']}
                            apiConfig={apiConfig.memberProject.autocomplete}
                            mappingOptions={(item) => ({
                                value: item.developer?.id,
                                label: item.developer?.account?.fullName,
                            })}
                            initialSearchParams={{ projectId: projectId }}
                            searchParams={(text) => ({ name: text })}
                            onChange={handleStudentIdChange}
                            required
                            disabled={isEditing}
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Tình trạng" />}
                            name="status"
                            options={statusValues}
                        />
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={<FormattedMessage defaultMessage="Thời gian hoàn thành" />}
                            name="timeEstimate"
                            required
                        >
                            <InputNumber
                                addonAfter="phút"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                max={10000000000}
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <DatePickerField
                            name="dateComplete"
                            label={<FormattedMessage defaultMessage="Ngày hoàn thành" />}
                            placeholder="Ngày hoàn thành"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField label={<FormattedMessage defaultMessage="Mô tả" />} />
                    </Col>
                    <Col span={12}>
                        {/* <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Chọn biểu mẫu:" />}
                            name={['name']}
                            apiConfig={apiConfig.documentTemplate.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            initialSearchParams={{ projectId: projectId }}
                            searchParams={(text) => ({ name: text })}
                            onChange={handleStudentIdChange}
                            disabled={isEditing}
                        /> */}
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={24}>
                        <RichTextField required name="description" type="textarea" />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default StoryProjectForm;
