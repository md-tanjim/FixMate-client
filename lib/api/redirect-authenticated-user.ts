import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";


export async function redirectAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

 
  if (!session) return;


  switch (session.user.role) {
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