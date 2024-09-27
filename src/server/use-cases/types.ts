import { User } from "../db/schema";

export type UserProfile = {
  id: UserId;
  name: string | null;
  image: string | null;
};

export type UserId = User["id"];

export type UserSession = {
  id: UserId;
};
