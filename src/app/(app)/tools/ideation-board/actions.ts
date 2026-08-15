"use server";

import { revalidatePath } from "next/cache";
import { createCard, deleteCard, moveCard } from "@/lib/ideation-board";

export async function createCardAction(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  if (!title) return;
  const notes = formData.get("notes")?.toString().trim() ?? "";

  createCard(title, notes);
  revalidatePath("/tools/ideation-board");
  revalidatePath("/dashboard");
}

export async function moveCardAction(id: number, direction: "next" | "prev") {
  moveCard(id, direction);
  revalidatePath("/tools/ideation-board");
}

export async function deleteCardAction(id: number) {
  deleteCard(id);
  revalidatePath("/tools/ideation-board");
  revalidatePath("/dashboard");
}
