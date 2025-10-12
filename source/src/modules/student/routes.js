import apiConfig from '@constants/apiConfig';
import StudentListPage from '.';
import StudentSavePage from './StudentSavePage';
import CourseRegistration from './course/CourseRegistration';
import ProjectRegistration from './course/ProjectRegistration';
import ProjectRegistrationSavePage from './course/ProjectRegistrationSavePage';

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
    CourseRegisterListPage: {
        path: '/student/course',
        title: 'Student Course Register Page',
        auth: true,
        component: CourseRegistration,
    },
    ProjectRegisterListPage: {
        path: '/student/registration-project',
        title: 'Student Project Register Page',
        auth: true,
        component: ProjectRegistration,
    },
    ProjectRegisterSavePage: {
        path: '/student/registration-project/:id',
        title: 'Student Project Register Page',
        auth: true,
        component: ProjectRegistrationSavePage,
    },
};
