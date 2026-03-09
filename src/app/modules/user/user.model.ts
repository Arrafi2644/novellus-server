import { Schema, model, Types } from "mongoose";
import { IUser, Role } from "./user.interface";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
    },
    picture: {
        type: String,
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
});

export const User = model("User", userSchema);
