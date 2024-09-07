import apiConfig from '@constants/apiConfig';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';
// import RegisterCourseSavePage from './register/RegisterCourseSavePage';
// import RegistrationCourseListPage from './register';

export default {
    projectListPage: {
        path: '/project',
        title: 'Project',
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
