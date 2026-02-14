import { createClient } from "@supabase/supabase-js";
import { ShipLogClient } from "./ship-log-client";

export const dynamic = "force-dynamic";

async function getInitialEntries() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from("ship_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  return data || [];
}

export default async function ShipLogPage() {
  const entries = await getInitialEntries();

  return (
    <div className="px-4 sm:px-6 sm:max-w-2xl sm:mx-auto py-6">
      <ShipLogClient initialEntries={entries} />
    </div>
  );
}
