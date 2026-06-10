// app/page.tsx — Landing page / redirect
import { redirect } from "next/navigation";

// Redirect root to login — the real landing is the dashboard post-auth
// HACKATHON DAY: Optionally build a landing page here for extra polish
export default function Home() {
  redirect("/login");
}
