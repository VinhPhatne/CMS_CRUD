import apiConfig from '@constants/apiConfig';
import DeveloperListPage from '.';
import DeveloperSavePage from './DeveloperSavePage';

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
    // registerListPage: {
    //     path: '/course/registration',
    //     title: 'Course Register Page',
    //     auth: true,
    //     component: RegistrationCourseListPage,
    // },
    // registerSavePage: {
    //     path: '/course/registration/:id',
    //     title: 'Course Register Page',
    //     auth: true,
    //     component: RegisterCourseSavePage,
    // },
};
