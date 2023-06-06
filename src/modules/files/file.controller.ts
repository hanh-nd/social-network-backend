import { Controller, Get, Param, Post, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as _ from 'lodash';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { FileService } from './file.service';

@Controller('/files')
export class FileController {
    constructor(private configService: ConfigService, private fileService: FileService) {}

    private readonly logger = createWinstonLogger(FileController.name, this.configService);

    @Post('/upload')
    @UseGuards(AccessTokenGuard)
    @UseInterceptors(FilesInterceptor('files'))
    upload(@UploadedFiles() files) {
        try {
            const result = files.map((file) =>
                _.pick(
                    file,
                    'originalname',
                    'encoding',
                    'mimetype',
                    'id',
                    'filename',
                    'metadata',
                    'bucketName',
                    'chunkSize',
                    'size',
                    'md5',
                    'uploadDate',
                    'contentType',
                ),
            );
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[readStream] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    async readStream(@Param('id') id: string, @Res() res) {
        try {
            await this.fileService.findById(id);
            const fileStream = await this.fileService.readStream(id);
            return fileStream.pipe(res);
        } catch (error) {
            this.logger.error(`[readStream] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
