import { db } from "@/lib/db";

export type BrandProfile = {
  product_name: string | null;
  icp: string | null;
  voice: string | null;
  positioning: string | null;
  primary_color: string | null;
};

const EMPTY: BrandProfile = {
  product_name: null,
  icp: null,
  voice: null,
  positioning: null,
  primary_color: null,
};

export function getBrandProfile(): BrandProfile {
  const row = db
    .prepare(
      "SELECT product_name, icp, voice, positioning, primary_color FROM brand_profile WHERE id = 1"
    )
    .get() as BrandProfile | undefined;
  return row ?? EMPTY;
}

export function saveBrandProfile(profile: BrandProfile) {
  db.prepare(
    `INSERT INTO brand_profile (id, product_name, icp, voice, positioning, primary_color, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       product_name = excluded.product_name,
       icp = excluded.icp,
       voice = excluded.voice,
       positioning = excluded.positioning,
       primary_color = excluded.primary_color,
       updated_at = excluded.updated_at`
  ).run(
    profile.product_name,
    profile.icp,
    profile.voice,
    profile.positioning,
    profile.primary_color
  );
}
