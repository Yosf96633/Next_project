import UserModel from "@/model/user";
import dbConnet from "@/lib/dbConnet";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
export async function DELETE(request: Request , {params}:{params:{messageid:string}}) {
  const {messageid} = params;
  await dbConnet();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: `Not Authenticated`,
      },
      {
        status: 401,
      }
    );
  }
    try {
     const updatedResult =  await UserModel.updateOne(
        {_id:user._id},
        {$pull : {messages : {_id:messageid}}},
      
    )
    if(updatedResult.modifiedCount){
      return Response.json(
        {
          success: false,
          message: `Message not delete or Already delete`,
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: `Message deleted`,
      },
      {
        status: 200,
      }
    );
    } catch (error) {
      return Response.json(
        {
          success: false,
          message: `Error deleteing message`,
        },
        {
          status: 500,
        }
      );
    }
}
