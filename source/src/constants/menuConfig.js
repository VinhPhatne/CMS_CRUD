import React from 'react';
import { UsergroupAddOutlined, ControlOutlined, InboxOutlined } from '@ant-design/icons';
import routes from '@routes';
import { FormattedMessage } from 'react-intl';
import apiConfig from './apiConfig';
import { IconSettings } from '@tabler/icons-react';

export const navMenuConfig = [
    {
        label: <FormattedMessage defaultMessage="Quản lý khóa học" />,
        key: 'quan-ly-khoa-hoc',
        icon: <IconSettings size={16} />,
        permission: apiConfig.courses.getList.baseURL,
        children: [
            {
                label: <FormattedMessage defaultMessage="Quản lý sinh viên" />,
                key: 'student',
                path: routes.StudentListPage.path,
            },
            {
                label: <FormattedMessage defaultMessage="Khoá học" />,
                key: 'course',
                path: routes.coursesPage.path,
            },
            {
                label: <FormattedMessage defaultMessage="Môn học" />,
                key: 'subject',
                path: routes.SubjectListPage.path,
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Quản lý dự án" />,
        key: 'quan-ly-du-an',
        icon: <IconSettings size={16} />,
        permission: apiConfig.project.getList.baseURL,
        children: [
            {
                label: <FormattedMessage defaultMessage="Quản lý lập trình viên" />,
                key: 'developer',
                path: routes.DeveloperListPage.path,
            },
            {
                label: <FormattedMessage defaultMessage="Dự án" />,
                key: 'project',
                path: routes.projectListPage.path,
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Quản lý hệ thống" />,
        key: 'quan-ly-he-thong',
        icon: <IconSettings size={16} />,
        // permission: apiConfig.category.getList.baseURL,
        children: [
            {
                label: <FormattedMessage defaultMessage="Cài đặt" />,
                key: 'setting',
                path: routes.settingsPage.path,
            },
        ],
    },
];
