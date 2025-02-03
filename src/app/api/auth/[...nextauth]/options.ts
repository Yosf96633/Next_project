import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import UserModel from "@/model/user";
import dbConnet from "@/lib/dbConnet";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnet();
        try {
          // Use credentials.email instead of credentials.identifier.email
          console.log(credentials);
          
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.email },
              // If you want to support login with username, ensure your form sends a username field:
              { username: credentials.username },
            ],
          });
          if (!user) {
            throw new Error(`No user found with this email or username`);
          }
          if (!user.isVerified) {
            throw new Error(`Please verify your account first`);
          }
          console.log(user);
          
          const isPasswordCorrect = await bcryptjs.compare(
            credentials.password,
            user.password
          );
          console.log(isPasswordCorrect);
          
          if (!isPasswordCorrect) {
            throw new Error(`Incorrect password`);
          }
          return user;
        } catch (error: any) {
          console.log(error)
          // You can either throw the original error or customize the error message
          throw new Error(error.message || "Authorization failed");
        }
      }
      
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        (token.isVerified = user.isVerified),
          (token.isAcceptingMessages = user.isAcceptingMessages),
          (token.username = user.username);
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
