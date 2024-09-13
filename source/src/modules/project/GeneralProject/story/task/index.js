import PageWrapper from '@components/common/layout/PageWrapper';
import useTranslate from '@hooks/useTranslate';
import { Card, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import Task from './Task';
import TestPlan from './TestPlan';
import routes from '@modules/project/routes';

const ProjectTaskPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectName = queryParams.get('projectName');
    const projectId = queryParams.get('projectId');
    const storyName = queryParams.get('storyName');
    const [activeTab, setActiveTab] = useState('task');

    const handleTabClick = (key) => {
        setActiveTab(key);
        localStorage.setItem(routes.ProjectTaskPage.keyActiveTab, key);
    };

    useEffect(() => {
        const savedTab = queryParams.get('activeTab') || localStorage.getItem(routes.ProjectTaskPage.keyActiveTab);
        if (savedTab) {
            setActiveTab(savedTab);
        } else {
            setActiveTab('task'); 
        }
    }, [location.search]);
    
    return (
        <PageWrapper
            routes={[
                { breadcrumbName: <FormattedMessage defaultMessage="Project" />, path: routes.projectListPage.path },
                {
                    breadcrumbName: projectName,
                    path: `/project/project-tab?projectId=${projectId}&projectName=${projectName}&active=true`,
                },
                { breadcrumbName: storyName },
            ]}
        >
            <Card className="card-form" bordered={false}>
                <Tabs
                    type="card"
                    onTabClick={handleTabClick}
                    activeKey={activeTab}
                    items={[
                        {
                            key: 'task',
                            label: 'Task',
                            children: <Task projectId={projectId} />,
                        },
                        {
                            key: 'testPlan',
                            label: 'Test Plan',
                            children: <TestPlan />,
                        },
                    ]}
                />
            </Card>
        </PageWrapper>
    );
};

export default ProjectTaskPage;
