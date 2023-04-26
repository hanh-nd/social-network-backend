import { ObjectId } from 'mongodb';

export function generateRandomString(length: number = 16) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function toObjectId(id: string) {
    return new ObjectId(id);
}

export function toObjectIds(ids: string[]) {
    return ids.map((id) => new ObjectId(id));
}
