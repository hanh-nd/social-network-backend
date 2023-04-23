import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsStorage } from 'multer-gridfs-storage';
import { ConfigKey } from '../config';

@Module({
    imports: [
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const gridFsStorage = new GridFsStorage({
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
                return {
                    storage: gridFsStorage,
                };
            },
        }),
    ],
})
export class FilesModule {}
