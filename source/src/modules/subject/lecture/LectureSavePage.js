import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import LectureForm from './LectureForm';
import routes from '../routes';
import { generatePath, useParams } from 'react-router-dom';

const message = defineMessages({
    objectName: 'lecture',
});

const LectureSavePage = () => {
    const translate = useTranslate();

    const { subjectId: subjectId } = useParams();

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.lecture.getById,
            create: apiConfig.lecture.create,
            update: apiConfig.lecture.update,
        },
        options: {
            getListUrl: generatePath(routes.LectureListPage.path, { id: subjectId }),
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
                { breadcrumbName: <FormattedMessage defaultMessage="Subject" />, path: routes.SubjectListPage.path },
                {
                    breadcrumbName: <FormattedMessage defaultMessage="Lecture" />,
                    path: generatePath(routes.LectureListPage.path, { id: subjectId }),
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <LectureForm
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

export default LectureSavePage;
