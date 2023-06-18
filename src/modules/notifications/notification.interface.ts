import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetNotificationListQuery extends ICommonGetListQuery {
    isRead?: string;
    userId?: string;
}
