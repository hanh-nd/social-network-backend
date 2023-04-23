export abstract class IGenericResource<T> {
    abstract mapToDto(item: T): Promise<object>;
    abstract mapToDtoList(items: T[]): Promise<object[]>;
}
