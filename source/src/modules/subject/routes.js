import apiConfig from '@constants/apiConfig';
import SubjectListPage from '.';
import SubjectSavePage from './SubjectSavePage';
import LectureListPage from './lecture';
import LectureSavePage from './lecture/LectureSavePage';

export default {
    SubjectListPage: {
        path: '/subject',
        title: 'Subjects',
        auth: true,
        component: SubjectListPage,
        permissions: [apiConfig.subject.getList.baseURL],
    },
    SubjectSavePage: {
        path: '/subject/:id',
        title: 'Subject Save Page',
        auth: true,
        component: SubjectSavePage,
        permissions: [apiConfig.subject.create.baseURL, apiConfig.subject.update.baseURL],
    },
    LectureListPage: {
        path: '/subject/lecture/:id',
        title: 'Lecture Page',
        auth: true,
        component: LectureListPage,
        permissions: [apiConfig.lecture.getList.baseURL],
    },
    LectureSavePage: {
        path: '/subject/lecture/:subjectId/:id',
        title: 'Lecture Save Page',
        auth: true,
        component: LectureSavePage,
        permissions: [apiConfig.lecture.create.baseURL, apiConfig.lecture.update.baseURL],
    },
};
