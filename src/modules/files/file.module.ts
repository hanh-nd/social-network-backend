import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { DbTypes, GridFsStorage } from 'multer-gridfs-storage';
import { MongoModule } from 'src/common/modules/mongo';
import { MongoService } from 'src/common/modules/mongo/mongo.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
    imports: [
        JwtModule,
        MulterModule.registerAsync({
            imports: [MongoModule],
            inject: [MongoService],
            useFactory: (mongoService: MongoService) => {
                const gridFsStorage = new GridFsStorage({
                    db: mongoService.connection.db as unknown as DbTypes,
                    file: (req: any, file) => {
                        return new Promise((resolve, reject) => {
                            const filename = file.originalname.trim();
                            const fileInfo = {
                                filename: filename,
                                metadata: {
                                    userId: req.user.userId,
                                    username: req.user.username,
                                },
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
    controllers: [FileController],
    providers: [FileService],
    exports: [FileService],
})
export class FileModule {}
