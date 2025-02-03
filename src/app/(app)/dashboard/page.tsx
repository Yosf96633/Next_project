"use client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/user";
import { AcceptMessageSchema } from "@/schemas/acceptMessage";
import { ApiResponse } from "@/types/apiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
const DashBoard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch(`acceptMessages`);
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
     const response = await axios.get<ApiResponse>(`/api/accept-messages`);
     setValue('acceptMessages' , response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title:`Error`,
        description:axiosError.response?.data.message || `Failed to fetch message settings`,
        variant:`destructive`,
      })
    }finally{
      setIsSwitchLoading(false);
    }
  }, [setValue]);
  const fetchAcceptMessages = useCallback(async (refresh:boolean)=>{
       setIsLoading(true);
       setIsSwitchLoading(false);
       try {
        const response = await axios.get<ApiResponse>(`/api/get-messages`)
        setMessages(response.data.messages || [])
        if(refresh){
          toast({
            title:`Refreshed Messages`,
            description:`Showing latest messages`,
          })
        }
       } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title:`Error`,
          description:axiosError.response?.data.message || `Failed to fetch message settings`,
          variant:`destructive`,
        })
       }
       finally{
        setIsLoading(false)
        setIsSwitchLoading(false);
       }
  }, [setIsLoading , setIsSwitchLoading])
  useEffect(()=>{
       if(!session || !session.user){
        return;
       }
       fetchAcceptMessage()
  } , [session , setValue]);
  return <div>DashBoard</div>;
};
export default DashBoard;
