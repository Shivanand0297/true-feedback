import { Message } from "@/models/user.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAccesptingMessages?: boolean;
  messages?: Message[];
}
