import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import useTranslate from '@hooks/useTranslate';
import { statusOptions } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT } from '@constants/index';
import { formatDateString } from '@utils/index';
import BooleanField from '@components/common/form/BooleanField';

dayjs.extend(customParseFormat);

const DayOffForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        values.startDate = formatDateString(values.startDate, DEFAULT_FORMAT);
        values.endDate = formatDateString(values.endDate, DEFAULT_FORMAT);
        const finalValues = {
            ...values,
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
        dataDetail.startDate = dataDetail?.startDate && dayjs(dataDetail?.startDate, DEFAULT_FORMAT);
        dataDetail.endDate = dataDetail?.endDate && dayjs(dataDetail?.endDate, DEFAULT_FORMAT);
        form.setFieldsValue({
            ...dataDetail,
            note: dataDetail?.note,
        });
    }, [dataDetail, form]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={24}>
                    <Col span={12}>
                        <DatePickerField
                            name="startDate"
                            label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
                            placeholder="Ngày bắt đầu"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            name="endDate"
                            label={<FormattedMessage defaultMessage="Ngày kết thúc" />}
                            placeholder="Ngày kết thúc"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <TextField
                            type="textarea"
                            required
                            label={<FormattedMessage defaultMessage="Lý do" />}
                            name="note"
                        />
                    </Col>
                </Row>
                <Row gutter={24}>
                    <BooleanField name="isCharged" label={<FormattedMessage defaultMessage="Bị trừ tiền" />} />
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default DayOffForm;
