import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetSubscribeRequestListQuery extends ICommonGetListQuery {}

export interface IUpdateSubscribeRequestBody {
    status: number;
}
