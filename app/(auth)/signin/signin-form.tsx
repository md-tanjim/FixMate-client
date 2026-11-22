
"use client";

import { Suspense, useState, type FormEvent } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

import {
  Activity,
  ArrowRight,
  CreditCard,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";

import {
  isUserRole,
  type UserRole,
} from "@/lib/config/user-roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ==================================================
// 1. ROLE DASHBOARD CONFIGURATION
// ==================================================

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  technician: "/dashboard/technician",
  admin: "/dashboard/admin",
};

// ==================================================
// 2. CALLBACK URL VALIDATION
// ==================================================

function getSafeCallbackUrl(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const baseUrl = "https://fixmate.local";
    const parsedUrl = new URL(value, baseUrl);

    if (parsedUrl.origin !== baseUrl) {
      return null;
    }

    return (
      parsedUrl.pathname +
      parsedUrl.search +
      parsedUrl.hash
    );
  } catch {
    return null;
  }
}

// ==================================================
// 3. SIGN-IN FORM
// ==================================================

function SignInForm() {
  // ----------------------------
  // Password state
  // ----------------------------

  const [showPassword, setShowPassword] = useState(false);

  // ----------------------------
  // Loading states
  // ----------------------------

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // ----------------------------
  // Remember Me
  // ----------------------------

  const [rememberMe, setRememberMe] = useState(true);

  // ----------------------------
  // Better Auth session
  // ----------------------------

  const { refetch } = useSession();

  // ----------------------------
  // Callback URL
  // ----------------------------

  const searchParams = useSearchParams();

  // Original page the user wanted to visit.
  const callbackUrl = searchParams.get("callbackUrl");

  // Only accept valid internal destinations.
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  // Preserve the original destination when navigating to signup.
  const registerUrl = safeCallbackUrl
    ? `/signup?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : "/signup";

  // ==================================================
  // 4. EMAIL AND PASSWORD SIGN-IN
  // ==================================================

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || socialLoading) return;

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // ----------------------------
    // Validate email
    // ----------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // ----------------------------
      // Authenticate with Better Auth
      // ----------------------------

      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error || !data) {
        toast.error(error?.message || "Invalid email or password.");
        return;
      }

      // ----------------------------
      // Determine user's dashboard
      // ----------------------------

      const userRole = data.user.role;

      if (!isUserRole(userRole)) {
        toast.error(
          "Your account has an invalid role. Please contact support."
        );
        return;
      }

      const dashboardUrl = ROLE_DASHBOARDS[userRole];

      // Original destination takes priority.
      const redirectUrl = safeCallbackUrl ?? dashboardUrl;

      // Refresh Better Auth session.
      await refetch();

      toast.success("Welcome back to FixMate!");

      // Replace avoids returning to signin with the back button.
      window.location.replace(redirectUrl);

    } catch (error) {
      console.error("Sign-in error:", error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // 5. GOOGLE SIGN-IN
  // ==================================================

  const handleGoogleSignIn = async () => {
    if (loading || socialLoading) return;

    setSocialLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",

        // Preserve the original destination.
        // Otherwise, use the role-aware dashboard resolver.
        callbackURL: safeCallbackUrl ?? "/dashboard",
      });

      if (error) {
        toast.error(
          error.message || "Unable to sign in with Google."
        );
      }
    } catch (error) {
      console.error("Google sign-in error:", error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  // ==================================================
  // 6. UI
  // ==================================================

  return (
    <main className="fm-auth-page">
      <div className="fm-auth-frame">

        {/* ==========================================
            LEFT BRAND PANEL
        ========================================== */}

        <aside className="fm-auth-aside">

          <div>
            {/* Brand */}

            <Link href="/" className="fm-auth-brand">
              <span className="fm-auth-brand-mark">
                <Wrench size={23} strokeWidth={2.2} />
              </span>

              <span className="fm-auth-brand-name">
                Fix<span>Mate</span>
              </span>
            </Link>

            {/* Brand content */}

            <div className="fm-auth-aside-content">

              <span className="fm-auth-eyebrow">
                <span className="size-1.5 rounded-full bg-[#80D5CB]" />
                SMART REPAIR MARKETPLACE
              </span>

              <h1 className="fm-auth-aside-title">
                Welcome back.
                <br />
                Lets get things <span>fixed.</span>
              </h1>

              <p className="fm-auth-aside-description">
                Your repair services, active jobs, and important
                updates are waiting for you.
              </p>

              {/* Platform benefits */}

              <div className="fm-auth-benefits">

                <div className="fm-auth-benefit">
                  <span className="fm-auth-benefit-icon">
                    <ShieldCheck size={18} />
                  </span>

                  <span>
                    A structured and transparent repair process
                  </span>
                </div>

                <div className="fm-auth-benefit">
                  <span className="fm-auth-benefit-icon">
                    <Activity size={18} />
                  </span>

                  <span>
                    Track repair progress and manage your jobs
                  </span>
                </div>

                <div className="fm-auth-benefit">
                  <span className="fm-auth-benefit-icon">
                    <CreditCard size={18} />
                  </span>

                  <span>
                    Secure payments after service completion
                  </span>
                </div>

              </div>
            </div>
          </div>

          <div className="fm-auth-aside-footer">
            <span>© {new Date().getFullYear()} FixMate</span>
            <span>Repair with confidence.</span>
          </div>

        </aside>

        {/* ==========================================
            RIGHT SIGN-IN PANEL
        ========================================== */}

        <section className="fm-auth-panel">
          <div className="fm-auth-form-container">

            {/* Heading */}

            <div className="fm-auth-form-heading">

              <p className="fm-auth-form-kicker">
                YOUR FIXMATE ACCOUNT
              </p>

              <h2 className="fm-auth-form-title">
                Welcome back
              </h2>

              <p className="fm-auth-form-description">
                Sign in to continue to your FixMate dashboard.
              </p>

            </div>

            {/* Sign-in form */}

            <form onSubmit={onSubmit} className="fm-auth-form">

              {/* ======================================
                  EMAIL
              ====================================== */}

              <div className="fm-auth-field">

                <Label
                  htmlFor="email"
                  className="fm-auth-field-label"
                >
                  Email address
                </Label>

                <div className="fm-auth-field-control">

                  <Mail className="fm-auth-field-icon" />

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="fm-auth-input"
                  />

                </div>
              </div>

              {/* ======================================
                  PASSWORD
              ====================================== */}

              <div className="fm-auth-field">

                <div className="flex items-center justify-between">

                  <Label
                    htmlFor="password"
                    className="fm-auth-field-label"
                  >
                    Password
                  </Label>

                </div>

                <div className="fm-auth-field-control">

                  <LockKeyhole className="fm-auth-field-icon" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="fm-auth-input fm-auth-password-input"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="fm-auth-password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>
              </div>

              {/* ======================================
                  REMEMBER ME
              ====================================== */}

              <div className="flex items-center justify-between gap-3">

                <label className="flex cursor-pointer items-center gap-2">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    className="size-4 cursor-pointer accent-[#0F766E]"
                  />

                  <span className="text-xs text-[var(--fm-muted)]">
                    Keep me signed in
                  </span>

                </label>

                <div className="flex items-center gap-1.5 text-[11px] text-[var(--fm-muted)]">
                  <ShieldCheck
                    size={14}
                    className="text-[var(--fm-success)]"
                  />
                  Secure login
                </div>

              </div>

              {/* ======================================
                  SUBMIT
              ====================================== */}

              <Button
                type="submit"
                disabled={loading || socialLoading}
                className="fm-auth-submit"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in to FixMate
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>

              {/* ======================================
                  DIVIDER
              ====================================== */}

              <div className="fm-auth-divider">
                OR CONTINUE WITH
              </div>

              {/* ======================================
                  GOOGLE
              ====================================== */}

              <Button
                type="button"
                variant="outline"
                disabled={loading || socialLoading}
                onClick={handleGoogleSignIn}
                className="fm-auth-google"
              >
                <FcGoogle size={19} />

                {socialLoading
                  ? "Connecting..."
                  : "Continue with Google"}
              </Button>

            </form>

            {/* ======================================
                SIGNUP LINK
            ====================================== */}

            <div className="fm-auth-signin-link">
              Dont have an account?{" "}
              <Link href={registerUrl}>
                Create an account
              </Link>
            </div>

            {/* Security note */}

            <div className="fm-auth-security-note">
              <ShieldCheck size={15} />
              Your account information is protected.
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}

// ==================================================
// 7. SUSPENSE BOUNDARY
// ==================================================

export default function SignInFormPage() {
  return (
    <Suspense
      fallback={
        <main className="fm-auth-page">
          <p className="fm-auth-loading">
            Preparing your FixMate sign-in page...
          </p>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
