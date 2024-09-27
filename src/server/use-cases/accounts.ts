import {
  getAccountByGithubId,
  getAccountByGoogleId,
  getAccountByUserIdAndAccount,
} from "@/server/data-access/accounts";
import { AccountType, User } from "../db/schema";

export async function getAccountByGoogleIdUseCase(googleId: string) {
  return await getAccountByGoogleId(googleId);
}

export async function getAccountByGithubIdUseCase(githubId: string) {
  return await getAccountByGithubId(githubId);
}
export async function getAccountByUserIdAndAccountTypeUseCase(
  userId: User["id"],
  accountType: AccountType,
) {
  return await getAccountByUserIdAndAccount(userId, accountType);
}
