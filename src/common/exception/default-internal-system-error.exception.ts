import { InternalServerErrorException } from '@nestjs/common';
import { CommonMessage } from '../constants';

export class DefaultInternalServerErrorException extends InternalServerErrorException {
    constructor(message?: string) {
        super(message || CommonMessage.AN_ERROR_OCCURRED);
    }
}
