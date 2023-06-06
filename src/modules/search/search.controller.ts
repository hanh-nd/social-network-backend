import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { ISearchQuery } from './search.interface';
import { SearchService } from './search.service';

@Controller('/search')
export class SearchController {
    constructor(private configService: ConfigService, private searchService: SearchService) {}

    private readonly logger = createWinstonLogger(SearchController.name, this.configService);

    @Get('/')
    @UseGuards(AccessTokenGuard)
    async search(@LoginUser() loginUser, @Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.search(loginUser.userId, searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[search] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/posts')
    @UseGuards(AccessTokenGuard)
    async searchPosts(@LoginUser() loginUser, @Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.searchPost(loginUser.userId, searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[searchPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/users')
    @UseGuards(AccessTokenGuard)
    async searchUsers(@LoginUser() loginUser, @Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.searchUser(loginUser.userId, searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[searchUsers] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/groups')
    @UseGuards(AccessTokenGuard)
    async searchGroups(@LoginUser() loginUser, @Query() searchQuery: ISearchQuery) {
        try {
            const result = await this.searchService.searchGroup(loginUser.userId, searchQuery);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[searchGroups] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
