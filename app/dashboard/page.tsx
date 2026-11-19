
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {

  // Get the currently logged-in user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not logged in, redirect to signin
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  // Get the user's accountType
  const accountType = session.user.role;

  console.log(session?.user)

  // Redirect according to accountType
  switch (accountType) {
    case "customer":
      redirect("/dashboard/customer");

    case "technician":
      redirect("/dashboard/technician");

    case "admin":
      redirect("/dashboard/admin");

    default:
      redirect("/");
  }
}