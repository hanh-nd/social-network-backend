import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataServicesModule } from './common/repositories/data-services.module';
import { FilesModule, MongoModule } from './common/services';
import { WinstonModule } from './common/services/winston.service';
import { AuthModule } from './modules/auth/auth.module';
import { SeedsModule } from './modules/seeder/seed.module';
import { UserModule } from './modules/users/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        DataServicesModule,
        MongoModule,
        AuthModule,
        FilesModule,
        WinstonModule,
        SeedsModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService, JwtService],
    exports: [],
})
export class AppModule implements NestModule {
    configure() {
        mongoose.set('debug', true);
    }
}
