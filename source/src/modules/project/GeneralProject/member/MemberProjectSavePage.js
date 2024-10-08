import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import {  defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import { useLocation } from 'react-router-dom';
import MemberProjectForm from './MemberProjectForm';
import routes from '@modules/project/routes';

const message = defineMessages({
    objectName: 'courses registration',
});

const MemberProjectSavePage = () => {
    const translate = useTranslate();
    const location = useLocation();
    const queryString = location.search;
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.memberProject.getById,
            create: apiConfig.memberProject.create,
            update: apiConfig.memberProject.update,
        },
        options: {
            getListUrl: routes.ProjectPage.path,
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
                { breadcrumbName: 'Dự án', path: routes.ProjectPage.path },
                {
                    breadcrumbName: projectName,
                    path: `/project/project-tab${queryString}`,
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <MemberProjectForm
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

export default MemberProjectSavePage;
