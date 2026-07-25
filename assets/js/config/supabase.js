const SUPABASE_URL = "https://kyirbugglwjnrbzuctdo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_NKh2Fa7rJhrYvMtZkBGRfw_5Qi2UpZC";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

console.log("Supabase client connected:", supabaseClient);

async function testSupabaseMaterials() {
  const { data, error } = await supabaseClient.from("materials").select("*");

  if (error) {
    console.error("Supabase materials error:", error);
    return;
  }

  console.log("Supabase materials:", data);
}

testSupabaseMaterials();