import { UserRole } from "../schema.ts";

export interface User {
    id: number;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: UserRole;
}
