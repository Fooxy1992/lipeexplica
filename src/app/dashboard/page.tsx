import { redirect } from "next/navigation";

/** /dashboard is an alias of /library (kept for future expansion). */
export default function DashboardPage() {
  redirect("/library");
}
