import { ICommonGetListQuery } from 'src/common/interfaces';
import { ICreateGroupPostBody } from '../group-posts/group-post.interface';

export interface ICreateNewGroupBody {
    name: string;
    private?: boolean;
    reviewPost?: boolean;
    summary?: string;
    coverId?: string;
}

export interface IUpdateGroupBody {
    name?: string;
    private?: boolean;
    reviewPost?: boolean;
    summary?: string;
    coverId?: string;
}

export interface IGetJoinRequestListQuery extends ICommonGetListQuery {}

export interface ICreatePostInGroupBody extends ICreateGroupPostBody {}
