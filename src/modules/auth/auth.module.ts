import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DataServicesModule } from 'src/common/repositories/data-services.module';

@Module({
    imports: [JwtModule.register({}), DataServicesModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
