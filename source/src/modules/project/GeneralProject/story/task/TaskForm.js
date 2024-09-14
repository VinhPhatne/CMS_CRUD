import { Card, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import apiConfig from '@constants/apiConfig';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { kindTaskOptions, stateTaskOptions } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import AutoCompleteField from '@components/common/form/AutoCompleteField';
import DatePickerField from '@components/common/form/DatePickerField';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DATE_FORMAT_DISPLAY, DATE_FORMAT_VALUE, DEFAULT_FORMAT } from '@constants/index';
import { formatDateString } from '@utils/index';
import RichTextField from '@components/common/form/RichTextField';
import useFetch from '@hooks/useFetch';

dayjs.extend(customParseFormat);

const TaskForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const queryParams = new URLSearchParams(window.location.search);
    const projectId = queryParams.get('projectId');
    const storyId = queryParams.get('storyId');

    const translate = useTranslate();
    const statusValues = translate.formatKeys(stateTaskOptions, ['label']);

    const renderKindOption = (option) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={option.imageUrl} alt="Task kind" style={{ width: '20px', height: '20px' }} />
        </div>
    );

    const [selectedContent, setSelectedContent] = useState('');

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const { data: templateData } = useFetch(apiConfig.documentTemplate.getList, {
        immediate: true,
        mappingData: (response) => {
            return response.data.content;
        },
    });

    const handleTemplateChange = (value) => {
        const selectedTemplate = templateData.find((item) => item.id === value);
        if (selectedTemplate) {
            form.setFieldsValue({ description: selectedTemplate.content });
            setSelectedContent(selectedTemplate.name);
        }
    };

    const handleSubmit = (values) => {
        values.projectId = projectId;
        values.dueDate = formatDateString(values.dueDate, DEFAULT_FORMAT);
        values.startDate = formatDateString(values.startDate, DEFAULT_FORMAT);
        values.storyId = storyId;
        values.status = 1;
        values.state = 1;
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
        dataDetail.startDate = dataDetail.startDate && dayjs(dataDetail.startDate, DEFAULT_FORMAT);
        dataDetail.dueDate = dataDetail.dueDate && dayjs(dataDetail.dueDate, DEFAULT_FORMAT);
        form.setFieldsValue({
            ...dataDetail,
            developerId: dataDetail?.developer?.account?.id,
            projectCategoryId: dataDetail?.projectCategoryInfo?.id,
            testPlanId: dataDetail?.testPlan?.id,
        });
    }, [dataDetail]);

    return (
        <BaseForm
            style={{ width: '700px' }}
            id={formId}
            onFinish={handleSubmit}
            form={form}
            onValuesChange={onValuesChange}
        >
            <Card className="card-form" bordered={false}>
                <Row gutter={20}>
                    <Col span={12}>
                        <Input.Group compact>
                            <SelectField
                                name="kind"
                                options={kindTaskOptions.map((option) => ({
                                    value: option.value,
                                    label: renderKindOption(option),
                                }))}
                                placeholder="Chọn loại task"
                                style={{ width: '80px', marginTop: '30px' }}
                            />
                            <TextField
                                required
                                style={{ width: '236px' }}
                                label={<FormattedMessage defaultMessage="Tên task" />}
                                name="taskName"
                            />
                        </Input.Group>
                    </Col>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Danh mục" />}
                            name={['projectCategoryId']}
                            apiConfig={apiConfig.projectCategory.autocomplete}
                            mappingOptions={(item) => ({
                                value: item.id,
                                label: item.projectCategoryName,
                            })}
                            initialSearchParams={{ projectId: projectId }}
                            searchParams={(text) => ({ name: text })}
                            required
                            disabled={isEditing}
                        />
                    </Col>
                </Row>
                <Row gutter={20}>
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
                            required
                            disabled={isEditing}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Tình trạng" />}
                            name="status"
                            options={statusValues}
                        />
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={<FormattedMessage defaultMessage="Test plan" />}
                            name={['testPlanId']}
                            apiConfig={apiConfig.testPlan.autocomplete}
                            mappingOptions={(item) => ({
                                value: item.id,
                                label: item.name,
                            })}
                            initialSearchParams={{ projectId: projectId, storyId: storyId }}
                            searchParams={(text) => ({ name: text })}
                            required
                            disabled={isEditing}
                        />
                    </Col>
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
                </Row>
                <Row gutter={20}>
                    <Col span={12}>
                        <DatePickerField
                            name="dueDate"
                            label={<FormattedMessage defaultMessage="Ngày kết thúc" />}
                            placeholder="Ngày kết thúc"
                            format={DATE_FORMAT_DISPLAY}
                            style={{ width: '100%' }}
                            required
                        />
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={6}>
                        <div style={{ marginTop: '4px', fontSize: '15px' }}>Mô tả</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ marginTop: '4px', marginLeft: '200px', fontSize: '15px' }}>Chọn biểu mẫu :</div>
                    </Col>
                    <Col span={6}>
                        <AutoCompleteField
                            name={['templateId']}
                            apiConfig={apiConfig.documentTemplate.getList}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            searchParams={(text) => ({ name: text })}
                            onChange={handleTemplateChange}
                            disabled={isEditing}
                            allowClear={true}
                        />
                    </Col>
                </Row>
                <Row gutter={20}>
                    <Col span={24}>
                        <RichTextField
                            required
                            name="description"
                            type="textarea"
                            style={{ height: '550px', marginBottom: '70px' }}
                        />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default TaskForm;
