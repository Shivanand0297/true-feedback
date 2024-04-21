import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

export const GET = async (request: Request) => {
  await dbConnect();
  try {
    console.log(request.url)
    const { searchParams } = new URL(request.url);
    const params = {
      username: searchParams.get("username"),
    };

    console.log("searchParams", searchParams.get("username"))

    const usernameSchema = z.object({
      username: usernameValidation,
    });

    const result = usernameSchema.safeParse(params);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: result.error.format().username || [],
        },
        {
          status: 405,
        }
      );
    }

    // check with database that if username is available
    const existingUserByUsername = await UserModel.findOne({
      username: params.username ?? "",
      isVerified: true,
    });

    if (existingUserByUsername) {
      return Response.json({
        success: false,
        message: "User with that username already exists",
      });
    }

    return Response.json({
      success: true,
      message: "Username is available",
    });

  } catch (error) {
    console.log("Failed to check usernmae", error);
    return Response.json({
      success: false,
      message: "Failed to check username",
    });
  }
};
