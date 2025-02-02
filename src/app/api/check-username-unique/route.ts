import dbConnet from "@/lib/dbConnet";
import { z } from "zod";
import UserModel from "@/model/user";
import { usernameValidaion } from "@/schemas/signUpSchema";

const UsernameObjectSchema = z.object({
  username: usernameValidaion,
});

export async function GET(request: Request) {
  await dbConnet();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    const result = UsernameObjectSchema.safeParse(queryParam);
    console.log(result)
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(`, `)
              : "Invalid query parameters",
        },
        {
          status: 400,
        }
      );
    }
    const { username } = result.data;
    const ExistinVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (ExistinVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: `Username is already taken`,
        },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: `Username is unique`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error checking username`, error);
    return Response.json(
      {
        success: false,
        message: `Error checking username`,
      },
      {
        status: 500,
      }
    );
  }
}
