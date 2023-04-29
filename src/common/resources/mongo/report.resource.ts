import * as _ from 'lodash';
import { ReportDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ReportResource extends IGenericResource<ReportDocument> {
    async mapToDto(report: ReportDocument): Promise<object> {
        if (_.isObject(report.author)) {
            report.author = _.pick(report.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        const reportDto = Object.assign({}, report.toObject());
        return reportDto;
    }
}
