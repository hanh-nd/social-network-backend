import { Injectable } from '@nestjs/common';
import { HttpStatus } from '../constants';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_SUCCESS_MESSAGE = 'success';

export interface IErrorResponse {
    key?: string;
    errorCode: number;
    message?: string;
    order?: number;
    bookingId?: number;
}

export class SuccessResponse {
    constructor(data = {}) {
        return {
            code: HttpStatus.OK,
            message: DEFAULT_SUCCESS_MESSAGE,
            data,
        };
    }
}
export class ErrorResponse {
    constructor(code = HttpStatus.INTERNAL_SERVER_ERROR, message = '', errors: IErrorResponse[] = []) {
        return {
            code,
            message,
            errors,
        };
    }
}

@Injectable()
export class ApiResponse<T> {
    public code: number;

    public message: string;

    public data: T;

    public errors: IErrorResponse[];
}
