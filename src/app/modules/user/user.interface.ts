import { Types } from "mongoose";

export enum Role {
    OWNER = "OWNER",
    SELLER = "SELLER",
    USER = "USER",
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    picture?: string;
    phone: string;
    role: Role;
    address: string;
}
