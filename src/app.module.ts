import { Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule, MongoModule } from './common/services';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        MongoModule,
        FilesModule,
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
