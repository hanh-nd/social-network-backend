import * as _ from 'lodash';
import { toObjectId } from 'src/common/helper';
import { AskUserQuestionDocument, ChatDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class AskUserQuestionResource extends IGenericResource<AskUserQuestionDocument, UserDocument> {
    async mapToDto(question: AskUserQuestionDocument, user?: UserDocument): Promise<object> {
        const questionDto = _.cloneDeep(question.toObject());
        if (questionDto?.sender && _.isObject(questionDto.sender)) {
            questionDto.sender = _.pick(questionDto.sender, '_id', 'username', 'avatarId', 'fullName');
        }

        if (questionDto?.receiver && _.isObject(questionDto.receiver)) {
            questionDto.receiver = _.pick(questionDto.receiver, '_id', 'username', 'avatarId', 'fullName');
        }

        if (questionDto.isAnonymous) {
            questionDto.sender = {
                fullName: 'Người dùng ẩn danh',
            };
        }

        return questionDto;
    }
}
