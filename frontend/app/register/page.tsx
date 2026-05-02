import { redirect } from "next/navigation";

/** Redirect legacy /register → /splash */
export default function LegacyRegisterRedirect() {
  redirect("/splash");
}
