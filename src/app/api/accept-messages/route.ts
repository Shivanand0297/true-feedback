import { authOptions } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { getServerSession } from "next-auth";

export const GET = async (_request: Request) => {
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

    // get user data from db
    const userData = await UserModel.findById(user._id);

    if (!userData) {
      return Response.json(
        {
          success: false,
          message: "Could not found user",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "user message acceptance status fetched successfully",
        data: userData.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.log("Failed to fetch message acceptance status", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch message acceptance status",
      },
      {
        status: 500,
      }
    );
  }
};

export const POST = async (request: Request) => {
  await dbConnect();
  try {
    const { acceptMessages } = await request.json();

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

    // get user data from db
    const userData = await UserModel.findByIdAndUpdate(user._id, { isAcceptingMessage: acceptMessages }, { new: true });

    if (!userData) {
      return Response.json(
        {
          success: false,
          message: "Could not update",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "user message acceptance status saved successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log("Failed to fetch message acceptance status", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch message acceptance status",
      },
      {
        status: 500,
      }
    );
  }
};
