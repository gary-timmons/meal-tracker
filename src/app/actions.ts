"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { mealItems, meals } from "@/db/schema";

export async function createMeal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const loggedAt = formData.get("loggedAt") as string;

  await db.insert(meals).values({
    clerkUserId: userId,
    name,
    loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
  });

  revalidatePath("/dashboard");
}

export async function deleteMeal(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .delete(meals)
    .where(and(eq(meals.id, id), eq(meals.clerkUserId, userId)));

  revalidatePath("/dashboard");
}

export async function createMealItem(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const mealId = Number(formData.get("mealId"));

  // Verify meal belongs to user
  const [meal] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.clerkUserId, userId)));
  if (!meal) throw new Error("Not found");

  await db.insert(mealItems).values({
    mealId,
    foodName: formData.get("foodName") as string,
    servingQty: (formData.get("servingQty") as string) || null,
    servingUnit: (formData.get("servingUnit") as string) || null,
    calories: (formData.get("calories") as string) || null,
    proteinG: (formData.get("proteinG") as string) || null,
    carbsG: (formData.get("carbsG") as string) || null,
    fatG: (formData.get("fatG") as string) || null,
  });

  revalidatePath(`/meals/${mealId}`);
  revalidatePath("/dashboard");
}

export async function deleteMealItem(id: number, mealId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [meal] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.clerkUserId, userId)));
  if (!meal) throw new Error("Not found");

  await db.delete(mealItems).where(eq(mealItems.id, id));

  revalidatePath(`/meals/${mealId}`);
  revalidatePath("/dashboard");
}
