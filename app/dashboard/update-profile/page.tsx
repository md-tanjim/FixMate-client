
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { toast } from "react-toastify";
import {
  Camera,
  LockKeyhole,
  Loader2,
  UserRound,
} from "lucide-react";

import { useSession, authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: "customer" | "technician" | "admin";
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
};

type ProfileForm = {
  name: string;
  phone: string;
  area: string;
  bio: string;
};

function getProfileForm(user: ProfileUser): ProfileForm {
  return {
    name: user.name ?? "",
    phone: user.phone ?? "",
    area: user.area ?? "",
    bio: user.bio ?? "",
  };
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function formatRole(role?: string) {
  if (!role) return "Customer";

  return role.charAt(0).toUpperCase() + role.slice(1);
}

// -----------------------------------------------------------------------------
// imgBB upload
// -----------------------------------------------------------------------------

async function uploadProfilePhoto(file: File): Promise<string> {

    const apiKey = process.env.NEXT_PUBLIC_IMG_BB_API_KEY;

    // console.log(apiKey,"imgbbkeeeyyyyyyy")
  if (!apiKey) {
    throw new Error("ImgBB API key is missing.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.error?.message || "Failed to upload profile photo."
    );
  }

  return result.data.display_url || result.data.url;
}

// -----------------------------------------------------------------------------
// Main page
// -----------------------------------------------------------------------------

export default function ProfilePage() {
  const { data: session, isPending, refetch } = useSession();

  const user = session?.user as ProfileUser | undefined;

 const [formOverrides, setFormOverrides] =
  useState<Partial<ProfileForm>>({});

const form: ProfileForm = {
  name: formOverrides.name ?? user?.name ?? "",
  phone: formOverrides.phone ?? user?.phone ?? "",
  area: formOverrides.area ?? user?.area ?? "",
  bio: formOverrides.bio ?? user?.bio ?? "",
};

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Prefill every field using the authenticated user's saved profile.
  // ---------------------------------------------------------------------------



  // ---------------------------------------------------------------------------
  // Profile photo preview
  // ---------------------------------------------------------------------------

const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const previewUrlRef = useRef<string | null>(null);

function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select a valid image.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Profile photo must be smaller than 5 MB.");
    event.target.value = "";
    return;
  }

  if (previewUrlRef.current) {
    URL.revokeObjectURL(previewUrlRef.current);
  }

  const previewUrl = URL.createObjectURL(file);

  previewUrlRef.current = previewUrl;

  setSelectedPhoto(file);
  setPhotoPreview(previewUrl);
}

// Release the object URL when the component unmounts.
useEffect(() => {
  return () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
  };
}, []);

  // ---------------------------------------------------------------------------
  // Input handlers
  // ---------------------------------------------------------------------------

function handleChange(
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const { name, value } = event.target;

  setFormOverrides((previous) => ({
    ...previous,
    [name]: value,
  }));
}



  // ---------------------------------------------------------------------------
  // Cancel changes
  // ---------------------------------------------------------------------------
function handleCancel() {
  setFormOverrides({});
  setSelectedPhoto(null);
  setPhotoPreview(null);

  if (previewUrlRef.current) {
    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
}

  // ---------------------------------------------------------------------------
  // Save profile
  // ---------------------------------------------------------------------------

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const name = form.name.trim();

    if (name.length < 3) {
      toast.error("Name must be at least 3 characters.");
      return;
    }

    setIsSaving(true);

    try {
      // Upload a new photo only when the user selected one.
      let image = user.image || undefined;

      if (selectedPhoto) {
        image = await uploadProfilePhoto(selectedPhoto);
      }

      const { error } = await authClient.updateUser({
        name,
        phone: form.phone.trim(),
        area: form.area.trim(),
        bio: form.bio.trim(),
        ...(image ? { image } : {}),
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile.");
      }

      // Refresh BetterAuth session so other components receive new details.
      await refetch();

      setSelectedPhoto(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isPending) {
    return (
      <div className="w-full space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-5 w-40" />

          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>

          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <UserRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">
          Unable to load your profile
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please sign in again to access your profile settings.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full space-y-5">
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Profile Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage your personal information and profile details.
        </p>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="space-y-6 p-5 sm:p-6">
          {/* Profile photo and name */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-14 w-14 shrink-0 border border-border">
               <AvatarImage
  src={photoPreview || user.image || undefined}
  alt={form.name}
/>
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(form.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {form.name || "Your Profile"}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Upload a profile picture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="h-9 gap-2 border-primary/25 text-primary hover:bg-primary/5"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Personal information */}
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-foreground">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              {/* Full name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>

                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={3}
                  autoComplete="name"
                  className="h-10 border-border bg-muted/30 text-sm shadow-none focus-visible:ring-primary/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>

                <div className="relative">
                  <Input
                    id="email"
                    value={user.email}
                    readOnly
                    className="h-10 border-border bg-muted/60 pr-10 text-sm text-muted-foreground shadow-none"
                  />

                  <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                  className="h-10 border-border bg-muted/30 text-sm shadow-none focus-visible:ring-primary/20"
                />
              </div>

              {/* Area */}
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>

                <Input
                  id="area"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Enter your city or area"
                  autoComplete="address-level2"
                  className="h-10 border-border bg-muted/30 text-sm shadow-none focus-visible:ring-primary/20"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>

                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                  className="min-h-[100px] resize-y border-border bg-muted/30 text-sm shadow-none focus-visible:ring-primary/20"
                />
              </div>

              {/* Account role */}
              <div className="space-y-2 sm:max-w-[calc(50%-0.625rem)]">
                <Label htmlFor="role">Account Role</Label>

                <div className="relative">
                  <Input
                    id="role"
                    value={formatRole(user.role)}
                    readOnly
                    className="h-10 border-border bg-muted/60 pr-10 text-sm text-muted-foreground shadow-none"
                  />

                  <LockKeyhole className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={handleCancel}
            className="h-10"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
