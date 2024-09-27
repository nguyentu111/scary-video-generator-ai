import {
  createUser,
  deleteUser,
  getUserByEmail,
  updateUser,
  verifyPassword,
} from "@/server/data-access/users";
import { UserId, UserSession } from "@/server/use-cases/types";
import {
  createAccount,
  createAccountViaGithub,
  createAccountViaGoogle,
  getAccountByGithubId,
  getAccountByGoogleId,
  getAccountByUserId,
  updateAccount,
  updatePassword,
} from "@/server/data-access/accounts";
import {
  createProfile,
  getProfileByUserId,
  updateProfile,
} from "@/server/data-access/profiles";
import { GoogleUser } from "@/app/api/login/google/route";
import { GitHubUser } from "@/app/api/login/github/route";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  getPasswordResetToken,
} from "@/server/data-access/reset-tokens";
import { ResetPasswordEmail } from "@/emails/reset-password";
import {
  createVerifyEmailToken,
  deleteVerifyEmailToken,
  getVerifyEmailToken,
} from "@/server/data-access/verify-email";
import { VerifyEmail } from "@/emails/verify-email";
import { applicationName } from "@/app-config";
import { sendEmail } from "@/lib/email";
import { generateRandomName } from "@/lib/names";
import {
  AuthenticationError,
  EmailInUseError,
  LoginError,
  NotFoundError,
  VerifyEmailError,
} from "./errors";
import { db } from "@/server/db";
import { createTransaction } from "@/server/data-access/utils";
import { getAccountByUserIdAndAccountTypeUseCase } from "./accounts";
import { Account, User } from "../db/schema";

export async function deleteUserUseCase(
  authenticatedUser: UserSession,
  userToDeleteId: UserId,
): Promise<void> {
  if (authenticatedUser.id !== userToDeleteId) {
    throw new AuthenticationError();
  }

  await deleteUser(userToDeleteId);
}

export async function getUserProfileUseCase(userId: UserId) {
  const profile = await getProfileByUserId(userId);

  if (!profile) {
    throw new NotFoundError();
  }

  return profile;
}

export async function registerUserUseCase(
  email: string,
  password: string,
): Promise<User> {
  return (await createTransaction(async () => {
    const existingUser = await getUserByEmail(email);
    let existingAccount: Account | undefined;
    if (existingUser) {
      existingAccount = await getAccountByUserIdAndAccountTypeUseCase(
        existingUser.id,
        "email",
      );
    }
    if (existingUser && existingAccount) {
      throw new EmailInUseError();
    }
    const user = existingUser ?? (await createUser(email));
    if (!existingAccount) {
      await createAccount(user.id, password);
    }
    const existingProfile = await getProfileByUserId(user.id);
    if (!existingProfile) {
      await createProfile(user.id, generateRandomName());
    }
    const token = await createVerifyEmailToken(user.id);
    await sendEmail(
      email,
      `Verify your email for ${applicationName}`,
      <VerifyEmail token={token} />,
    );

    return { id: user.id };
  })) as Promise<User>;
}

export async function signInUseCase(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new LoginError();
  }

  const isPasswordCorrect = await verifyPassword(email, password);

  if (!isPasswordCorrect) {
    throw new LoginError();
  }
  if (!user.emailVerified) {
    throw new VerifyEmailError();
  }

  return { id: user.id };
}

export async function createGithubUserUseCase(githubUser: GitHubUser) {
  let existingUser: { id: UserId } | undefined = await getUserByEmail(
    githubUser.email,
  );

  if (!existingUser) {
    existingUser = await createUser(githubUser.email);
  }
  const existingAccount = await getAccountByGithubId(githubUser.id);
  if (existingAccount) {
    await updateAccount(existingAccount.id, { githubId: githubUser.id });
  } else {
    await createAccountViaGithub(existingUser.id, githubUser.id);
  }
  const existingProfile = await getProfileByUserId(existingUser.id);
  if (!existingProfile) {
    await createProfile(
      existingUser.id,
      githubUser.login,
      githubUser.avatar_url,
    );
  } else {
    if (!existingProfile.image)
      await updateProfile(existingProfile.id, { image: githubUser.avatar_url });
  }

  return existingUser!.id;
}

export async function createGoogleUserUseCase(googleUser: GoogleUser) {
  let existingUser: { id: UserId } | undefined = await getUserByEmail(
    googleUser.email,
  );

  if (!existingUser) {
    existingUser = await createUser(googleUser.email);
  }

  // await createAccountViaGoogle(existingUser!.id, googleUser.sub);

  // await createProfile(existingUser!.id, googleUser.name, googleUser.picture);
  const existingAccount = await getAccountByGoogleId(googleUser.sub);
  if (existingAccount) {
    await updateAccount(existingAccount.id, { githubId: googleUser.sub });
  } else {
    await createAccountViaGoogle(existingUser.id, googleUser.sub);
  }
  const existingProfile = await getProfileByUserId(existingUser.id);
  if (!existingProfile) {
    await createProfile(existingUser!.id, googleUser.name, googleUser.picture);
  } else {
    if (!existingProfile.image)
      await updateProfile(existingProfile.id, { image: googleUser.picture });
  }

  return existingUser!.id;
}

export async function resetPasswordUseCase(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AuthenticationError();
  }

  const token = await createPasswordResetToken(user.id);

  await sendEmail(
    email,
    `Your password reset link for ${applicationName}`,
    <ResetPasswordEmail token={token} />,
  );
}

export async function changePasswordUseCase(token: string, password: string) {
  const tokenEntry = await getPasswordResetToken(token);

  if (!tokenEntry) {
    throw new AuthenticationError();
  }

  const userId = tokenEntry.userId;

  await createTransaction(async (trx) => {
    await deletePasswordResetToken(token, trx);
    await updatePassword(userId, password, trx);
  });
}

export async function verifyEmailUseCase(token: string) {
  const tokenEntry = await getVerifyEmailToken(token);

  if (!tokenEntry) {
    throw new AuthenticationError();
  }

  const userId = tokenEntry.userId;

  await updateUser(userId, {
    emailVerifiedAt: new Date(),
    emailVerified: true,
  });
  await deleteVerifyEmailToken(token);

  return userId;
}
