"use client";

export default function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <button
      onClick={action}
      className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
    >
      ✕
    </button>
  );
}
