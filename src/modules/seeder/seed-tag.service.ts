import { Injectable } from '@nestjs/common';
import { capitalize } from 'lodash';
import { Command } from 'nestjs-command';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { IDataServices } from 'src/common/repositories/data.service';

const data = [
    { name: 'Tin tức và sự kiện hiện tại', code: 'news_events' },
    { name: 'Lối sống và sức khỏe', code: 'lifestyle_health' },
    { name: 'Mẹo và thủ thuật', code: 'tips_tricks' },
    { name: 'Hướng dẫn và hướng nghiệp', code: 'guides_career' },
    { name: 'Ẩm thực và công thức nấu ăn', code: 'cuisine_recipes' },
    { name: 'Du lịch và khám phá', code: 'travel_explore' },
    { name: 'Thể thao và thể hình', code: 'sports_fitness' },
    { name: 'Công nghệ và đánh giá sản phẩm', code: 'technology_product_reviews' },
    { name: 'Làm đẹp và chăm sóc da', code: 'beauty_skincare' },
    { name: 'Tâm lý và sức khỏe tinh thần', code: 'psychology_mental_health' },
    { name: 'Truyện ngắn và văn hóa đọc', code: 'short_stories_literature' },
    { name: 'Phong cách sống và thời trang', code: 'lifestyle_fashion' },
    { name: 'Nghệ thuật và sáng tạo', code: 'arts_creativity' },
    { name: 'Giáo dục và học tập', code: 'education_learning' },
    { name: 'Hài hước và giải trí', code: 'humor_entertainment' },
    { name: 'Tài chính và đầu tư', code: 'finance_investment' },
    { name: 'Hình ảnh và nhiếp ảnh', code: 'photography' },
    { name: 'Xe cộ và công nghệ ô tô', code: 'automotive_technology' },
    { name: 'Động vật và thiên nhiên', code: 'animals_nature' },
    { name: 'Lịch sử và văn hóa', code: 'history_culture' },
    { name: 'Phim ảnh và âm nhạc', code: 'movies_music' },
    { name: 'Thời trang và mua sắm', code: 'fashion_shopping' },
    { name: 'Tình yêu và mối quan hệ', code: 'love_relationships' },
    { name: 'Cuộc sống hàng ngày', code: 'daily_life' },
    { name: 'Pháp luật và quy định', code: 'law_regulations' },
    { name: 'Học hỏi và kiến thức', code: 'ask_knowledge' },
    { name: 'Kinh doanh trực tuyến', code: 'online_business' },
    { name: 'Thiên văn học', code: 'astronomy' },
    { name: 'Phát triển cá nhân', code: 'personal_development' },
    { name: 'Kiến trúc và xây dựng', code: 'architecture_construction' },
    { name: 'Gia đình và nuôi dạy con', code: 'family_parenting' },
    { name: 'Chăm sóc vật nuôi', code: 'pet_care' },
    { name: 'Khác', code: 'others' },
];

@Injectable()
export class TagSeedService {
    constructor(private readonly dataServices: IDataServices, private readonly redisService: RedisService) {}

    @Command({ command: 'create:tags', describe: 'create default tags' })
    async create() {
        for (const tag of data) {
            const formattedTagName = tag.name
                .split(' ')
                .map((name) => capitalize(name.toLowerCase()))
                .join(' ');

            await this.dataServices.tags.updateOne(
                {
                    code: tag.code,
                },
                {
                    name: formattedTagName,
                    code: tag.code,
                },
                {
                    upsert: true,
                },
            );
        }

        const client = await this.redisService.getClient();
        await client.del(RedisKey.TAGS, RedisKey.TAG_NAMES);
    }
}
