import { Card, Col, Form, InputNumber, Row, Space } from 'antd';
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

const ProjectRegistrationForm = ({
    formId,
    actions,
    dataDetail,
    onSubmit,
    setIsChangedFormValues,
    isEditing,
}) => {

    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const searchParams = new URLSearchParams(location.search);
    const registrationId = searchParams.get('registrationId');

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        values.registrationId = registrationId; 
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
        form.setFieldsValue({
            ...dataDetail,
            universityId: dataDetail?.university?.id,
        });
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={24}>
                    <Col span={24}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Dự án" />}
                            name={['projectId']}
                            apiConfig={apiConfig.project.autocomplete}
                            mappingOptions={(item) => ({
                                value: item.id,
                                label: item.name,
                            })}
                            initialSearchParams={{ registrationId : registrationId , ignoreRegisteredProject: true }}
                            searchParams={(text) => ({ name: text })}
                            required
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default ProjectRegistrationForm;
