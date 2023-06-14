import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule],
    controllers: [StatisticController],
    providers: [StatisticService],
})
export class StatisticModule {}
