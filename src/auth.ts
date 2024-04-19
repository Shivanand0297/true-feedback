import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import Credential from "next-auth/providers/credentials";
import { dbConnect } from "./lib/dbConnect";
import UserModel from "./models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    Credential({
      id: "credentials",
      name: "Credentials",
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<any> => {
        try {
          await dbConnect();

          // credentials.identifier.username
          const user = await UserModel.findOne({
            $or: [{ username: credentials.username }, { email: credentials.email }],
          });

          if (!user) {
            throw new Error("User not found with this email or username");
          }

          // if user exists
          if (!user.isVerified) {
            throw new Error("Please verify your account first before login");
          }

          const isPasswordMatched = await bcrypt.compare(credentials.password, user.password);

          if (isPasswordMatched) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error: any) {
          throw new Error(error?.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
      }
      return session;
    },
  },
};
