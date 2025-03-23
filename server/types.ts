import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      firstName?: string;
      lastName?: string;
      email: string;
      isAdmin: boolean;
    }
  }
}
