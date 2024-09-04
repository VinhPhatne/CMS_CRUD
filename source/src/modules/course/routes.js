import apiConfig from '@constants/apiConfig';
import CoursePage from '.';
import CourseSavePage from './CourseSavePage';

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
};
