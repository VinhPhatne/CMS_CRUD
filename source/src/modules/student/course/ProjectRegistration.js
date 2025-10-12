import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import {
    EyeOutlined,
    CheckOutlined,
    UserOutlined,
    UsergroupDeleteOutlined,
    ContainerOutlined,
} from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { stateResgistration } from '@constants/masterData';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import routes from '../routes';
import { BaseForm } from '@components/common/form/BaseForm';
import useDisclosure from '@hooks/useDisclosure';
import useFetch from '@hooks/useFetch';
const message = defineMessages({
    objectName: 'Registration Course',
});

const ProjectRegistration = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const { pathname: pagePath } = useLocation();
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    const studentId = searchParams.get('studentId') || 'null';
    const studentName = searchParams.get('studentName') || 'null';
    const registrationId = searchParams.get('registrationId') || 'null';
    const courseId = searchParams.get('courseId') || 'null';
    const courseName = searchParams.get('courseName') || 'null';
    const courseState = searchParams.get('courseState') || 'null';
    const courseStatus = searchParams.get('courseStatus') || 'null';

    const [isOpen, { open, close }] = useDisclosure();

    const { execute: updateRegisterProject } = useFetch(apiConfig.registrationProject.update, {
        immediate: false,
    });

    const handleSubmit = async (values) => {
        const dataUpdate = {
            isDone: true,
            id: selectedProjectId,
        };
        try {
            await updateRegisterProject({
                method: 'PUT',
                data: dataUpdate,
                onCompleted: (response) => {
                    close();
                    mixinFuncs.handleFetchList({
                        studentId,
                        studentName: encodeURIComponent(studentName),
                        registrationId,
                        courseName: encodeURIComponent(courseName),
                        courseState,
                    });
                },
                onError: (error) => {
                    console.error('Error creating task:', error);
                },
            });
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.registrationProject,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            //objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };

            funcs.getCreateLink = () => {
                return `${pagePath}/create?studentId=${studentId}&studentName=${encodeURIComponent(
                    studentName,
                )}&registrationId=${registrationId}&courseId=${courseId}&courseName=${encodeURIComponent(
                    courseName,
                )}&courseState=${courseState}&courseStatus=${courseStatus}`;
            };

            funcs.additionalActionColumnButtons = () => {
                return {
                    complete: (record) => {
                        return (
                            <Button
                                type="link"
                                style={{ padding: 0, color: record.isDone ? 'gray' : 'blue' }}
                                onClick={() => {
                                    if (!record.isDone) {
                                        setSelectedProjectId(record.id);
                                        open();
                                    }
                                }}
                                disabled={record.isDone}
                            >
                                <CheckOutlined />
                            </Button>
                        );
                    },
                };
            };
        },
    });

    const columns = [
        {
            title: '#',
            dataIndex: ['project', 'avatar'],
            align: 'center',
            width: 70,
            render: (avatar) => (
                <AvatarField
                    size="large"
                    icon={<UserOutlined />}
                    src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                />
            ),
        },
        {
            title: 'Tên dự án',
            dataIndex: ['project', 'name'],
            width: 500,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isDone',
            width: 100,
            align: 'center',
            render: (isDone) => {
                if (isDone) {
                    return <Tag color="green">Hoàn thành</Tag>;
                } else {
                    return <Tag color="yellow">Chưa hoàn thành</Tag>;
                }
            },
        },
        //mixinFuncs.renderStatusColumn({ width: '90px' }),
        mixinFuncs.renderActionColumn(
            {
                complete: true,
                //edit: true,
                delete: true,
            },
            { width: '180px', fixed: 'right' },
        ),
    ];

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.student), path: routes.StudentListPage.path },
                {
                    breadcrumbName: courseName,
                    path: `/student/course?studentId=${studentId}&studentName=${studentName}`,
                },
                { breadcrumbName: translate.formatMessage(commonMessage.registrationProject) },
            ]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                title={studentName}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        scroll={{ x: 'max-content' }}
                    />
                }
            />
            <Modal title={'Thay đổi trạng thái hoàn thành dự án'} open={isOpen} onCancel={close} footer={null}>
                <BaseForm onFinish={handleSubmit} style={{ margin: 0 }}>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <Button onClick={close} style={{ marginRight: '16px' }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            OK
                        </Button>
                    </div>
                </BaseForm>
            </Modal>
        </PageWrapper>
    );
};

export default ProjectRegistration;
