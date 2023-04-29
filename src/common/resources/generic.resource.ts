export abstract class IGenericResource<T, K = T> {
    abstract mapToDto(item: T, addition?: K): Promise<object>;

    async mapToDtoList(items: T[], addition?: K): Promise<object[]> {
        return await Promise.all(items.map((item) => this.mapToDto(item, addition)));
    }
}
