import * as _ from 'lodash';
import { ReportDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ReportResource extends IGenericResource<ReportDocument> {
    async mapToDto(report: ReportDocument): Promise<object> {
        const reportDto = _.cloneDeep(report.toObject());

        if (_.isObject(reportDto.author)) {
            reportDto.author = _.pick(reportDto.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        return reportDto;
    }
}
