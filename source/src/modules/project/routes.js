import apiConfig from '@constants/apiConfig';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';
import ProjectPage from './GeneralProject';
import StoryProjectSavePage from './GeneralProject/story/StoryProjectSavePage';
import MemberProjectSavePage from './GeneralProject/member/MemberProjectSavePage';

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
        //permissions: [apiConfig.project.getById.baseURL],
    },
    MemberProjectSavePage: {
        path: '/project/member/:id',
        title: 'Story Project Page',
        auth: true,
        component: MemberProjectSavePage,
        keyActiveTab: 'activeProjectTab',
        //permissions: [apiConfig.project.getById.baseURL],
    },
};
