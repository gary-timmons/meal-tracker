import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Meal Tracker</h1>
      <p className="max-w-sm text-zinc-500 dark:text-zinc-400">
        Log your meals, track nutrition, and build healthier habits.
      </p>
      <a
        href="/sign-in"
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
      >
        Get started
      </a>
    </div>
  );
}
