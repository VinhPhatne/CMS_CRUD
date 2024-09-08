import PageWrapper from '@components/common/layout/PageWrapper';
import { categoryKind } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useSaveBase from '@hooks/useSaveBase';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import routes from '../routes';
import useTranslate from '@hooks/useTranslate';
import RegisterCourseForm from './RegisterCourseForm';
import { useLocation } from 'react-router-dom';
import { commonMessage } from '@locales/intl';
import queryString from 'query-string';

const message = defineMessages({
    objectName: 'courses registration',
});

const RegisterCourseSavePage = () => {
    const translate = useTranslate();
    const location = useLocation(); 
    const queryString = location.search;
    const params = new URLSearchParams(location.search);
    const courseId = params.get('courseId');
    const courseName = params.get('courseName');
    const courseState = params.get('courseState');
    const courseStatus = params.get('courseStatus');

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.registration.getById,
            create: apiConfig.registration.create,
            update: apiConfig.registration.update,
        },
        options: {
            getListUrl: routes.registerListPage.path,
            objectName: translate.formatMessage(message.objectName),
            initialData: { courseId, courseName, courseState, courseStatus },
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
                { breadcrumbName: translate.formatMessage(commonMessage.course), path: routes.coursesPage.path },
                { breadcrumbName: translate.formatMessage(commonMessage.registrationCourse), path: `course/registration${queryString}` },
                { breadcrumbName: title },
            ]}  
            title={title}>
            <RegisterCourseForm
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

export default RegisterCourseSavePage;
