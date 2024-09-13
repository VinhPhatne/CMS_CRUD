import apiConfig from '@constants/apiConfig';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';
import ProjectPage from './GeneralProject';
import StoryProjectSavePage from './GeneralProject/story/StoryProjectSavePage';
import MemberProjectSavePage from './GeneralProject/member/MemberProjectSavePage';
import ProjectTaskPage from './GeneralProject/story/task';
import TaskSavePage from './GeneralProject/story/task/TaskSavePage';
import TestPlanSavePage from './GeneralProject/story/task/TestPlanSavePage';
import BugPage from './GeneralProject/story/task/BugPage';

export default {
    projectListPage: {
        path: '/project',
        title: 'Projects',
        auth: true,
        component: ProjectListPage,
        permissions: [apiConfig.project.getList.baseURL],
    },
    projectSavePage: {
        path: '/project/:id',
        title: 'Project Save Page',
        auth: true,
        component: ProjectSavePage,
        permissions: [apiConfig.project.create.baseURL, apiConfig.project.update.baseURL],
    },
    ProjectPage: {
        path: '/project/project-tab',
        title: 'Project',
        auth: true,
        component: ProjectPage,
        keyActiveTab: 'activeProjectTab',
        permissions: [apiConfig.project.getById.baseURL],
    },
    StoryProjectSavePage: {
        path: '/story/task/:id',
        title: 'Story Project Page',
        auth: true,
        component: StoryProjectSavePage,
        keyActiveTab: 'activeProjectTab',
        permissions: [apiConfig.story.create.baseURL, apiConfig.story.update.baseURL],
    },
    MemberProjectSavePage: {
        path: '/project/member/:id',
        title: 'Story Project Page',
        auth: true,
        component: MemberProjectSavePage,
        keyActiveTab: 'activeProjectTab',
        permissions: [apiConfig.memberProject.create.baseURL, apiConfig.memberProject.update.baseURL],
    },
    ProjectTaskPage: {
        path: '/project/task',
        title: 'Project Task Page',
        auth: true,
        component: ProjectTaskPage,
        keyActiveTab: 'activeProjectTaskTab',
        permissions: [apiConfig.projectTask.getById.baseURL],
    },
    TaskSavePage: {
        path: '/project/task/:id',
        title: 'Project Task Page',
        auth: true,
        component: TaskSavePage,
        keyActiveTab: 'activeProjectTaskTab',
        permissions: [apiConfig.projectTask.create.baseURL, apiConfig.projectTask.update.baseURL],
    },
    TestPlanSavePage: {
        path: '/project/test-plan/:id',
        title: 'Project Test Plan Page',
        auth: true,
        component: TestPlanSavePage,
        keyActiveTab: 'activeProjectTaskTab',
        permissions: [apiConfig.testPlan.create.baseURL, apiConfig.testPlan.update.baseURL],
    },
    BugPage: {
        path: '/project/task/summary-bug',
        title: 'Bug Page',
        auth: true,
        component: BugPage,
        permissions: [apiConfig.testPlan.summaryBug.baseURL],
    },
};
