
"use client";

import {
  Suspense,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";

import {
  SIGNUP_ROLES,
  USER_ROLES,
  isSignupRole,
  type SignupRole,
} from "@/lib/config/user-roles";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ==================================================
// 1. ROLE CONFIGURATION
// ==================================================

const ROLE_DETAILS: Record<
  SignupRole,
  {
    description: string;
    icon: LucideIcon;
  }
> = {
  customer: {
    description: "Find technicians and request repair services.",
    icon: UserRound,
  },

  technician: {
    description: "List your services and manage repair jobs.",
    icon: Wrench,
  },
};

// ==================================================
// 2. IMAGE CONFIGURATION
// ==================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ==================================================
// 3. CALLBACK URL VALIDATION
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
// 4. SIGNUP FORM
// ==================================================

function SignUpForm() {
  // ----------------------------
  // Role state
  // ----------------------------

  const [signupRole, setSignupRole] = useState<SignupRole | "">("");

  // ----------------------------
  // Password state
  // ----------------------------

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // ----------------------------
  // Image state
  // ----------------------------

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generate a temporary preview URL for the selected image.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);

    setImagePreview(previewUrl);

    // Release the temporary URL when the image changes
    // or the component unmounts.
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  // ----------------------------
  // Loading states
  // ----------------------------

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const { refetch } = useSession();

  // ----------------------------
  // Callback URL
  // ----------------------------

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  const signInUrl = safeCallbackUrl
    ? `/signin?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : "/signin";

  // ==================================================
  // 5. HANDLE IMAGE SELECTION
  // ==================================================

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate image type.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP or GIF image.");
      event.target.value = "";
      return;
    }

    // Validate image size.
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  // ==================================================
  // 6. EMAIL AND PASSWORD SIGNUP
  // ==================================================

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading || socialLoading) return;

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const submittedPassword = String(formData.get("password") ?? "");

    const phone = String(formData.get("phone") ?? "").trim();
    const area = String(formData.get("area") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();

    // ----------------------------
    // Role validation
    // ----------------------------

    if (!isSignupRole(signupRole)) {
      toast.error("Please select how you want to join FixMate.");
      return;
    }

    // ----------------------------
    // Name validation
    // ----------------------------

    if (name.length < 3) {
      toast.error("Name must be at least 3 characters.");
      return;
    }

    // ----------------------------
    // Email validation
    // ----------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // ----------------------------
    // Optional phone validation
    // ----------------------------

    if (phone && !/^\+?[\d\s()-]{7,20}$/.test(phone)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    // ----------------------------
    // Password validation
    // Matches the FixMate PDF.
    // ----------------------------

    const hasMinimumLength = submittedPassword.length >= 6;
    const hasUppercase = /[A-Z]/.test(submittedPassword);
    const hasLowercase = /[a-z]/.test(submittedPassword);

    if (!hasMinimumLength || !hasUppercase || !hasLowercase) {
      setPasswordError(
        "Password must contain at least 6 characters, one uppercase letter, and one lowercase letter."
      );

      toast.error("Please meet all password requirements.");
      return;
    }

    setPasswordError("");

    // ----------------------------
    // Dashboard fallback
    // ----------------------------

    const dashboardUrl =
      signupRole === "technician"
        ? "/dashboard/technician"
        : "/dashboard/customer";

    const redirectUrl = safeCallbackUrl ?? dashboardUrl;

    setLoading(true);

    try {
      let imageUrl: string | undefined;

      // ==========================================
      // Upload the profile image first
      // ==========================================

      if (imageFile) {
        setImageUploading(true);

        const uploadData = new FormData();

        uploadData.append("image", imageFile);

        const uploadResponse = await fetch(
          "/api/upload/profile-image",
          {
            method: "POST",
            body: uploadData,
          }
        );

        const uploadResult = (await uploadResponse.json()) as {
          success?: boolean;
          imageUrl?: string;
          message?: string;
        };

        if (
          !uploadResponse.ok ||
          !uploadResult.success ||
          typeof uploadResult.imageUrl !== "string"
        ) {
          throw new Error(
            uploadResult.message || "Profile image upload failed."
          );
        }

        imageUrl = uploadResult.imageUrl;

        setImageUploading(false);
      }

      // ==========================================
      // Create the Better Auth account
      // ==========================================

      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password: submittedPassword,

        // Standard Better Auth image field.
        image: imageUrl,

        // Temporary field converted into role
        // by the server-side database hook.
        signupRole,

        // Custom FixMate profile fields.
        phone: phone || undefined,
        area: area || undefined,
        bio: bio || undefined,
      });

      if (error || !data) {
        toast.error(
          error?.message || "Unable to create your account."
        );
        return;
      }

      toast.success("Your FixMate account was created!");

      // Refresh the Better Auth session.
      await refetch();

      // Return to the originally requested page,
      // or redirect to the role-specific dashboard.
      window.location.replace(redirectUrl);

    } catch (error) {
      console.error("Signup error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  // ==================================================
  // 7. GOOGLE SIGNUP
  // ==================================================

  const handleGoogleSignUp = async () => {
    if (loading || socialLoading) return;

    // Google registration defaults to customer.
    // Don't silently register someone as a customer
    // when they explicitly selected technician.
    if (signupRole === "technician") {
      toast.info(
        "Google signup creates a Customer account. Use email signup to register as a Technician."
      );
      return;
    }

    setSocialLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: safeCallbackUrl ?? "/dashboard/customer",
      });

      if (error) {
        toast.error(
          error.message || "Unable to continue with Google."
        );
      }
    } catch (error) {
      console.error("Google signup error:", error);

      toast.error("Something went wrong. Please try again.");
    } finally {
      setSocialLoading(false);
    }
  };

  // ==================================================
  // 8. PASSWORD REQUIREMENTS
  // ==================================================

  const passwordRequirements = [
    {
      label: "At least 6 characters",
      valid: password.length >= 6,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
  ];

  // ==================================================
  // 9. UI
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
                Repairs made simple.
                <br />
                Progress made <span>clear.</span>
              </h1>

              <p className="fm-auth-aside-description">
                Find the right repair professional, keep track
                of every job, and pay only after your repair is
                completed.
              </p>

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
                    Track your repair progress step by step
                  </span>
                </div>

                <div className="fm-auth-benefit">
                  <span className="fm-auth-benefit-icon">
                    <CreditCard size={18} />
                  </span>

                  <span>
                    Pay after the technician completes the work
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
            RIGHT SIGNUP PANEL
        ========================================== */}

        <section className="fm-auth-panel">
          <div className="fm-auth-form-container">

            {/* Heading */}

            <div className="fm-auth-form-heading">

              <p className="fm-auth-form-kicker">
                GET STARTED WITH FIXMATE
              </p>

              <h2 className="fm-auth-form-title">
                Create your account
              </h2>

              <p className="fm-auth-form-description">
                Join FixMate and get started with smarter repair services.
              </p>

            </div>

            {/* Signup form */}

            <form onSubmit={onSubmit} className="fm-auth-form">

              {/* ======================================
                  ROLE SELECTION
              ====================================== */}

              <fieldset className="grid gap-2 border-0 p-0">
                <legend className="fm-auth-field-label mb-2">
                  I want to join as
                </legend>

                <div className="fm-auth-role-grid">

                  {SIGNUP_ROLES.map((role) => {
                    const Icon = ROLE_DETAILS[role].icon;
                    const selected = signupRole === role;

                    return (
                      <label
                        key={role}
                        className="fm-auth-role-card"
                        data-selected={selected}
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="signupRole"
                          value={role}
                          checked={selected}
                          onChange={() => setSignupRole(role)}
                        />

                        <span className="fm-auth-role-icon">
                          <Icon size={19} />
                        </span>

                        <span className="fm-auth-role-name">
                          {USER_ROLES[role].label}
                        </span>

                        <span className="fm-auth-role-description">
                          {ROLE_DETAILS[role].description}
                        </span>

                        {selected && (
                          <span className="fm-auth-role-check">
                            <CheckCircle2 size={17} />
                          </span>
                        )}
                      </label>
                    );
                  })}

                </div>
              </fieldset>

              {/* ======================================
                  FULL NAME
              ====================================== */}

              <div className="fm-auth-field">

                <Label
                  htmlFor="name"
                  className="fm-auth-field-label"
                >
                  Full name
                </Label>

                <div className="fm-auth-field-control">

                  <UserRound className="fm-auth-field-icon" />

                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={3}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className="fm-auth-input"
                  />

                </div>
              </div>

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
                  PROFILE IMAGE
              ====================================== */}

              <div className="fm-auth-field">

                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="profile-image"
                    className="fm-auth-field-label"
                  >
                    Profile photo
                  </Label>

                  <span className="text-xs text-[var(--fm-muted)]">
                    Optional
                  </span>
                </div>

                <div className="fm-auth-upload">

                  <div className="fm-auth-upload-preview">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Selected profile photo"
                        width={72}
                        height={72}
                        unoptimized
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <UserRound size={28} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <label
                      htmlFor="profile-image"
                      className="fm-auth-upload-button"
                    >
                      <ImagePlus size={16} />
                      {imageFile ? "Change photo" : "Choose photo"}
                    </label>

                    <p className="fm-auth-upload-info">
                      JPG, PNG, WEBP or GIF · Maximum 5 MB
                    </p>

                    {imageFile && (
                      <p className="fm-auth-upload-filename">
                        {imageFile.name}
                      </p>
                    )}

                  </div>

                  {imageFile && (
                    <button
                      type="button"
                      aria-label="Remove selected profile photo"
                      className="fm-auth-remove-image"
                      onClick={() => setImageFile(null)}
                    >
                      <Trash2 size={17} />
                    </button>
                  )}

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleImageChange}
                    disabled={loading || socialLoading}
                  />

                </div>
              </div>

              {/* ======================================
                  PHONE AND AREA
              ====================================== */}

              <div className="fm-auth-two-columns">

                <div className="fm-auth-field">

                  <Label
                    htmlFor="phone"
                    className="fm-auth-field-label"
                  >
                    Phone number
                    <span className="ml-1 font-normal text-[var(--fm-muted)]">
                      (Optional)
                    </span>
                  </Label>

                  <div className="fm-auth-field-control">

                    <Phone className="fm-auth-field-icon" />

                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+880 1XXXXXXXXX"
                      className="fm-auth-input"
                    />

                  </div>
                </div>

                <div className="fm-auth-field">

                  <Label
                    htmlFor="area"
                    className="fm-auth-field-label"
                  >
                    Area / City
                    <span className="ml-1 font-normal text-[var(--fm-muted)]">
                      (Optional)
                    </span>
                  </Label>

                  <div className="fm-auth-field-control">

                    <MapPin className="fm-auth-field-icon" />

                    <Input
                      id="area"
                      name="area"
                      type="text"
                      placeholder="Mirpur, Dhaka"
                      autoComplete="address-level2"
                      className="fm-auth-input"
                    />

                  </div>
                </div>

              </div>

              {/* ======================================
                  BIO
              ====================================== */}

              <div className="fm-auth-field">

                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="bio"
                    className="fm-auth-field-label"
                  >
                    About you
                  </Label>

                  <span className="text-xs text-[var(--fm-muted)]">
                    Optional
                  </span>
                </div>

                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder={
                    signupRole === "technician"
                      ? "Introduce your skills and repair experience..."
                      : "Tell us a little about yourself..."
                  }
                  className="fm-auth-textarea"
                />

              </div>

              {/* ======================================
                  PASSWORD
              ====================================== */}

              <div className="fm-auth-field">

                <Label
                  htmlFor="password"
                  className="fm-auth-field-label"
                >
                  Password
                </Label>

                <div className="fm-auth-field-control">

                  <LockKeyhole className="fm-auth-field-icon" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Create a password"
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

                {/* Live password requirements */}

                <div
                  className="fm-auth-password-requirements"
                  aria-live="polite"
                >
                  {passwordRequirements.map((requirement) => (
                    <span
                      key={requirement.label}
                      className="fm-auth-password-rule"
                      data-valid={requirement.valid}
                    >
                      {requirement.valid ? (
                        <Check size={13} />
                      ) : (
                        <span>○</span>
                      )}

                      {requirement.label}
                    </span>
                  ))}
                </div>

                {passwordError && (
                  <p className="fm-auth-field-error" role="alert">
                    {passwordError}
                  </p>
                )}

              </div>

              {/* ======================================
                  CREATE ACCOUNT
              ====================================== */}

              <Button
                type="submit"
                disabled={loading || socialLoading}
                className="fm-auth-submit"
              >
                {imageUploading
                  ? "Uploading profile photo..."
                  : loading
                    ? "Creating account..."
                    : (
                      <>
                        Create account
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
                  GOOGLE SIGNUP
              ====================================== */}

              <Button
                type="button"
                variant="outline"
                disabled={loading || socialLoading}
                onClick={handleGoogleSignUp}
                className="fm-auth-google"
              >
                <FcGoogle size={19} />

                {socialLoading
                  ? "Connecting..."
                  : "Continue with Google"}
              </Button>

              <p className="fm-auth-google-note">
                Google signup creates a Customer account by default.
              </p>

            </form>

            {/* ======================================
                SIGN IN LINK
            ====================================== */}

            <div className="fm-auth-signin-link">
              Already have an account?{" "}
              <Link href={signInUrl}>
                Sign in
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
// 10. SUSPENSE BOUNDARY
// ==================================================

export default function SignUpFormPage() {
  return (
    <Suspense
      fallback={
        <main className="fm-auth-page">
          <p className="fm-auth-loading">
            Preparing your FixMate signup page...
          </p>
        </main>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
