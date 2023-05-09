import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('/files')
export class FileController {
    @Post('')
    @UseInterceptors(FilesInterceptor('file'))
    upload(@UploadedFiles() files) {
        const response = [];
        files.forEach((file) => {
            const fileResponse = {
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                id: file.id,
                filename: file.filename,
                metadata: file.metadata,
                bucketName: file.bucketName,
                chunkSize: file.chunkSize,
                size: file.size,
                md5: file.md5,
                uploadDate: file.uploadDate,
                contentType: file.contentType,
            };
            response.push(fileResponse);
        });
        return response;
    }
}
