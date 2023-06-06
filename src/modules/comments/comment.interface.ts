import { ICommonGetListQuery } from 'src/common/interfaces';

export interface ICreateCommentBody {
    content: string;
    pictureId?: string;
    videoId?: string;
}

export interface IUpdateCommentBody {
    content?: string;
    pictureId?: string;
    videoId?: string;
}

export interface IGetCommentListQuery extends ICommonGetListQuery {}
