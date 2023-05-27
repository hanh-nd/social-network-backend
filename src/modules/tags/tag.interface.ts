export interface ICreateTagBody {
    name: string;
    iconId: string;
}

export interface IUpdateTagBody {
    name?: string;
    iconId?: string;
}

export interface IBulkDeleteTagBody {
    ids: string[];
}
