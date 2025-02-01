import dbConnet from "@/lib/dbConnet";
import UserModel from "@/model/user";
import { Message } from "@/model/user";

export async function POST(request: Request) {
  await dbConnet();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: `User not found`,
        },
        {
          status: 400,
        }
      );
    }
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: `User not accepting messages`,
        },
        {
          status: 403,
        }
      )
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message)
    await user.save();
    return Response.json(
        {
          success: true,
          message: `Message send successfully`,
        },
        {
          status: 200,
        }
      )
  } catch (error) {
    return Response.json(
        {
          success: false,
          message: `Internal server error`,
        },
        {
          status: 500,
        }
      )
  }
}
