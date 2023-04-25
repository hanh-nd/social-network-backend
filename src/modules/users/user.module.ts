import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { FileModule } from '../files/file.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, FileModule],
    providers: [JwtService, UserService],
    controllers: [UserController],
    exports: [],
})
export class UserModule {}
