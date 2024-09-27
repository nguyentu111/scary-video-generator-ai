import { db } from "@/server/db";
import { Profile, profiles } from "@/server/db/schema";
import { UserId } from "@/server/use-cases/types";
import { eq } from "drizzle-orm";

export async function createProfile(
  userId: UserId,
  displayName: string,
  image?: string,
) {
  const [profile] = await db.insert(profiles).values({
    userId,
    image,
    displayName,
  });
  return await db.query.profiles.findFirst({
    where: eq(profiles.id, profile.insertId),
  });
}

export async function updateProfileByUserId(
  userId: UserId,
  updateProfile: Partial<Profile>,
) {
  await db
    .update(profiles)
    .set(updateProfile)
    .where(eq(profiles.userId, userId));
}
export async function updateProfile(
  profileId: Profile["id"],
  updateProfile: Partial<Profile>,
) {
  await db
    .update(profiles)
    .set(updateProfile)
    .where(eq(profiles.id, profileId));
}

export async function getProfileByUserId(userId: UserId) {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  return profile;
}
