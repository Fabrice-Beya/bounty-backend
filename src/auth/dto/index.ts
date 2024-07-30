import { UserModel } from "src/common";

export class LoginDto {
    email: string;
    password: string;
  }

  export class RegisterDto {
    email: string;
    password: string;
    username: string;
  }

  export interface AuthResponse {
    token: string;
    user: UserModel;
  }