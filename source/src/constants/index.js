import { commonMessage } from '@locales/intl';

export const apiUrl = process.env.REACT_APP_API;
export const enableExposure = process.env.REACT_APP_ENABLE_EXPOSURE === 'true';
export const apiTenantUrl = 'http://api-path/';

export const fixedPath = {
    privacy: `${apiUrl}${process.env.REACT_APP_PRIVACY_PATH}`,
    help: `${apiUrl}${process.env.REACT_APP_HELP_PATH}`,
    aboutUs: `${apiUrl}${process.env.REACT_APP_ABOUT_US_PATH}`,
};

export const brandName = 'CMS';

export const appName = 'media-cms-app';

export const storageKeys = {
    USER_ACCESS_TOKEN: `${appName}-user-access-token`,
    USER_REFRESH_TOKEN: `${appName}-user-refresh-token`,
    USER_KIND: `${appName}-${process.env.REACT_APP_ENV}-user-kind`,
    TENANT_HEADER: `X-tenant`,
    TENANT_API_URL: `${appName}-${process.env.REACT_APP_ENV}-tenant-api-url`,
};

export const AppConstants = {
    apiRootUrl: process.env.REACT_APP_API,
    contentRootUrl: `${process.env.REACT_APP_API_MEDIA}v1/file/download`,
    mediaRootUrl: `${process.env.REACT_APP_API_MEDIA}`,
    langKey: 'vi',
};

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
};

export const defaultLocale = 'en';
export const locales = ['en', 'vi'];

export const activityType = {
    GAME: 'game',
    VIDEO: 'video',
    ARTICLE: 'article',
    FOCUS_AREA: 'focus-area',
};

export const DATE_DISPLAY_FORMAT = 'DD-MM-YYYY HH:mm';
export const DATE_SHORT_MONTH_FORMAT = 'DD MMM YYYY';
export const TIME_FORMAT_DISPLAY = 'HH:mm';
export const DATE_FORMAT_VALUE = 'DD/MM/YYYY';
export const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY';
export const DEFAULT_FORMAT = 'DD/MM/YYYY HH:mm:ss';

export const navigateTypeEnum = {
    PUSH: 'PUSH',
    POP: 'POP',
    REPLACE: 'REPLACE',
};

export const articleTypeEnum = {
    URL: 'url',
    PLAIN: 'plain',
};

export const accessRouteTypeEnum = {
    NOT_LOGIN: false,
    REQUIRE_LOGIN: true,
    BOTH: null,
};

export const UploadFileTypes = {
    AVATAR: 'AVATAR',
    LOGO: 'LOGO',
    DOCUMENT: 'DOCUMENT',
};

export const LIMIT_IMAGE_SIZE = 512000;

export const STATUS_PENDING = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_INACTIVE = -1;
export const STATUS_DELETE = -2;

export const DEFAULT_TABLE_ITEM_SIZE = 10;
export const DEFAULT_TABLE_ITEM_SIZE_XL = 20;
export const DEFAULT_TABLE_PAGE_START = 0;

export const commonStatus = {
    PENDING: 0,
    ACTIVE: 1,
    INACTIVE: -1,
    DELETE: -2,
};

export const UserTypes = {
    ADMIN: 1,
    MANAGER: 2,
    STUDENT: 3,
    LEADER: 4,
    COMPANY: 5,
    DEVELOPER: 4,
};

export const commonStatusColor = {
    [commonStatus.PENDING]: 'warning',
    [commonStatus.ACTIVE]: 'green',
    [commonStatus.INACTIVE]: 'red',
};

export const categoryKind = {
    news: 1,
};

export const appAccount = {
    APP_USERNAME: process.env.REACT_APP_USERNAME,
    APP_PASSWORD: process.env.REACT_APP_PASSWORD,
};

export const GROUP_KIND_ADMIN = 1;
export const GROUP_KIND_MANAGER = 2;
export const GROUP_KIND_USER = 3;

export const REGISTRATION_STATE_REGISTER = 1;
export const REGISTRATION_STATE_LEARNING = 2;
export const REGISTRATION_STATE_FINISHED = 3;
export const REGISTRATION_STATE_CANCEL = 4;

export const STATE_COURSE_PREPARED = 1;
export const STATE_COURSE_REGISTRATION = 1;
export const STATE_COURSE_STARTED = 2;
export const STATE_COURSE_LEARNING = 2;
export const STATE_COURSE_FINISHED = 3;
export const STATE_COURSE_CANCELED = 4;
export const STATE_COURSE_RECRUITED = 5;

export const STATE_COURSE_REGISTRATION_REGISTRATION = 1;
export const STATE_COURSE_REGISTRATION_LEARNING = 2;
export const STATE_COURSE_REGISTRATION_COMPLETED = 3;
export const STATE_COURSE_REGISTRATION_CANCELED = 4;

export const STATE_PROJECT_CREATE = 1;
export const STATE_PROJECT_RUNNING = 2;
export const STATE_PROJECT_DONE = 3;
export const STATE_PROJECT_CANCEL = 4;
export const STATE_PROJECT_FAILED = 5;

export const STATE_TASK_CREATE = 1;
export const STATE_TASK_RUNNING = 2;
export const STATE_TASK_CANCEL = 3;
export const STATE_TASK_TEST = 4;

export const SALARY_HOUR = 1;
export const SALARY_FIXED = 2;

export const TASK_KIND_FEATURE = 1;
export const TASK_KIND_BUG = 2;
export const TASK_KIND_TESTCASE = 3;

export const groupPermissionKindsOptions = [
    { label: 'Admin', value: GROUP_KIND_ADMIN },
    { label: 'Manager', value: GROUP_KIND_MANAGER },
    { label: 'User', value: GROUP_KIND_USER },
];

export const isSystemSettingOptions = [
    { label: commonMessage.showSystemSettings, value: 1 },
    { label: commonMessage.hideSystemSettings, value: 0 },
];

export const PROVINCE_KIND = 1;
export const DISTRICT_KIND = 2;
export const VILLAGE_KIND = 3;

export const SettingTypes = {
    Money: 'Money',
    Timezone: 'Timezone',
    System: 'System',
};

export const ADMIN_LOGIN_TYPE = 'password';
