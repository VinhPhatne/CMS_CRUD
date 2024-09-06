import apiConfig from '@constants/apiConfig';
import CoursePage from '.';
import CourseSavePage from './CourseSavePage';
import RegisterCourseSavePage from './register/RegisterCourseSavePage';
import RegistrationCourseListPage from './register';

export default {
    coursesPage: {
        path: '/course',
        title: 'Courses',
        auth: true,
        component: CoursePage,
        permissions: [apiConfig.courses.getList.baseURL],
    },
    coursesSavePage: {
        path: '/course/:id',
        title: 'Course Save Page',
        auth: true,
        component: CourseSavePage,
        permissions: [apiConfig.courses.create.baseURL, apiConfig.courses.update.baseURL],
    },
    registerListPage: {
        path: '/course/registration',
        title: 'Course Register Page',
        auth: true,
        component: RegistrationCourseListPage,
    },
    registerSavePage: {
        path: '/course/registration/:id',
        title: 'Course Register Page',
        auth: true,
        component: RegisterCourseSavePage,
    },
};
