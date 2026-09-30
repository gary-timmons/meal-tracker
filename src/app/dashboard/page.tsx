import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { mealItems, meals } from "@/db/schema";
import { deleteMeal } from "@/app/actions";
import AddMealForm from "@/app/components/AddMealForm";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysMeals = await db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.clerkUserId, userId),
        gte(meals.loggedAt, todayStart),
        lte(meals.loggedAt, todayEnd),
      ),
    )
    .orderBy(desc(meals.loggedAt));

  const allItems =
    todaysMeals.length > 0
      ? await db
          .select()
          .from(mealItems)
          .where(inArray(mealItems.mealId, todaysMeals.map((m) => m.id)))
      : [];

  const totalCal = allItems.reduce((a, i) => a + (Number(i.calories) || 0), 0);
  const totalProtein = allItems.reduce((a, i) => a + (Number(i.proteinG) || 0), 0);
  const totalCarbs = allItems.reduce((a, i) => a + (Number(i.carbsG) || 0), 0);
  const totalFat = allItems.reduce((a, i) => a + (Number(i.fatG) || 0), 0);

  const itemsByMeal = new Map<number, typeof allItems>();
  for (const item of allItems) {
    const list = itemsByMeal.get(item.mealId) ?? [];
    list.push(item);
    itemsByMeal.set(item.mealId, list);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{today}</p>
          <h1 className="text-2xl font-bold">Today</h1>
        </div>
        <AddMealForm />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: Math.round(totalCal), unit: "kcal" },
          { label: "Protein", value: Math.round(totalProtein), unit: "g" },
          { label: "Carbs", value: Math.round(totalCarbs), unit: "g" },
          { label: "Fat", value: Math.round(totalFat), unit: "g" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xl font-bold">
              {s.value}
              <span className="text-xs font-normal text-zinc-400 ml-0.5">{s.unit}</span>
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {todaysMeals.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">
            No meals logged today. Hit &ldquo;Log meal&rdquo; to get started.
          </p>
        )}
        {todaysMeals.map((meal) => {
          const items = itemsByMeal.get(meal.id) ?? [];
          const mealCal = items.reduce((a, i) => a + (Number(i.calories) || 0), 0);
          return (
            <div
              key={meal.id}
              className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <Link href={`/meals/${meal.id}`} className="font-semibold hover:underline">
                    {meal.name}
                  </Link>
                  <p className="text-xs text-zinc-400">
                    {new Date(meal.loggedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {mealCal > 0 && ` · ${Math.round(mealCal)} kcal`}
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteMeal(meal.id);
                  }}
                >
                  <button className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                    ✕
                  </button>
                </form>
              </div>
              {items.length > 0 && (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-4 py-2 text-sm">
                      <span>
                        {item.foodName}
                        {item.servingQty && (
                          <span className="text-zinc-400">
                            {" "}· {item.servingQty}{item.servingUnit}
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-400">
                        {item.calories ? `${Math.round(Number(item.calories))} kcal` : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-4 py-2.5">
                <Link
                  href={`/meals/${meal.id}`}
                  className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  + Add items
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
