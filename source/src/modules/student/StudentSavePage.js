import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import routes from './routes';
import useTranslate from '@hooks/useTranslate';
import StudentForm from './StudentForm';

const message = defineMessages({
    objectName: 'developer',
});

const StudentSavePage = () => {
    const translate = useTranslate();
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.student.getById,
            create: apiConfig.student.create,
            update: apiConfig.student.update,
        },
        options: {
            getListUrl: routes.StudentListPage.path,
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
                { breadcrumbName: <FormattedMessage defaultMessage="Student" />, path: routes.StudentListPage.path },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <StudentForm
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

export default StudentSavePage;
