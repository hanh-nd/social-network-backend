import { ICommonGetListQuery } from 'src/common/interfaces';

export interface IGetModUserStatisticQuery extends ICommonGetListQuery {
    range?: number;
}
