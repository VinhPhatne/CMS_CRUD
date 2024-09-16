import apiConfig from '@constants/apiConfig';
import DeveloperListPage from '.';
import DeveloperSavePage from './DeveloperSavePage';
import DeveloperProjectPage from './project';
import DeveloperDayOffPage from './dayoff';
import DayOffSavePage from './dayoff/DayOffSavePage';

export default {
    DeveloperListPage: {
        path: '/developer',
        title: 'Developers',
        auth: true,
        component: DeveloperListPage,
        permissions: [apiConfig.developer.getList.baseURL],
    },
    DeveloperSavePage: {
        path: '/developer/:id',
        title: 'Developer Save Page',
        auth: true,
        component: DeveloperSavePage,
        permissions: [apiConfig.developer.create.baseURL, apiConfig.developer.update.baseURL],
    },
    DeveloperProjectPage: {
        path: '/developer/project',
        title: 'Developer Project Page',
        auth: true,
        component: DeveloperProjectPage,
        permissions: [apiConfig.developer.create.baseURL, apiConfig.developer.update.baseURL],
    },
    DeveloperDayOffPage: {
        path: '/developer/day-off-log',
        title: 'Developer Day Off Page',
        auth: true,
        component: DeveloperDayOffPage,
        permissions: [apiConfig.developer.create.baseURL, apiConfig.developer.update.baseURL],
    },
    DeveloperDayOffSavePage: {
        path: '/developer/day-off-log/:id',
        title: 'Developer Day Off Save Page',
        auth: true,
        component: DayOffSavePage,
        permissions: [apiConfig.developer.create.baseURL, apiConfig.developer.update.baseURL],
    },
};
