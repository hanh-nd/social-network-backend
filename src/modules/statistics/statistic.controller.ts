import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/common/guards';
import { createWinstonLogger } from 'src/common/modules/winston';
import { StatisticService } from './statistic.service';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { RemoveEmptyQueryPipe } from 'src/common/pipes';
import { IGetStatisticQuery } from './statistic.interfaces';
import { SuccessResponse } from 'src/common/helper';

@Controller('/statistics')
@UseGuards(AccessTokenGuard)
export class StatisticController {
    constructor(private configService: ConfigService, private statisticService: StatisticService) {}

    private readonly logger = createWinstonLogger(StatisticController.name, this.configService);

    @Get('/users')
    async getUserStatistics(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetStatisticQuery) {
        try {
            const result = await this.statisticService.getUserStatistics(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[StatisticController][getUserStatistics] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
