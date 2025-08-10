import { supabaseServer } from "@/lib/supabase-server";

export async function getPublicUrl(bucket: string, path: string) {
  const sb = await supabaseServer();
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// If you use Route Handlers for upload, you’ll call sb.storage.from("drill-media").upload(path, file, { contentType: file.type })
