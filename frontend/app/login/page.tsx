import { redirect } from "next/navigation";

/** Redirect legacy /login → /signin */
export default function LegacyLoginRedirect() {
  redirect("/signin");
}
