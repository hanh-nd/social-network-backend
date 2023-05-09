import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule, MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { GridFsStorage } from 'multer-gridfs-storage';
import { ConfigKey } from '../config';

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
    gridFsStorage: any;
    constructor(configService: ConfigService) {
        this.gridFsStorage = new GridFsStorage({
            url: configService.get<string>(ConfigKey.MONGO_DATABASE_CONNECTION_STRING),
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    const filename = file.originalname.trim();
                    const fileInfo = {
                        filename: filename,
                    };
                    resolve(fileInfo);
                });
            },
        });
    }

    createMulterOptions(): MulterModuleOptions {
        return {
            storage: this.gridFsStorage,
        };
    }
}

@Module({
    imports: [
        ConfigModule,
        MulterModule.registerAsync({
            useClass: GridFsMulterConfigService,
        }),
    ],
    providers: [GridFsMulterConfigService],
})
export class FilesModule {}
