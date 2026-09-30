"use client";

import { useRef, useState } from "react";
import { createMealItem } from "@/app/actions";

export default function AddMealItemForm({ mealId }: { mealId: number }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createMealItem(formData);
    formRef.current?.reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        + Add food item
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50"
    >
      <input type="hidden" name="mealId" value={mealId} />
      <input
        name="foodName"
        required
        placeholder="Food name"
        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          name="servingQty"
          type="number"
          step="any"
          placeholder="Qty"
          className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="servingUnit"
          placeholder="Unit (g, oz, cup…)"
          className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { name: "calories", label: "Calories" },
          { name: "proteinG", label: "Protein (g)" },
          { name: "carbsG", label: "Carbs (g)" },
          { name: "fatG", label: "Fat (g)" },
        ].map((f) => (
          <input
            key={f.name}
            name={f.name}
            type="number"
            step="any"
            placeholder={f.label}
            className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-black py-1.5 text-sm font-medium text-white hover:opacity-80 dark:bg-white dark:text-black"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-md border border-zinc-200 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
