"use server";

import { revalidatePath } from "next/cache";
import {
  buildVoiceProfile,
  humanizeDraft,
  type HumanizeRecord,
  type VoiceProfile,
} from "@/lib/voice";

export type BuildProfileState = {
  profile?: VoiceProfile;
  error?: string;
};

export async function buildProfileAction(
  _prevState: BuildProfileState,
  formData: FormData
): Promise<BuildProfileState> {
  const samples = formData
    .getAll("sample")
    .map((s) => s.toString())
    .filter((s) => s.trim().length > 0);

  try {
    const profile = await buildVoiceProfile(samples);
    revalidatePath("/tools/voice");
    return { profile };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export type HumanizeState = {
  result?: HumanizeRecord;
  error?: string;
};

export async function humanizeAction(
  _prevState: HumanizeState,
  formData: FormData
): Promise<HumanizeState> {
  const draft = formData.get("draft_text")?.toString() ?? "";

  try {
    const result = await humanizeDraft(draft);
    revalidatePath("/tools/voice");
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
