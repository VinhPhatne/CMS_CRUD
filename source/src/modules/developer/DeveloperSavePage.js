import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import routes from './routes';
import useTranslate from '@hooks/useTranslate';
import DeveloperForm from './DeveloperForm';

const message = defineMessages({
    objectName: 'developer',
});

const DeveloperSavePage = () => {
    const translate = useTranslate();
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.developer.getById,
            create: apiConfig.developer.create,
            update: apiConfig.developer.update,
        },
        options: {
            getListUrl: routes.DeveloperListPage.path,
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
                {
                    breadcrumbName: <FormattedMessage defaultMessage="Developer" />,
                    path: routes.DeveloperListPage.path,
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <DeveloperForm
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

export default DeveloperSavePage;
