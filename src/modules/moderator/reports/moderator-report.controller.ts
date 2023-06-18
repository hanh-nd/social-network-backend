import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionName } from 'src/common/constants';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { IGetReportListQuery } from 'src/modules/reports/report.interface';
import { IUpdateReportBody } from './moderator-report.interface';
import { ModeratorReportService } from './moderator-report.service';

@Controller('/admin/reports')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class ModeratorReportController {
    constructor(private configService: ConfigService, private moderatorReportService: ModeratorReportService) {}

    private readonly logger = createWinstonLogger(ModeratorReportController.name, this.configService);

    @Get('/')
    @Permissions([PermissionName.GET_REPORT])
    async getReportList(@Query(new RemoveEmptyQueryPipe()) query: IGetReportListQuery) {
        try {
            const result = await this.moderatorReportService.getReportList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorReportController][getReportList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/accept')
    @Permissions([PermissionName.UPDATE_REPORT])
    async acceptReport(@Param('id') id: string) {
        try {
            const result = await this.moderatorReportService.acceptReport(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorReportController][acceptReport] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/reject')
    @Permissions([PermissionName.UPDATE_REPORT])
    async rejectReport(@Param('id') id: string) {
        try {
            const result = await this.moderatorReportService.rejectReport(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorReportController][rejectReport] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    @Permissions([PermissionName.UPDATE_REPORT])
    async updateReport(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateReportBody) {
        try {
            const result = await this.moderatorReportService.updateReport(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorReportController][updateReport] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
