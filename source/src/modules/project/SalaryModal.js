// import TextField from '@components/common/form/TextField';
// import { Card, Col, Form, Modal, Row, Button, DatePicker } from 'antd';
// import React, { useEffect, useState } from 'react';
// import { FormattedMessage } from 'react-intl';
// import { BaseForm } from '@components/common/form/BaseForm';
// import useNotification from '@hooks/useNotification';
// import { defineMessages } from 'react-intl';
// import { useIntl } from 'react-intl';
// import useTranslate from '@hooks/useTranslate';
// import useSaveBase from '@hooks/useSaveBase';
// import apiConfig from '@constants/apiConfig';
// import routes from './routes';

// const messages = defineMessages({
//     objectName: 'setting',
//     update: 'Cập nhật',
//     updateSuccess: 'Cập nhật {objectName} thành công',
// });
// const SalaryModal = ({
//     open,
//     onCancel,
//     onOk,
//     title,
//     data,
//     introduceData,
//     executeUpdate,
//     executeLoading,
//     ...props
// }) => {
//     const [form] = Form.useForm();
//     const [isChanged, setChange] = useState(false);
//     const notification = useNotification();
//     const intl = useIntl();
//     const translate = useTranslate();


//     const handleInputChange = () => {
//         setChange(true);
//     };
//     const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing } = useSaveBase({
//         apiConfig: {
//             getById: apiConfig.project.getById,
//             create: apiConfig.project.create,
//             update: apiConfig.project.update,
//         },
//         options: {
//             getListUrl: routes.projectListPage.path,
//             objectName: translate.formatMessage(message.objectName),
//         },
//         override: (funcs) => {
//             funcs.prepareUpdateData = (data) => {
//                 return {
//                     ...data,
//                     id: detail.id,
//                 };
//             };
//             funcs.prepareCreateData = (data) => {
//                 return {
//                     ...data,
//                 };
//             };
//         },
//     });

//     return (
//         <Modal
//             title={<FormattedMessage defaultMessage="Chọn ngày lương" />}
//             width={500}
//             open={open}
//             onCancel={onCancel}
//             footer={null}
//             centered
//         >
//             <DatePicker
//                 //value={selectedDate} // Gắn giá trị DatePickerField
//                 value={selectedDate ? parseDate(selectedDate) : null}
//                 onChange={(date) => setSelectedDate(date ? date.format('DD/MM/YYYY') : null)} // Ensure correct format
//                 format="MM/DD/YYYY"
//             />
//             {/* <DatePickerField
//                 name="dateRegister"
//                 value={selectedDate}  // Truyền giá trị ngày đã được chuyển đổi vào đây
//                 onChange={(date) => setSelectedDate(date)}
//                 format="DD/MM/YYYY"   // Định dạng hiển thị cho người dùng
//             />         */}
//             <BaseForm onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
//                 <Card className="card-form" bordered={false}>
//                     <Row gutter={10}>
//                         <Col span={12}>
//                             <DatePickerField
//                                 name="startDate"
//                                 label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
//                                 placeholder="Ngày bắt đầu"
//                                 format={DATE_FORMAT_DISPLAY}
//                                 style={{ width: '100%' }}
//                                 rules={[
//                                     {
//                                         required: true,
//                                         message: 'Vui lòng chọn ngày bắt đầu',
//                                     },
//                                 ]}
//                             />
//                         </Col>
//                     </Row>
//                     <div className="footer-card-form">{mixinFuncs.renderActions()}</div>
//                 </Card>
//             </BaseForm>
//         </Modal>
//     );
// };

// export default SalaryModal;
