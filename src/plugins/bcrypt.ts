import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

export const hash = async (plainText: string): Promise<string> => {
    return await bcrypt.hash(plainText, +SALT_ROUNDS);
};

export const compare = async (data: string, encrypted: string): Promise<boolean> => {
    return await bcrypt.compare(data, encrypted);
};
