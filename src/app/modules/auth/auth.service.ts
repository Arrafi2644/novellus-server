import httpStatus from 'http-status-codes';
import { IUser } from "../user/user.interface";
import { User } from '../user/user.model';
import AppError from '../../errorHelpers/appError';
import bcryptjs from 'bcryptjs';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userTokens';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import crypto from "crypto";
import { sendEmail } from '../../utils/sendEmail';

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExist = await User.findOne({ email })

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist! Please register.")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password!")
    }

    const userTokens = createUserTokens(isUserExist)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExist.toObject();

    return {
        email: isUserExist.email,
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    }
}

const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
    return {
        accessToken: newAccessToken
    }
}

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
    }

    user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user.save();
}

const forgotPassword = async (email: string) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.save();

    // const resetLink = `${envVars.FRONTEND_URL}/reset-password/${resetToken}`;
    const resetLink = `${envVars.FRONTEND_URL}/reset-password/${resetToken}`;

    // TODO: send email
    console.log("Reset Link:", resetLink);
    try {
          await sendEmail({
            to: email as string,
            subject: 'Password Reset Request',
            templateName: 'ForgetPassword',
            templateData: {
              resetLink
            }
          });
        } catch (error) {
          console.error('Failed to send password reset email:', error);
        }

    return null;
};

const resetPassword = async (token: string, newPassword: string) => {

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired token");
    }

    user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return null;
};



export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    forgotPassword,
    resetPassword
}