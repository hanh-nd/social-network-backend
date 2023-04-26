export interface ICreatePostBody {
    content: string;
    privacy?: number;
    discussedInId?: string;
    pictureIds?: string[];
    videoIds?: string[];
}

export interface IUpdatePostBody {
    content?: string;
    privacy?: number;
    pictureIds?: string[];
    videoIds?: string[];
}
