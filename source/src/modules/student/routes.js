import apiConfig from '@constants/apiConfig';
import StudentListPage from '.';
import StudentSavePage from './StudentSavePage';

export default {
    StudentListPage: {
        path: '/student',
        title: 'Student',
        auth: true,
        component: StudentListPage,
        permissions: [apiConfig.student.getList.baseURL],
    },
    StudentSavePage: {
        path: '/student/:id',
        title: 'Student Save Page',
        auth: true,
        component: StudentSavePage,
        permissions: [apiConfig.student.create.baseURL, apiConfig.student.update.baseURL],
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
