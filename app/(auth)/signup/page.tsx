import { redirectAuthenticatedUser } from "@/lib/api/redirect-authenticated-user";
import SignUpFormPage from "./signup-form";



// -----------------------------------------------------------------------------
// Sign Up Page — Server Component
// -----------------------------------------------------------------------------

export default async function SignUpPage() {
  // Check whether the user is already authenticated.
  await redirectAuthenticatedUser();

  // Only logged-out users will reach this component.
  return <SignUpFormPage/>;
}