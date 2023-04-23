import { HttpException } from '@nestjs/common';
import { HttpStatus } from 'src/common/constants';

export class TokenExpiredException extends HttpException {
    constructor(message?: string) {
        super(message || 'Token đã hết hạn sử dụng.', HttpStatus.UNAUTHORIZED);
    }
}
