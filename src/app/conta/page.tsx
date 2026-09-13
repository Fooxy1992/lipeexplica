import { redirect } from "next/navigation";

/**
 * The account area used to live here. It is now a tab of the library, so that
 * buyers find it where they already land. Kept as a redirect: /conta is in
 * emails and bookmarks.
 */
export default function ContaPage() {
  redirect("/library?aba=conta");
}
