import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PostDocument, UserDocument } from 'src/mongo-schemas';
import { IDataResources } from '../data.resource';
import { IGenericResource } from '../generic.resource';
import { PostResource } from './post.resource';
import { UserResource } from './user.resource';

@Injectable()
export class MongoDataResources implements IDataResources, OnApplicationBootstrap {
    users: IGenericResource<UserDocument>;
    posts: IGenericResource<PostDocument>;

    onApplicationBootstrap() {
        this.users = new UserResource();
        this.posts = new PostResource();
    }
}
