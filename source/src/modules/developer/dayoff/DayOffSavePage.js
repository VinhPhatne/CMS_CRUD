import PageWrapper from '@components/common/layout/PageWrapper';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import routes from '../routes';
import useTranslate from '@hooks/useTranslate';
import DayOffForm from './DayOffForm';
import { commonMessage } from '@locales/intl';
import { generatePath, useLocation } from 'react-router-dom';

const message = defineMessages({
    objectName: 'developer',
});

const DayOffSavePage = () => {
    const translate = useTranslate();

    const location = useLocation();
    const queryString = location.search;
    const params = new URLSearchParams(location.search);
    const developerId = params.get('developerId');
    const developerName = params.get('developerName');

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.dayOff.getById,
            create: apiConfig.dayOff.create,
            update: apiConfig.dayOff.update,
        },
        options: {
            getListUrl: routes.DeveloperDayOffPage.path,
            objectName: translate.formatMessage(message.objectName),
            initialData: { developerId, developerName },
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
                    breadcrumbName: translate.formatMessage(commonMessage.developer),
                    path: routes.DeveloperListPage.path,
                },
                {
                    breadcrumbName: translate.formatMessage(commonMessage.dayOff),
                    path: `/developer/day-off-log${queryString}`,
                },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <DayOffForm
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

export default DayOffSavePage;
