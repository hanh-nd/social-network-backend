import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { IUpdateJobBody } from './core-settings.interface';
import { CoreSettingsService } from './core-settings.service';

@Controller('/admin/core-settings')
export class CoreSettingsController {
    constructor(private configService: ConfigService, private coreSettingsService: CoreSettingsService) {}

    private readonly logger = createWinstonLogger(CoreSettingsController.name, this.configService);

    @Get('/jobs')
    async getJobList() {
        try {
            const result = await this.coreSettingsService.getJobList();
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getJobList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/jobs/:key')
    async updateJob(@Param('key') key: string, @Body(new TrimBodyPipe()) body: IUpdateJobBody) {
        try {
            const result = await this.coreSettingsService.updateJob(key, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateJob] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
