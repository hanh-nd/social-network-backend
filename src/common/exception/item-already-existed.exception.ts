import { HttpException } from '@nestjs/common';
import { HttpStatus } from 'src/common/constants';

export class ItemAlreadyExistedException extends HttpException {
    constructor(message?: string) {
        super(message || 'Đã tồn tại trên hệ thống.', HttpStatus.ITEM_ALREADY_EXIST);
    }
}
