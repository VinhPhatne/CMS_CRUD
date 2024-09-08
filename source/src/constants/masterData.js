import { STATUS_ACTIVE, STATUS_INACTIVE, STATUS_PENDING,PROVINCE_KIND,DISTRICT_KIND,VILLAGE_KIND, REGISTRATION_STATE_REGISTER, REGISTRATION_STATE_LEARNING, REGISTRATION_STATE_FINISHED, REGISTRATION_STATE_CANCEL, STATE_COURSE_PREPARED, STATE_COURSE_STARTED, STATE_COURSE_FINISHED, STATE_COURSE_CANCELED, STATE_COURSE_RECRUITED } from '@constants';
import { defineMessages } from 'react-intl';
import {
    nationKindMessage,
    actionMessage,
    stateResgistrationMessage,
    stateCourseMessage,
} from './intl';

const commonMessage = defineMessages({
    statusActive: 'Active',
    statusPending: 'Pending',
    statusInactive: 'Inactive',
});

export const languageOptions = [
    { value: 1, label: 'EN' },
    { value: 2, label: 'VN' },
    { value: 3, label: 'Other' },
];

export const stateResgistration = [
    { value: REGISTRATION_STATE_REGISTER, label: stateResgistrationMessage.register, color: '#00A648' },
    { value: REGISTRATION_STATE_LEARNING, label: stateResgistrationMessage.learning, color: '#FFBF00' },
    { value: REGISTRATION_STATE_FINISHED, label: stateResgistrationMessage.finished, color: '#CC0000' },
    { value: REGISTRATION_STATE_CANCEL, label: stateResgistrationMessage.canceled, color: '#CC0000' },
];

export const orderOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

export const commonStatus = [
    { value: STATUS_ACTIVE, label: 'Active', color: 'green' },
    { value: STATUS_PENDING, label: 'Pending', color: 'warning' },
    { value: STATUS_INACTIVE, label: 'Inactive', color: 'red' },
];

export const statusOptions = [
    { value: STATUS_ACTIVE, label: commonMessage.statusActive, color: '#00A648' },
    { value: STATUS_PENDING, label: commonMessage.statusPending, color: '#FFBF00' },
    { value: STATUS_INACTIVE, label: commonMessage.statusInactive, color: '#CC0000' },
];

export const stateCourseOptions = [
    { value: STATE_COURSE_PREPARED, label: stateCourseMessage.prepared, color: '#00A648' },
    { value: STATE_COURSE_STARTED, label: stateCourseMessage.started, color: '#FFBF00' },
    { value: STATE_COURSE_FINISHED, label: stateCourseMessage.finished, color: '#CC0000' },
    { value: STATE_COURSE_CANCELED, label: stateCourseMessage.canceled, color: '#CC0000' },
    { value: STATE_COURSE_RECRUITED, label: stateCourseMessage.recruitment, color: '#CC0000' },
];

export const stateOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
    { value: 3, label: 'Pending' },
];

export const formSize = {
    small: '700px',
    normal: '800px',
    big: '900px',
};

export const nationKindOptions = [
    {
        value: PROVINCE_KIND,
        label: nationKindMessage.province,
    },
    {
        value: DISTRICT_KIND,
        label: nationKindMessage.district,
    },
    {
        value: VILLAGE_KIND,
        label: nationKindMessage.village,
    },
];

export const kindPost = [
    {
        value: 1,
        label: 'Post',
        color: 'green',
    },
    {
        value: 2,
        label: 'Story',
        color: 'blue',
    },
   
];

export const settingGroups = {
    GENERAL: 'general',
    PAGE: 'page_config',
    REVENUE: 'revenue_config',
    TRAINING: 'training_config',
};
export const dataTypeSetting = {
    INT: 'int',
    STRING: 'string',
    BOOLEAN: 'boolean',
    DOUBLE: 'double',
    RICHTEXT: 'richtext',
};

export const settingKeyName = {
    MONEY_UNIT: 'money_unit',
    TRAINING_UNIT: 'training_percent',
    BUG_UNIT: 'training_project_percent',
    NUMBER_OF_TRAINING_PROJECT: 'number_of_training_projects',
};

export const actionOptions = [
    {
        value: 1,
        label: actionMessage.contactForm,
    },
    { value: 2, label: actionMessage.navigation },
];