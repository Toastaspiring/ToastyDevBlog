import { type GeneratedAlways, type Selectable, type Insertable, type Updateable } from 'kysely'

export type UserRole = "admin" | "user";

export interface DB {
    blogPosts: BlogPosts;
    comments: Comments;
    eventItems: EventItems;
    events: Events;
    likes: Likes;
    users: Users;
    notifications: Notifications;
    eventRegistrations: EventRegistrations;
}

export interface BlogPosts {
    authorId: number;
    content: string;
    createdAt: GeneratedAlways<Date>;
    id: GeneratedAlways<number>;
    published: boolean;
    slug: string;
    title: string;
    updatedAt: GeneratedAlways<Date>;
}

export interface Comments {
    content: string;
    createdAt: GeneratedAlways<Date>;
    id: GeneratedAlways<number>;
    postId: number;
    updatedAt: GeneratedAlways<Date>;
    userId: number;
}

export interface EventItems {
    createdAt: GeneratedAlways<Date>;
    description: string;
    endTime: Date;
    eventId: number;
    id: GeneratedAlways<number>;
    speaker: string | null;
    startTime: Date;
    title: string;
    type: string;
    updatedAt: GeneratedAlways<Date>;
}

export interface Events {
    createdAt: GeneratedAlways<Date>;
    date: Date;
    description: string;
    id: GeneratedAlways<number>;
    location: string;
    registrationEnabled: boolean;
    title: string;
    updatedAt: GeneratedAlways<Date>;
}

export interface Likes {
    createdAt: GeneratedAlways<Date>;
    id: GeneratedAlways<number>;
    postId: number;
    userId: number;
}

export interface Users {
    avatarUrl: string | null;
    createdAt: GeneratedAlways<Date>;
    displayName: string;
    email: string;
    id: GeneratedAlways<number>;
    passwordHash: string | null;
    providerUserId: string;
    role: string;
    updatedAt: GeneratedAlways<Date>;
}

export interface Notifications {
    id: GeneratedAlways<number>;
    userId: number;
    type: string; // 'like', 'comment', etc.
    actorId: number; // The user who performed the action
    resourceId: number; // The post or comment ID
    createdAt: GeneratedAlways<Date>;
    read: boolean;
}

export interface EventRegistrations {
    id: GeneratedAlways<number>;
    userId: number;
    eventId: number;
    createdAt: GeneratedAlways<Date>;
}
