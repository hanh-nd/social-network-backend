import { PipeTransform, Injectable } from '@nestjs/common';
import { isEmpty, isArray, mapKeys, trim } from 'lodash';

type QueryType =
    | string
    | number
    | number[]
    | string[]
    | Record<string, string | number>
    | Record<string, string | number>[];

@Injectable()
export class RemoveEmptyQueryPipe implements PipeTransform {
    constructor() {
        //
    }
    transform(query: QueryType) {
        this.removeEmptyValue(query);
        return query;
    }

    removeEmptyValue(query: QueryType): void {
        if (isEmpty(query)) return;
        const removeEmpty = (item: any) => {
            mapKeys(item, (value, key) => {
                // remove null, undefined, empty
                if (value !== 0 && !value) {
                    delete item[key];
                }
                // remove string contain only space characters
                else if (typeof value === 'string' && !trim(value as string)) {
                    delete item[key];
                }

                // iterate array
                else if (isArray(value)) {
                    value = value.filter((property) => {
                        // remove null, undefined, empty
                        if (property !== 0 && !property) {
                            return false;
                        }

                        // remove string contain only space characters
                        else if (typeof property === 'string' && !trim(property as string)) {
                            return false;
                        }
                        return true;
                    });
                }
            });
        };
        removeEmpty(query);
    }
}
