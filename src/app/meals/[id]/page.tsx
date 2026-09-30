import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { mealItems, meals } from "@/db/schema";
import { deleteMealItem } from "@/app/actions";
import AddMealItemForm from "@/app/components/AddMealItemForm";

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const mealId = Number(id);

  const [meal] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.clerkUserId, userId)));

  if (!meal) notFound();

  const items = await db
    .select()
    .from(mealItems)
    .where(eq(mealItems.mealId, mealId));

  const totalCal = items.reduce((a, i) => a + (Number(i.calories) || 0), 0);
  const totalProtein = items.reduce((a, i) => a + (Number(i.proteinG) || 0), 0);
  const totalCarbs = items.reduce((a, i) => a + (Number(i.carbsG) || 0), 0);
  const totalFat = items.reduce((a, i) => a + (Number(i.fatG) || 0), 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm">
          ← Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{meal.name}</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {new Date(meal.loggedAt).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      {items.length > 0 && (
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
      )}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {items.length === 0 && (
          <p className="px-4 py-6 text-sm text-zinc-400 text-center">
            No items yet. Add a food item below.
          </p>
        )}
        {items.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 uppercase">
                <th className="px-4 py-2 text-left font-medium">Food</th>
                <th className="px-4 py-2 text-right font-medium">Serving</th>
                <th className="px-4 py-2 text-right font-medium">Cal</th>
                <th className="px-4 py-2 text-right font-medium">P</th>
                <th className="px-4 py-2 text-right font-medium">C</th>
                <th className="px-4 py-2 text-right font-medium">F</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-medium">{item.foodName}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">
                    {item.servingQty
                      ? `${item.servingQty}${item.servingUnit ?? ""}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">{item.calories ? Math.round(Number(item.calories)) : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{item.proteinG ? Math.round(Number(item.proteinG)) : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{item.carbsG ? Math.round(Number(item.carbsG)) : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-400">{item.fatG ? Math.round(Number(item.fatG)) : "—"}</td>
                  <td className="px-4 py-2.5">
                    <form
                      action={async () => {
                        "use server";
                        await deleteMealItem(item.id, mealId);
                      }}
                    >
                      <button className="text-zinc-300 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <AddMealItemForm mealId={mealId} />
        </div>
      </div>
    </main>
  );
}
