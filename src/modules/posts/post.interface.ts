import { ICommonGetListQuery } from 'src/common/interfaces';

export interface ICreatePostBody {
    content: string;
    privacy?: number;
    discussedInId?: string;
    postSharedId?: string;
    pictureIds?: string[];
    videoIds?: string[];
}

export interface IUpdatePostBody {
    content?: string;
    privacy?: number;
    pictureIds?: string[];
    videoIds?: string[];
}

export interface IGetPostListQuery extends ICommonGetListQuery {}
