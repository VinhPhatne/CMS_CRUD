import apiConfig from '@constants/apiConfig';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';
import ProjectPage from './GeneralProject';

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
};
