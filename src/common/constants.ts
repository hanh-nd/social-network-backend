import Joi from 'src/plugins/joi';

export const Regex = {
    URI: /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/,
    EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{1,255}$/,
    NUMBER: /^(?:[0-9]\d*|)$/,
    CODE: /^[a-zA-Z\-_0-9]+$/,
    PHONE: /^[0-9]{1,15}$/,
    POSTAL_CODE: /^[0-9]{1,10}$/,
    HEX_COLOR: /^[0-9a-fA-F]{6}/,
};

export const MIN_PAGE_VALUE = 1;
export const MIN_PAGE_LIMIT = 1;
export const DEFAULT_PAGE_VALUE = 1;
export const DEFAULT_PAGE_LIMIT = 10;

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum OrderBy {
    ID = '_id',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export const CommonListQuerySchema = {
    page: Joi.number().min(MIN_PAGE_VALUE).optional().allow(null),
    limit: Joi.number().min(MIN_PAGE_LIMIT).optional().allow(null),
    keyword: Joi.string().optional().allow(null, ''),
    orderDirection: Joi.string()
        .valid(...Object.values(OrderDirection))
        .optional(),
    orderBy: Joi.string()
        .valid(...Object.values(OrderBy))
        .optional(),
};

export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INVALID_USERNAME_OR_PASSWORD = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    GROUP_HAS_CHILDREN = 410,
    GROUP_MAX_QUANTITY = 412,
    ITEM_NOT_FOUND = 444,
    ITEM_ALREADY_EXIST = 445,
    ITEM_INVALID = 446,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

export enum RoleName {
    USER = 'User',
    MODERATOR = 'Moderator',
    ADMIN = 'Admin',
}

export enum PermissionName {
    CREATE_POST = 'CREATE_POST',
    GET_POST = 'GET_POST',
    UPDATE_POST = 'UPDATE_POST',
    DELETE_POST = 'DELETE_POST',
    CREATE_COMMENT = 'CREATE_COMMENT',
    GET_COMMENT = 'GET_COMMENT',
    UPDATE_COMMENT = 'UPDATE_COMMENT',
    DELETE_COMMENT = 'DELETE_COMMENT',
    GET_POST_STATISTIC = 'GET_POST_STATISTIC',
    BULK_DELETE_POST = 'BULK_DELETE_POST',

    CREATE_CHAT = 'CREATE_CHAT',
    GET_CHAT = 'GET_CHAT',
    UPDATE_CHAT = 'UPDATE_CHAT',
    DELETE_CHAT = 'DELETE_CHAT',
    CREATE_MESSAGE = 'CREATE_MESSAGE',
    GET_MESSAGE = 'GET_MESSAGE',
    RECALL_MESSAGE = 'RECALL_MESSAGE',
    DELETE_MESSAGE = 'DELETE_MESSAGE',

    CREATE_GROUP = 'CREATE_GROUP',
    GET_GROUP = 'GET_GROUP',
    UPDATE_GROUP = 'UPDATE_GROUP',
    DELETE_GROUP = 'DELETE_GROUP',

    CREATE_REPORT = 'CREATE_REPORT',
    GET_REPORT = 'GET_REPORT',
    UPDATE_REPORT = 'UPDATE_REPORT',
    DELETE_REPORT = 'DELETE_REPORT',

    CREATE_PROFILE = 'CREATE_PROFILE',
    GET_PROFILE = 'GET_PROFILE',
    UPDATE_PROFILE = 'UPDATE_PROFILE',
    DELETE_PROFILE = 'DELETE_PROFILE',
    GET_USER_STATISTIC = 'GET_USER_STATISTIC',
}

export const MANAGE_POST_PERMISSIONS = [
    PermissionName.CREATE_POST,
    PermissionName.UPDATE_POST,
    PermissionName.GET_POST,
    PermissionName.DELETE_POST,
    PermissionName.CREATE_COMMENT,
    PermissionName.UPDATE_COMMENT,
    PermissionName.GET_COMMENT,
    PermissionName.DELETE_COMMENT,
];

export const MODERATE_POST_PERMISSIONS = [, PermissionName.BULK_DELETE_POST];
export const MODERATE_USER_PERMISSIONS = [];

export const MANAGE_CHAT_PERMISSIONS = [
    PermissionName.CREATE_CHAT,
    PermissionName.GET_CHAT,
    PermissionName.UPDATE_CHAT,
    PermissionName.DELETE_CHAT,
    PermissionName.CREATE_MESSAGE,
    PermissionName.GET_MESSAGE,
    PermissionName.RECALL_MESSAGE,
];

export const MANAGE_GROUP_PERMISSIONS = [
    PermissionName.CREATE_GROUP,
    PermissionName.GET_GROUP,
    PermissionName.UPDATE_GROUP,
    PermissionName.DELETE_GROUP,
];

export const USER_REPORT_PERMISSIONS = [PermissionName.CREATE_REPORT, PermissionName.GET_REPORT];

export const MODERATOR_REPORT_PERMISSIONS = [PermissionName.UPDATE_REPORT, PermissionName.DELETE_REPORT];

export const USER_PROFILE_PERMISSIONS = [PermissionName.GET_PROFILE, PermissionName.UPDATE_PROFILE];

export const ADMINISTRATOR_PROFILE_PERMISSIONS = [
    PermissionName.CREATE_PROFILE,
    PermissionName.UPDATE_PROFILE,
    PermissionName.DELETE_PROFILE,
];

export const DEFAULT_USER_PERMISSIONS = [
    ...MANAGE_POST_PERMISSIONS,
    ...MANAGE_CHAT_PERMISSIONS,
    ...MANAGE_GROUP_PERMISSIONS,
    ...USER_REPORT_PERMISSIONS,
    ...USER_PROFILE_PERMISSIONS,
];

export const DEFAULT_MODERATOR_PERMISSIONS = [
    ...MANAGE_POST_PERMISSIONS,
    ...MODERATE_POST_PERMISSIONS,
    ...MANAGE_CHAT_PERMISSIONS,
    ...MODERATOR_REPORT_PERMISSIONS,
    ...MODERATE_USER_PERMISSIONS,
];

export const DEFAULT_ADMIN_PERMISSIONS = [
    ...DEFAULT_USER_PERMISSIONS,
    ...DEFAULT_MODERATOR_PERMISSIONS,
    ...ADMINISTRATOR_PROFILE_PERMISSIONS,
    PermissionName.GET_POST_STATISTIC,
    PermissionName.GET_USER_STATISTIC,
];

export const CommonMessage = {
    AN_ERROR_OCCURRED: 'Có lỗi xảy ra, vui lòng thử lại.',
};

export enum Privacy {
    PUBLIC = 1,
    SUBSCRIBED = 2,
    PRIVATE = 3,
}

export enum ElasticsearchIndex {
    USER = 'user',
    POST = 'post',
    GROUP = 'group',
}

export enum SubscribeRequestStatus {
    PENDING = 1,
    ACCEPTED = 2,
    REJECTED = 3,
}

export enum ReactionType {
    LIKE = 'LIKE',
    EMPATHIZE = 'EMPATHIZE',
    CELEBRATE = 'CELEBRATE',
    LOVE = 'LOVE',
    ANGRY = 'ANGRY',
}

export const ReactionTypePoint = {
    [ReactionType.LIKE]: 1,
    [ReactionType.EMPATHIZE]: 2,
    [ReactionType.CELEBRATE]: 3,
    [ReactionType.LOVE]: 5,
    [ReactionType.ANGRY]: -2,
};

export const ReactionTargetType = {
    POST: 'Post',
    COMMENT: 'Comment',
};

export enum ReportAction {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED',
}

export const ReportTargetType = {
    POST: 'Post',
    COMMENT: 'Comment',
    MESSAGE: 'Message',
    USER: 'User',
};

export const SHARE_POST_POINT = 5;
export const REPORT_POST_POST = 10;

export const NotificationTargetType = {
    POST: 'Post',
    COMMENT: 'Comment',
    MESSAGE: 'Message',
    USER: 'User',
};

export const NotificationAction = {
    REACT: 'REACT',
    COMMENT: 'COMMENT',
    SHARE: 'SHARE',
    SUBSCRIBE_PROFILE: 'SUBSCRIBE_PROFILE',
    SENT_SUBSCRIBE_REQUEST: 'SENT_SUBSCRIBE_REQUEST',
    ACCEPT_SUBSCRIBE_REQUEST: 'ACCEPT_SUBSCRIBE_REQUEST',
};

export const SocketEvent = {
    USER_LOGIN: 'USER_LOGIN',

    USER_REACT: 'USER_REACT',
    USER_SUBSCRIBE_PUBLIC: 'USER_SUBSCRIBE_PUBLIC',
    USER_SUBSCRIBE_PRIVATE: 'USER_SUBSCRIBE_PRIVATE',

    USER_CHAT: 'USER_CHAT',
    USER_RECALL: 'USER_RECALL',

    USER_NOTIFICATION: 'USER_NOTIFICATION',
};

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum Relationship {
    SINGLE = 'SINGLE',
    IN_A_RELATIONSHIP = 'IN_A_RELATIONSHIP',
    MARRIED = 'MARRIED',
}
