import PageWrapper from '@components/common/layout/PageWrapper';
import useTranslate from '@hooks/useTranslate';
import { Card, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import StoryProject from './StoryProject';
import MemberProject from './MemberProject';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from '../routes';

const ProjectPage = () => {
    const translate = useTranslate();
    const intl = useIntl();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');
    const projectId = queryParams.get('projectId');
    const [activeTab, setActiveTab] = useState('story');

    const navigate = useNavigate();

    const handleTabClick = (key) => {
        setActiveTab(key);
        const params = new URLSearchParams(location.search);
        localStorage.setItem(routes.ProjectPage.keyActiveTab, key);

        if (key === 'member') {
            params.delete('developerId');
            params.delete('status');
        }
        navigate({ search: params.toString() });
    };

    useEffect(() => {
        const savedTab = localStorage.getItem(routes.ProjectPage.keyActiveTab);
        if (savedTab) {
            setActiveTab(savedTab);
        } else {
            setActiveTab('story'); 
        }
    }, [location.search]);

    useEffect(() => {
        localStorage.setItem(routes.ProjectPage.keyActiveTab, activeTab);
    }, [activeTab]);

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
                    onTabClick={handleTabClick}
                    activeKey={activeTab}
                    items={[
                        {
                            key: 'story',
                            label: 'Story',
                            children: <StoryProject projectId={projectId} activeTab={activeTab} />,
                        },
                        {
                            key: 'member',
                            label: 'Member',
                            children: <MemberProject activeTab={activeTab} />,
                        },
                    ]}
                />
            </Card>
        </PageWrapper>
    );
};

export default ProjectPage;
