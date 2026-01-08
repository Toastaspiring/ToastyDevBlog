import * as bcrypt from "bcryptjs";

export async function generatePasswordHash(password: string) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return passwordHash;
}
