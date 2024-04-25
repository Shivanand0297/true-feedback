import { dbConnect } from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/user.model";

export const POST = async (request: Request) => {
  await dbConnect();
  try {
    const { username, content } = await request.json();
    const user = await UserModel.findOne({ username });
    if(!user) {
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

    if(!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User not accepting messages",
        },
        {
          status: 400,
        }
      );
    }

    const message = {
      content: String(content),
      createdAt: new Date()
    }

    user.messages.push(message as Message)
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Messge sent successfully",
      },
      {
        status: 201,
      }
    );


  } catch (error) {
    console.log("Error sending messages ", error);
    return Response.json(
      {
        success: false,
        message: "Error sending messages",
      },
      {
        status: 500,
      }
    );
  }
};
