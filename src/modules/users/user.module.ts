import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [DataServicesModule],
    providers: [JwtService, UserService],
    controllers: [UserController],
})
export class UserModule {}
