import { SubscribeRequestStatus } from 'src/common/constants';
import { ICommonGetListQuery } from 'src/common/interfaces';
import { ICreatePostBody } from '../posts/post.interface';

export interface IGetGroupPostListQuery extends ICommonGetListQuery {
    status?: SubscribeRequestStatus;
}

export interface ICreateGroupPostBody extends ICreatePostBody {
    status: SubscribeRequestStatus;
}

export interface IUpdateGroupPostBody {
    status: SubscribeRequestStatus;
}
