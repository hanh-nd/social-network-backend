import { ForbiddenException, Injectable } from '@nestjs/common';
import { round } from 'lodash';
import * as moment from 'moment';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { IGetStatisticQuery } from './statistic.interfaces';

@Injectable()
export class StatisticService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async getUserStatistics(userId: string, query: IGetStatisticQuery) {
        const { range = 7 } = query;
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const startStatisticDay = moment().subtract(range, 'day').format('YYYYMMDD');
        const userDailyStatistics = await this.dataServices.userDailyStatistics.findAll({
            userId: toObjectId(userId),
            createdDate: {
                $gte: startStatisticDay,
            },
        });

        const statistics = userDailyStatistics.map((day) => {
            return {
                date: day.createdDate,
                spentHour: round(day.spentTimeSecond / 3600, 1),
                point: day.point,
            };
        });

        return statistics;
    }
}
