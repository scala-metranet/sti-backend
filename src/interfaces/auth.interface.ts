import { Request } from "express";
import { User } from "@interfaces/users.interface";

export interface DataStoredInToken {
  id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface LoginLogs {
  user_id: string;
  ip: string;
  status: string;
}
