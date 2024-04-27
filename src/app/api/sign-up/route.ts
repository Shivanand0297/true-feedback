import { dbConnect } from "@/lib/dbConnect";
import sendVerificationEmail from "@/lib/resend";
import UserModel from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    // get user data from frontend
    const { username, password, email } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email and password are required!",
        },
        {
          status: 400,
        }
      );
    }

    // find user who has username and is verified
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "User Already Exists! Please login to continue!",
        },
        {
          status: 400,
        }
      );
    }

    // find user by email
    const existingUserByEmail = await UserModel.findOne({
      $or: [
        {
          username,
        },
        {
          email,
        },
      ],
    });

    const verifyCode = Math.floor(1_00_000 + Math.random() * 9_00_000).toString();

    if (existingUserByEmail) {
      // check if verified
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "user Already Exists",
          },
          {
            status: 500,
          }
        );
      } else {
        const passwordHash = await bcrypt.hash(password, 10);
        existingUserByEmail.password = passwordHash;
        existingUserByEmail.verifyCode = verifyCode;

        const verifyCodeExpiry = new Date();
        verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

        existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;

        // save the user
        await existingUserByEmail.save();
      }
    } else {
      // start registering the User
      const passwordHash = await bcrypt.hash(password, 10);
      const verifyCodeExpiry = new Date();
      verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: passwordHash,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    const verificationEmail = await sendVerificationEmail(email, username, verifyCode);

    if (!verificationEmail.success) {
      return NextResponse.json(
        {
          success: false,
          message: verificationEmail.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered Successfully, please veryfiy your email",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error Registering user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
