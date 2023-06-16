import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { IDataServices } from 'src/common/repositories/data.service';
import { DefaultSystemMessageCode, SystemMessageType } from '../system-messages/sytem-message.constants';

const data = [
    {
        code: DefaultSystemMessageCode.TIME_LIMIT_WARNING,
        type: SystemMessageType.WARNING,
        template: `Bạn đã online trong @{minutes} phút rồi đó. Hãy nghỉ ngơi chút đi <3`,
        fullTemplate: `<div class="bold">Bạn đã online trong @{minutes} phút rồi đó. Hãy nghỉ ngơi chút đi <3</div>`,
    },
    {
        code: DefaultSystemMessageCode.HAPPY_BIRTHDAY,
        type: SystemMessageType.INFO,
        template: `Hôm nay là sinh nhật bạn nè. Chúc mừng sinh nhật <3`,
        fullTemplate: `<div class="happy-birthday"><div class="message">Chúc mừng sinh nhật, <div class="bold">@{_fullName}</div>! Hôm nay là một ngày đặc biệt, nơi chúng ta kỷ niệm sự xuất hiện của bạn trên hệ thống mạng xã hội này. Chúng tôi xin gửi lời chúc tốt đẹp nhất đến bạn, với hy vọng rằng ngày sinh nhật của bạn sẽ tràn đầy niềm vui, sức khỏe và thành công. Hãy tiếp tục đem đến niềm vui và kết nối cho mọi người xung quanh bạn. Chúc bạn có một ngày sinh nhật thật đáng nhớ và tràn đầy hạnh phúc!</div><img src="https://static.vecteezy.com/system/resources/previews/002/476/508/original/color-glossy-happy-birthday-balloons-banner-background-illustration-free-vector.jpg" width="100%" height="100%" /></div>`,
    },
    {
        code: DefaultSystemMessageCode.SLEEP_REMINDER,
        type: SystemMessageType.INFO,
        template: `Đã khuya lắm rồi đấy, tắt máy đi ngủ đi thôi bạn ơiiii...`,
        fullTemplate: `<div class="sleep-reminder"><div class="bold">Trời ơi bạn ơi, bây giờ là @{time} rồi. Đã khuya lắm rồi đấy, tắt máy đi ngủ đi thôi bạn ơiiii...</div><img src="https://www.boredpanda.com/blog/wp-content/uploads/2019/12/Cute-pineapple-remind-people-to-be-chill-and-sleep-more-5df1a8b6d50df__880.jpg" width="100%" height="100%" /></div>`,
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
