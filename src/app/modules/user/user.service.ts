import httpStatus from 'http-status-codes';
import { IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs";
import AppError from '../../errorHelpers/appError';
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import { User } from './user.model';
import { userSearchableFields } from './user.constants';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { sendEmail } from '../../utils/sendEmail';
import { generateRandomPassword } from '../../utils/generateRandomPassword';

// Generate a random password


// const createUserService = async (payload: Partial<IUser>, session?: mongoose.ClientSession) => {
//     const { email, password, ...rest } = payload;

//     const isExistUser = await User.findOne({ email })

//     if (isExistUser) {
//         throw new AppError(httpStatus.CONFLICT, "User already exist")
//     }

//     // Check if password is provided
//     let finalPassword: string;
//     let shouldSendEmail = false;
    
//     if (password) {
//         // User provided password manually - use it and don't send email
//         finalPassword = password;
//     } else {
//         // No password provided - generate one and send email
//         finalPassword = generateRandomPassword();
//         shouldSendEmail = true;
//     }

//     const hashPassword = await bcryptjs.hash(finalPassword, 10);
    
//     // Set default role to USER if not provided
//     const userRole = rest.role || Role.USER;
    
//     const user = await User.create({
//         email,
//         password: hashPassword,
//         role: userRole,
//         ...rest
//     })

//     // Send password via email only if password was auto-generated
//     if (shouldSendEmail) {
//         try {
//             await sendEmail({
//                 to: email as string,
//                 subject: 'Welcome to FoodNest - Your Account Credentials',
//                 templateName: 'welcomePassword',
//                 templateData: {
//                     name: user.name,
//                     email: user.email,
//                     password: finalPassword
//                 }
//             });
//         } catch (error) {
//             // Log error but don't fail user creation
//             console.error('Failed to send welcome email:', error);
//         }
//     }

//      // eslint-disable-next-line @typescript-eslint/no-unused-vars
//      const { password:hashedPass, ...userWithoutPassword } = user.toObject();
    
//      await user.save({ session });

//     return userWithoutPassword;

// }

const createUserService = async (payload: Partial<IUser>, session?: mongoose.ClientSession) => {
  const { email, password, ...rest } = payload;

  const query = User.findOne({ email });
  if (session) query.session(session);
  const isExistUser = await query;

  if (isExistUser) {
    throw new AppError(httpStatus.CONFLICT, "User already exist");
  }

  let finalPassword: string;
  let shouldSendEmail = false;

  if (password) {
    finalPassword = password;
  } else {
    finalPassword = generateRandomPassword();
    shouldSendEmail = true;
  }

  const hashPassword = await bcryptjs.hash(finalPassword, 10);
  const userRole = rest.role || Role.USER;

  let user;
  if (session) {
    // session er sathe create
    const users = await User.create([{
      email,
      password: hashPassword,
      role: userRole,
      ...rest
    }], { session });
    user = users[0];
  } else {
    // normal creation
    user = await User.create({
      email,
      password: hashPassword,
      role: userRole,
      ...rest
    });
  }

  if (shouldSendEmail) {
    try {
      await sendEmail({
        to: email as string,
        subject: 'Welcome to FoodNest - Your Account Credentials',
        templateName: 'welcomePassword',
        templateData: {
          name: user.name,
          email: user.email,
          password: finalPassword
        }
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  const { password: hashedPass, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    return {
        data: user
    }
};

const deleteUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
     
    await User.findByIdAndDelete(id);
    
    return {
        data: null
    }
};

const updateUser = async (
    userId: string,
    payload: Partial<IUser>,
    decodedToken: JwtPayload
) => {
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Editor Role Restrictions
    if (decodedToken.role === Role.USER) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this user.");
        }

        if (payload.role)  {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to modify these fields.");
        }
    }

    if (payload.password) {
        const hashedPassword = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
        payload.password = hashedPassword;
    }

    // No restrictions for Admin — directly update
    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });

    return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const updateProfile = async (payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (payload.password) {
        throw new AppError(httpStatus.FORBIDDEN, "You can't change your password here");
    }

    const updatedUser = await User.findByIdAndUpdate(decodedToken.userId, payload, {
        new: true,
        runValidators: true,
    }); 
    return {
        data: updatedUser
    }
}

export const UserServices = {
    createUserService,
    getMe,
    getSingleUser,
    deleteUser,
    updateUser,
    getAllUsers,
    updateProfile
}
