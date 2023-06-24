import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import {
    ICreateSystemMessageBody,
    IGetSystemMessageQuery,
    IUpdateSystemMessageBody,
} from './moderator-system-message.interfaces';
import { SystemMessageService } from './moderator-system-message.service';

@Controller('/admin/system-messages')
@UseGuards(AccessTokenGuard)
export class SystemMessageController {
    constructor(private configService: ConfigService, private systemMessageService: SystemMessageService) {}

    private readonly logger = createWinstonLogger(SystemMessageController.name, this.configService);

    @Get('/')
    async getMessages(@Query(new RemoveEmptyQueryPipe()) query: IGetSystemMessageQuery) {
        try {
            const result = await this.systemMessageService.getMessageList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getMessages] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Post('/')
    async createMessage(@Body(new TrimBodyPipe()) body: ICreateSystemMessageBody) {
        try {
            const result = await this.systemMessageService.createMessage(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createMessage] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Patch('/:id')
    async updateMessage(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateSystemMessageBody) {
        try {
            const result = await this.systemMessageService.updateMessage(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateMessage] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Delete('/id')
    async deleteMessage(@Param('id') id: string) {
        try {
            const result = await this.systemMessageService.deleteMessage(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteMessage] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
