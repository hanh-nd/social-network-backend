import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { ISearchQuery } from './search.interface';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
    constructor(private configService: ConfigService, private searchService: SearchService) {}

    private readonly logger = createWinstonLogger(SearchController.name, 'search', this.configService);

    @Get('/')
    async search(@Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.search(searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[SearchController][search] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/posts')
    async searchPosts(@Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.searchPost(searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[SearchController][searchPosts] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/users')
    async searchUsers(@Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.searchUser(searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[SearchController][searchUsers] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
