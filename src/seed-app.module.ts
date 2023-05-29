import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './common/modules/mongo';
import { WinstonModule } from './common/modules/winston';
import { DataServicesModule } from './common/repositories/data-services.module';
import { DataResourcesModule } from './common/resources/data-resources.module';
import { SeedsModule } from './modules/seeder/seed.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MongoModule,
        DataServicesModule,
        DataResourcesModule,
        WinstonModule,
        SeedsModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
    exports: [],
})
export class SeedAppModule implements NestModule {
    configure() {
        mongoose.set('debug', true);
    }
}
