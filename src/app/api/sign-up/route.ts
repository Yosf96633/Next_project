import dbConnet from "@/lib/dbConnet";
import bcryptjs from "bcryptjs";
import UserModel from "@/model/user";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnet();
  try {
    const { username, email, password } = await req.json();
    const existingUserVerifiedUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedUsername) {
      return Response.json(
        {
          success: false,
          message: `Username is already `,
        },
        {
          status: 400,
        }
      );
    }
    const existingUserByEmail = await UserModel.findOne({
      email,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: `User already exist with this email`,
          },
          {
            status: 400,
          }
        );
      }
      else{
        const hashedPassword = await bcryptjs.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now()+3600000)
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcryptjs.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        isVerified: false,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: `User registered successfully.Please verify your email.`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(`Error resgistring user ${error}`);
    return Response.json(
      {
        success: false,
        message: `Error resgistring user `,
      },
      {
        status: 500,
      }
    );
  }
}
