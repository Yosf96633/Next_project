import {z} from "zod"


export const AcceptMessageValidation = z.object({
    acceptMessages : z.boolean(),
})