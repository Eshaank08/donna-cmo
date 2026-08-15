"use server";

import { revalidatePath } from "next/cache";
import {
  checkIdea,
  GATES,
  saveIdeaGateConfig,
  type GateAnswer,
  type IdeaCheck,
} from "@/lib/idea-gate";
import { createCard } from "@/lib/ideation-board";

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveIdeaGateConfigAction(formData: FormData) {
  saveIdeaGateConfig({
    hard_boundaries: linesToArray(
      formData.get("hard_boundaries")?.toString() ?? ""
    ),
    fingerprint_description:
      formData.get("fingerprint_description")?.toString() ?? "",
  });
  revalidatePath("/tools/idea-gate");
}

export type CheckState = {
  result?: IdeaCheck;
  error?: string;
};

export async function checkIdeaAction(
  _prevState: CheckState,
  formData: FormData
): Promise<CheckState> {
  const ideaText = formData.get("idea_text")?.toString().trim();
  if (!ideaText) return { error: "Describe the idea first." };

  const hardBoundaryHit = formData.get("hard_boundary_hit") === "on";
  const gateAnswers: GateAnswer[] = GATES.map((g) => ({
    key: g.key,
    pass: formData.get(`gate_${g.key}_pass`) === "on",
    proof: formData.get(`gate_${g.key}_proof`)?.toString().trim() ?? "",
  }));

  const result = checkIdea(ideaText, hardBoundaryHit, gateAnswers);
  revalidatePath("/tools/idea-gate");
  revalidatePath("/output");
  revalidatePath("/dashboard");
  return { result };
}

export async function sendIdeaToBoardAction(ideaText: string) {
  const title = ideaText.length > 80 ? `${ideaText.slice(0, 77)}...` : ideaText;
  createCard(title, ideaText);
  revalidatePath("/tools/ideation-board");
  revalidatePath("/dashboard");
}
