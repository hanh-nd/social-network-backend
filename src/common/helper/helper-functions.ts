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

export function toObjectId(id: string | ObjectId) {
    if (!id) return null;
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
}

export function toObjectIds(ids: (string | ObjectId)[]) {
    return ids.map((id) => new ObjectId(id));
}

export function toStringArray(ids: ObjectId[] = []) {
    return ids.map((id) => `${id}`);
}

export function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function extractJSONFromText(text: string) {
    const formattedText = text.replace(/ /g, '').replace(/\n/g, '').replace('\n', '');
    let json = null;
    const regex = /\[.*?\]/; // Regex pattern to match JSON arrays
    const match = formattedText.match(regex);
    if (match) {
        try {
            json = JSON.parse(match[0]);
        } catch (error) {
            console.log(error);
            const regex = /{(?:[^{}]|(?:{[^{}]*}))*}/; // Regex pattern to match JSON objects
            const match = formattedText.match(regex);
            if (match) {
                try {
                    json = JSON.parse(match[0]);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    return json;
}
