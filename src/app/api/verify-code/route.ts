import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

export const POST = async (request: Request) => {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    const existingUserByUsername = await UserModel.findOne({ username });

    if (!existingUserByUsername) {
      return Response.json({
        success: true,
        message: "User not found",
      });
    }

    const isCodeValid = code === existingUserByUsername.verifyCode;
    const isCodeNotExpired = new Date(existingUserByUsername.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "Invalid code",
        },
        {
          status: 400,
        }
      );
    }

    if (isCodeValid && !isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Code expired, please signup again to get another one",
        },
        {
          status: 400,
        }
      );
    }

    if (isCodeValid && isCodeNotExpired) {
      existingUserByUsername.isVerified = true;
      await existingUserByUsername.save();

      return Response.json({
        success: true,
        message: "User verified successfully",
      });
    }
  } catch (error) {
    console.log("Failed to verify user", error);
    return Response.json({
      success: false,
      message: "Failed to verify user",
    });
  }
};
