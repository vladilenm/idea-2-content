import type { GeneratedAsset } from "./generate";
import { createClient } from "./supabase/client";

export interface Idea {
  id: string;
  idea: string;
  assets: GeneratedAsset[] | null;
  created_at: string;
}

export async function saveIdea(idea: string, assets: GeneratedAsset[]) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "not_authenticated" as const };

  const { data, error } = await supabase
    .from("ideas")
    .insert({ user_id: userData.user.id, idea, assets })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Idea };
}

export async function listIdeas(): Promise<Idea[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id, idea, assets, created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Idea[];
}

export async function deleteIdea(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  return { error: error?.message };
}
