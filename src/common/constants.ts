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
    UPDATE_POST = 'UPDATE_POST',
    DELETE_POST = 'DELETE_POST',

    UPDATE_PROFILE = 'UPDATE_PROFILE',
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',

    MOD_POST = 'MOD_POST',
    MO_REPORT = 'MOD_REPORT',

    ADMIN_USER = 'ADMIN_USER',
}

export const DEFAULT_USER_PERMISSIONS = [
    PermissionName.UPDATE_PROFILE,
    PermissionName.CHANGE_PASSWORD,
    PermissionName.CREATE_POST,
    PermissionName.UPDATE_POST,
    PermissionName.DELETE_POST,
];

export const DEFAULT_MODERATOR_PERMISSIONS = [PermissionName.MOD_POST, PermissionName.MO_REPORT];

export const DEFAULT_ADMIN_PERMISSIONS = [
    ...DEFAULT_USER_PERMISSIONS,
    ...DEFAULT_MODERATOR_PERMISSIONS,
    PermissionName.ADMIN_USER,
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
