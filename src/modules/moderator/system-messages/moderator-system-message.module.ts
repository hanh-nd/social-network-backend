import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SystemMessageController } from './moderator-system-message.controller';
import { SystemMessageService } from './moderator-system-message.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, JwtModule],
    controllers: [SystemMessageController],
    providers: [SystemMessageService],
    exports: [SystemMessageService],
})
export class SystemMessageModule {}
