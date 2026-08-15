"use server";

import { revalidatePath } from "next/cache";
import { saveBrandProfile } from "@/lib/brand-profile";

export async function saveBrandProfileAction(formData: FormData) {
  saveBrandProfile({
    product_name: formData.get("product_name")?.toString() || null,
    icp: formData.get("icp")?.toString() || null,
    voice: formData.get("voice")?.toString() || null,
    positioning: formData.get("positioning")?.toString() || null,
    primary_color: formData.get("primary_color")?.toString() || null,
  });
  revalidatePath("/brand-profile");
}
