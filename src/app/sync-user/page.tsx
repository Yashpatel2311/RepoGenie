// control come here for we get the user data from Clerk and store it in the database.

import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import React from "react";

const SyncUser = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!user.emailAddresses[0]?.emailAddress) {
    return notFound();
  }

  const email = user.emailAddresses[0].emailAddress;

  // First check if a user with this email exists
  const existingUser = await db.user.findUnique({
    where: { emailAddress: email },
  });

  if (existingUser && existingUser.id !== userId) {
    // If user exists with different ID, delete the old record
    await db.user.delete({
      where: { id: existingUser.id },
    });
  }

  // Now create/update the user with the correct ID
  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      emailAddress: email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
    update: {
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    },
  });

  return redirect("/dashboard");
};

export default SyncUser;
