import { ICommonGetListQuery } from 'src/common/interfaces';
import { SurveyType } from './moderator-surveys.constants';

export interface IGetSurveyListQuery extends ICommonGetListQuery {}

export interface ICreateSurveyBody {
    name: string;
    description?: string;
    type: SurveyType;
    question: string;
    askDate: Date;
    urgent: boolean;
}

export interface IUpdateSurveyBody extends Partial<ICreateSurveyBody> {}

export interface IAnswerSurveyBody {
    answer: string;
}

export interface IGetUserAnswerQuery extends ICommonGetListQuery {}
