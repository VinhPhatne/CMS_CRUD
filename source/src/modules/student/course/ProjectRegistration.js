import BaseTable from '@components/common/table/BaseTable';
import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Button, Modal, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { EyeOutlined, UserOutlined, UsergroupDeleteOutlined, ContainerOutlined } from '@ant-design/icons';
import AvatarField from '@components/common/form/AvatarField';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import { AppConstants, categoryKind, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';
import { stateResgistration } from '@constants/masterData';
import useFetch from '@hooks/useFetch';
import useNotification from '@hooks/useNotification';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { convertUtcToLocalTime } from '@utils';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';

import routes from '../routes';
const message = defineMessages({
    objectName: 'Registration Course',
});

const ProjectRegistration = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const notification = useNotification();
    const statusValues = translate.formatKeys(stateResgistration, ['label']);

    const location = useLocation();
    const { pathname: pagePath } = useLocation();

    const queryString = location.search;
    const queryParams = new URLSearchParams(location.search);
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(currentUrl.search);
    const studentId = searchParams.get('studentId') || 'null';
    const studentName = searchParams.get('studentName') || 'null';
    const registrationId = searchParams.get('registrationId') || 'null';
    const courseId = searchParams.get('courseId') || 'null';
    const courseName = searchParams.get('courseName') || 'null';
    const courseState = searchParams.get('courseState') || 'null';
    const courseStatus = searchParams.get('courseStatus') || 'null';

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

            // funcs.additionalActionColumnButtons = () => {
            //     return {
            //         registration: (record) => {
            //             const { registrationId, courseName, courseState } = record;

            //             return (
            //                 <Button
            //                     type="link"
            //                     style={{ padding: 0 }}
            //                     onClick={() => {
            //                         navigate(
            //                             `/student/registration-project?studentId=${studentId}&studentName=${encodeURIComponent(
            //                                 studentName,
            //                             )}&registrationId=${registrationId}&courseName=${encodeURIComponent(
            //                                 courseName,
            //                             )}&courseState=${courseState}`,
            //                         );
            //                     }}
            //                 >
            //                     {/* <PlusSquareOutlined /> */}
            //                 </Button>
            //             );
            //         },
            //     };
            // };
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
                { breadcrumbName: courseName, path: `/student/course?studentId=${studentId}&studentName=${studentName}` },
                { breadcrumbName: translate.formatMessage(commonMessage.registrationProject)  },
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
        </PageWrapper>
    );
};

export default ProjectRegistration;
