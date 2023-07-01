import { ICommonGetListQuery } from 'src/common/interfaces';

export interface ICreatePostBody {
    content: string;
    privacy?: number;
    discussedInId?: string;
    postedInGroupId?: string;
    postSharedId?: string;
    pictureIds?: string[];
    videoIds?: string[];
    isAnonymous?: boolean;
}

export interface IUpdatePostBody {
    content?: string;
    privacy?: number;
    pictureIds?: string[];
    videoIds?: string[];
    tagIds?: string[];
}

export interface IGetPostListQuery extends ICommonGetListQuery {}
