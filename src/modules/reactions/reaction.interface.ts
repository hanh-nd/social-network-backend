import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetReactionListQuery extends ICommonGetListQuery {}

export interface ICreateReactionBody {
    type: string;
}
