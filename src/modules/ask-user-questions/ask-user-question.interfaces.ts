import { ICommonGetListQuery } from 'src/common/interfaces';

export interface ICreateAskUserQuestionBody {
    receiver: string;
    isAnonymous: boolean;
    question: string;
}

export interface IGetAskUserQuestionQuery extends ICommonGetListQuery {}

export interface IUpdateAskUserQuestionBody {
    answer: string;
}
