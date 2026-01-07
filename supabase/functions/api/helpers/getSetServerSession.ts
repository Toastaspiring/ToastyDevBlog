import { jwtVerify, SignJWT } from "jose";

const encoder = new TextEncoder();
const secret = Deno.env.get("JWT_SECRET");

if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
}

export const SessionExpirationSeconds = 60 * 60 * 24 * 7; // 1 week
// Probability to run cleanup (10%)
export const CleanupProbability = 0.1;

export interface Session {
    id: string;
    createdAt: number;
    lastAccessed: number;
    passwordChangeRequired?: boolean;
}

const CookieName = "floot_built_app_session";

export class NotAuthenticatedError extends Error {
    constructor(message?: string) {
        super(message ?? "Not authenticated");
        this.name = "NotAuthenticatedError";
    }
}

export async function getServerSessionOrThrow(
    request: Request
): Promise<Session> {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = cookieHeader
        .split(";")
        .reduce((cookies: Record<string, string>, cookie) => {
            const [name, value] = cookie.trim().split("=");
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
            return cookies;
        }, {});
    const sessionCookie = cookies[CookieName];

    if (!sessionCookie) {
        throw new NotAuthenticatedError();
    }
    try {
        const { payload } = await jwtVerify(sessionCookie, encoder.encode(secret));
        return {
            id: payload.id as string,
            createdAt: payload.createdAt as number,
            lastAccessed: payload.lastAccessed as number,
            passwordChangeRequired: payload.passwordChangeRequired as boolean,
        };
    } catch (error) {
        throw new NotAuthenticatedError();
    }
}

export async function setServerSession(
    response: Response,
    session: Session
): Promise<void> {
    const token = await new SignJWT({
        id: session.id,
        createdAt: session.createdAt,
        lastAccessed: session.lastAccessed,
        passwordChangeRequired: session.passwordChangeRequired,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(encoder.encode(secret));

    const cookieValue = [
        `${CookieName}=${token}`,
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Path=/",
        `Max-Age=${SessionExpirationSeconds}`,
    ].join("; ");

    response.headers.set("Set-Cookie", cookieValue);
}

export function clearServerSession(response: Response) {
    const cookieValue = [
        `${CookieName}=`,
        "HttpOnly",
        "Secure",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=0",
    ].join("; ");

    response.headers.set("Set-Cookie", cookieValue);
}
