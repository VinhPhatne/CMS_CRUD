import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { useLocation } from 'react-router-dom';
import routes from '@modules/project/routes';
import TaskForm from './TaskForm';

const message = defineMessages({
    objectName: 'courses registration',
});

const TaskSavePage = () => {
    const translate = useTranslate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');
    const projectId = queryParams.get('projectId');
    const storyName = queryParams.get('storyName');
    const storyId = queryParams.get('storyId');

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.projectTask.getById,
            create: apiConfig.projectTask.create,
            update: apiConfig.projectTask.update,
        },
        options: {
            getListUrl: routes.ProjectTaskPage.path,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
        },
    });
    return (
        <PageWrapper
            loading={loading}
            routes={[
                { breadcrumbName: 'Project', path: routes.projectListPage.path },
                {
                    breadcrumbName: projectName,
                    path: `/project/project-tab?projectId=${projectId}&projectName=${projectName}&active=true`,
                },
                {
                    breadcrumbName: `Story (${storyName})`,
                    path: `/project/task?projectId=${projectId}&storyId=${storyId}&storyName=${storyName}&active=true&projectName=${projectName}`,
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <TaskForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
            />
        </PageWrapper>
    );
};

export default TaskSavePage;
