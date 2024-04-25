import { authOptions } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

export const GET = async () => {
  await dbConnect();
  try {
    // get user from token
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Please login to continue",
        },
        {
          status: 400,
        }
      );
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const userData = await UserModel.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!userData || userData.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        messages: userData[0].messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Failed to get user messages", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get user messages",
      },
      {
        status: 500,
      }
    );
  }
};
