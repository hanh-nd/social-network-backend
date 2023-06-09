import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { IDataServices } from 'src/common/repositories/data.service';
import { DefaultSystemMessageCode, SystemMessageType } from '../system-messages/sytem-message.constants';

const data = [
    {
        code: DefaultSystemMessageCode.TIME_LIMIT_WARNING,
        type: SystemMessageType.WARNING,
        template: `Bạn đã online trong @{minutes} phút rồi đó. Hãy nghỉ ngơi chút đi <3`,
        fullTemplate: `Bạn đã online trong @{minutes} phút rồi đó. Hãy nghỉ ngơi chút đi <3`,
    },
];

@Injectable()
export class SystemMessageSeedService {
    constructor(private readonly dataServices: IDataServices) {}

    @Command({ command: 'create:system_messages', describe: 'create default system messages' })
    async create() {
        for (const message of data) {
            await this.dataServices.systemMessages.updateOne(
                {
                    code: message.code,
                },
                {
                    code: message.code,
                    type: message.type,
                    template: message.template,
                    fullTemplate: message.fullTemplate,
                },
                {
                    upsert: true,
                },
            );
        }
        console.log('===== Seeded successfully');
        return;
    }
}
