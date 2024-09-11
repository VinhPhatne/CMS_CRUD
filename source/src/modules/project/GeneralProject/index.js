import PageWrapper from '@components/common/layout/PageWrapper';
import useTranslate from '@hooks/useTranslate';
import { Card, Tabs } from 'antd';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import StoryProject from './StoryProject';
import MemberProject from './MemberProject';
import { useLocation } from 'react-router-dom';
import routes from '../routes';

const ProjectPage = () => {
    const translate = useTranslate();
    const intl = useIntl();
    const location = useLocation();

    const { pathname: pagePath } = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');
    const projectId = queryParams.get('projectId');

    console.log('projectId', projectId);
    console.log('projectName', projectName);
    // const [activeTab, setActiveTab] = useState(
    //     localStorage.getItem(routes.settingsPage.keyActiveTab)
    //         ? localStorage.getItem(routes.settingsPage.keyActiveTab)
    //         : settingGroups.PAGE,
    // );

    //<PageWrapper routes={[{ breadcrumbName: translate.formatMessage(message.generalSetting) }]}>

    const [activeTab, setActiveTab] = useState('story');
    return (
        <PageWrapper
            routes={[
                { breadcrumbName: <FormattedMessage defaultMessage="Project" />, path: routes.projectListPage.path },
                { breadcrumbName: projectName },
            ]}
        >
            <Card className="card-form" bordered={false}>
                <Tabs
                    type="card"
                    onTabClick={(key) => {
                        setActiveTab(key);
                        //localStorage.setItem(routes.settingsPage.keyActiveTab, key);
                    }}
                    activeKey={activeTab}
                    items={[
                        {
                            key: 'story',
                            label: 'Story',
                            children: <StoryProject projectId={projectId} />,
                        },
                        {
                            key: 'member',
                            label: 'Member',
                            children: <MemberProject />,
                        },
                    ]}
                />
            </Card>
        </PageWrapper>
    );
};

export default ProjectPage;
