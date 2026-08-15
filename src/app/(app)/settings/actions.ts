"use server";

import { revalidatePath } from "next/cache";
import { deleteKey, KEY_REGISTRY, setKey } from "@/lib/keys";

export async function saveKeyAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const value = formData.get("value")?.toString() ?? "";
  const known = KEY_REGISTRY.find((k) => k.name === name);
  if (!known) throw new Error(`Unknown key: ${name}`);
  if (value.trim()) {
    setKey(known.name, value.trim());
  } else {
    deleteKey(known.name);
  }
  revalidatePath("/settings");
}
