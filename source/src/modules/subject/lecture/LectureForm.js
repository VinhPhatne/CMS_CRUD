import { Card, Col, Form, InputNumber, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import useBasicForm from '@hooks/useBasicForm';
import TextField from '@components/common/form/TextField';
import SelectField from '@components/common/form/SelectField';
import useTranslate from '@hooks/useTranslate';
import { statusOptions } from '@constants/masterData';
import { FormattedMessage } from 'react-intl';
import { BaseForm } from '@components/common/form/BaseForm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import RichTextField from '@components/common/form/RichTextField';
import { useLocation, useParams } from 'react-router-dom';
import useFetch from '@hooks/useFetch';
import apiConfig from '@constants/apiConfig';

dayjs.extend(customParseFormat);

const LectureForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const [lectureKind, setLectureKind] = useState(null);
    const [items, setItems] = useState([]);
    const [nextOrdering, setNextOrdering] = useState(null);

    const location = useLocation();

    const { subjectId } = useParams();

    const { data: dataListLecture } = useFetch(apiConfig.lecture.getBySubject, {
        pathParams: { id: subjectId },
        immediate: true,
        mappingData: (response) => response.data.content,
    });

    const { execute: updateSortLecture } = useFetch(apiConfig.lecture.updateSort, {
        immediate: false,
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const ordering = queryParams.get('nextOrdering');
        setNextOrdering(ordering ? parseInt(ordering, 10) : null);
    }, [location.search]);

    const handleLectureKindChange = (value) => {
        setLectureKind(value);
    };

    useEffect(() => {
        if (dataListLecture) {
            const sortedItems = [...dataListLecture].sort((a, b) => a.ordering - b.ordering);
            setItems(sortedItems);
        }
    }, [dataListLecture]);

    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const handleSubmit = async (values) => {
        values.status = 1;
        values.subjectId = subjectId;
        const id = `${Date.now()}`;
        values.id = id;

        const validItemsLength = Array.isArray(items) ? items.length : 0;

        const newOrdering =
            nextOrdering !== null && !isNaN(nextOrdering)
                ? nextOrdering
                : validItemsLength > 0
                    ? validItemsLength + 1  
                    : 0;  

        values.ordering = newOrdering;

        const updatedItems = items.map((item) => {
            if (item.ordering >= newOrdering) {
                return { ...item, ordering: item.ordering + 1 };
            }
            return item;
        });
        updatedItems.push(values);

        await updateSortLecture({ data: updatedItems });
        await mixinFuncs.handleSubmit({ ...values });

        console.log('check data', values);
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
                            options={[
                                { value: 1, label: 'Chương' },
                                { value: 2, label: 'Bài học' },
                            ]}
                            onChange={handleLectureKindChange}
                        />
                    </Col>
                </Row>
                {lectureKind !== 1 && dataDetail.lectureKind !== 1 && (
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
                                    style={{ height: '550px', marginBottom: '70px' }}
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
