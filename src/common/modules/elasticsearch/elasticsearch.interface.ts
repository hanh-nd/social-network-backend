export interface ElasticsearchSearchResult<T> {
    hits: {
        total: number;
        hits: Array<{
            _source: T;
        }>;
    };
}
