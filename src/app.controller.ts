import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessTokenGuard } from './common/guards';
import { SuccessResponse } from './common/helper';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/ping')
    @UseGuards(AccessTokenGuard)
    getHello() {
        const result = this.appService.getHello();
        return new SuccessResponse(result);
    }
}
