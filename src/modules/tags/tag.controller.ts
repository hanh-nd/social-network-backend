import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { IBulkDeleteTagBody, ICreateTagBody, IUpdateTagBody } from './tag.interface';
import { TagService } from './tag.service';

@Controller('/tags')
@UseGuards(AccessTokenGuard)
export class TagController {
    constructor(private configService: ConfigService, private tagService: TagService) {}

    private readonly logger = createWinstonLogger(TagController.name, this.configService);

    @Get('/')
    async getTags() {
        try {
            const result = await this.tagService.getTags();
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getTags] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Post('/')
    async createTag(@Body(new TrimBodyPipe()) body: ICreateTagBody) {
        try {
            const result = await this.tagService.createTag(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createTag] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Patch('/:id')
    async updateTag(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateTagBody) {
        try {
            const result = await this.tagService.updateTag(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateTag] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Delete('/')
    async deleteTags(@Body(new TrimBodyPipe()) body: IBulkDeleteTagBody) {
        try {
            const result = await this.tagService.bulkDeleteTag(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteTags] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
