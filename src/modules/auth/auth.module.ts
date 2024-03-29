import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { NodeMailerModule } from 'src/common/modules/nodemailer/nodemailer.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [JwtModule.register({}), DataServicesModule, DataResourcesModule, ElasticsearchModule, NodeMailerModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
