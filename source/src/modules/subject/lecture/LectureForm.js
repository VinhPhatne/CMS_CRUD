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
import RichTextField from '@components/common/form/RichTextField';
import { useParams } from 'react-router-dom';

dayjs.extend(customParseFormat);

const LectureForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const [lectureKind, setLectureKind] = useState(null);

    const { subjectId } = useParams();

    const handleLectureKindChange = (value) => {
        setLectureKind(value);
    };

    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = (values) => {
        //values.lectureKind = lectureKind;
        //values.lectureName = lectureName;
        values.status = 1;
        values.subjectId = subjectId;
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
        form.setFieldsValue({
            ...dataDetail,
        });
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            required
                            label={<FormattedMessage defaultMessage="Tên bài giảng" />}
                            name="lectureName"
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={<FormattedMessage defaultMessage="Loại bài giảng" />}
                            name="lectureKind"
                            //name=['subject', 'id']

                            options={[
                                { value: 1, label: 'Chương' },
                                { value: 2, label: 'Bài học' },
                            ]}
                            onChange={handleLectureKindChange} // Gọi hàm khi thay đổi giá trị
                        />
                    </Col>
                </Row>
                {lectureKind !== 1 && (
                    <>
                        <Row gutter={24}>
                            <Col span={12}>
                                <TextField
                                    label={<FormattedMessage defaultMessage="Đường dẫn tài liệu" />}
                                    name="urlDocument"
                                    required
                                />
                            </Col>
                        </Row>

                        <Row gutter={10}>
                            <Col span={24}>
                                <RichTextField
                                    label={<FormattedMessage defaultMessage="Nội dung bài giảng" />}
                                    required
                                    name="description"
                                    type="textarea"
                                />
                            </Col>
                        </Row>
                        <Row gutter={10}>
                            <Col span={24}>
                                <TextField
                                    label={<FormattedMessage defaultMessage="Mô tả Ngắn" />}
                                    required
                                    name="shortDescription"
                                    type="textarea"
                                />
                            </Col>
                        </Row>
                    </>
                )}
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default LectureForm;
