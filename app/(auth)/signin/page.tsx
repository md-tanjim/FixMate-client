
import { redirectAuthenticatedUser } from "@/lib/api/redirect-authenticated-user";

import SignInFormPage from "./signin-form";


export default async function SignInPage() {
  // Redirect users who are already authenticated.
  await redirectAuthenticatedUser();

  // Only logged-out users will reach this component.
  return <SignInFormPage />;
}
