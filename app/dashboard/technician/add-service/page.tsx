"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CloudUpload,
  House,
  LoaderCircle,
  Mail,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from "lucide-react";

import { toast } from "react-toastify";

import { authClient } from "@/lib/auth-client";
import { createTechnicianService, CreateTechnicianServiceInput, TechnicianService, uploadServiceImage } from "@/lib/api/technician-dashboard";



const CATEGORIES: TechnicianService["category"][] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
  "others",
];

type FormData = {
  title: string;
  category: TechnicianService["category"] | "";
  description: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: TechnicianService["serviceMode"] | "";
  serviceArea: string;
  isAvailable: boolean;
};

const INITIAL_FORM: FormData = {
  title: "",
  category: "",
  description: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "",
  serviceArea: "",
  isAvailable: true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

const LABEL_CLASS = "text-sm font-semibold text-foreground";

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-xs text-destructive">
      {children}
    </p>
  );
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AddServicePage() {
  const { data: session, isPending: sessionPending } =
    authClient.useSession();

  const technicianName = session?.user?.name?.trim() || "";
  const technicianEmail = session?.user?.email?.trim() || "";

  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const uploadRequestRef = useRef(0);

  // Release the local preview URL when the page unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // -----------------------------------------
  // 1. Upload selected image through existing API
  // -----------------------------------------

  async function handleImageUpload(file: File) {
    const requestId = ++uploadRequestRef.current;

    try {
      setUploadingImage(true);

      const uploadedUrl = await uploadServiceImage(file);

      // Ignore an older request if the technician selected another image.
      if (requestId !== uploadRequestRef.current) return;

      setImageUrl(uploadedUrl);

      toast.success("Service image uploaded successfully.");
    } catch (error) {
      if (requestId !== uploadRequestRef.current) return;

      console.error("Service image upload error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload service image."
      );
    } finally {
      if (requestId === uploadRequestRef.current) {
        setUploadingImage(false);
      }
    }
  }

  // -----------------------------------------
  // 2. Select and validate image
  // -----------------------------------------

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    // Reset the input so the same file can be selected again.
    event.target.value = "";

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP and GIF images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5 MB.");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreview(previewUrl);
    setImageUrl("");

    // Upload immediately after selecting the image.
    void handleImageUpload(file);
  }

  // -----------------------------------------
  // 3. Remove selected image
  // -----------------------------------------

  function handleRemoveImage() {
    // Invalidate any upload that is still in progress.
    uploadRequestRef.current += 1;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // -----------------------------------------
  // 4. Reset form
  // -----------------------------------------

  function resetForm() {
    handleRemoveImage();
    setForm(INITIAL_FORM);
  }

  // -----------------------------------------
  // 5. Submit service
  // -----------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!technicianEmail || !technicianName) {
      toast.error("Technician account information is unavailable.");
      return;
    }

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.estimatedDuration.trim() ||
      !form.serviceMode ||
      !form.serviceArea.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const price = Number(form.basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid positive starting price.");
      return;
    }

    if (!imageFile || !imageUrl) {
      toast.error("Please select and upload a service image.");
      return;
    }

    if (uploadingImage) {
      toast.error("Please wait until the image upload finishes.");
      return;
    }

    const serviceData: CreateTechnicianServiceInput = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      image: imageUrl,
      basePrice: price,
      estimatedDuration: form.estimatedDuration.trim(),
      serviceMode: form.serviceMode,
      serviceArea: form.serviceArea.trim(),
      isAvailable: form.isAvailable,
    };

    try {
      setSubmitting(true);

      await createTechnicianService(serviceData);

      toast.success(
        "Service published successfully! It is now waiting for admin approval."
      );

      resetForm();
    } catch (error) {
      console.error("Create service error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create service."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------------------
  // Session loading
  // -----------------------------------------

  if (sessionPending) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-[650px] rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!technicianEmail || !technicianName) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <ShieldCheck size={32} className="text-muted-foreground" />

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Sign in required
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in with your technician account to add a service.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">

      {/* ---------------------------------
          Page heading
      --------------------------------- */}

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PlusCircle size={22} />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Add a Service
          </h1>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Create a new repair service and make it available for customers
            to discover after approval.
          </p>
        </div>
      </div>

      {/* ---------------------------------
          Main form
      --------------------------------- */}

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:p-8"
      >

        {/* SERVICE TITLE */}

        <div className="space-y-2">
          <label htmlFor="title" className={LABEL_CLASS}>
            Service Title <span className="text-destructive">*</span>
          </label>

          <input
            id="title"
            type="text"
            required
            maxLength={120}
            value={form.title}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            placeholder="e.g. MacBook Pro Logic Board Repair"
            className={INPUT_CLASS}
          />
        </div>

        {/* CATEGORY + BASE PRICE */}

        <div className="grid gap-5 sm:grid-cols-2">

          <div className="space-y-2">
            <label htmlFor="category" className={LABEL_CLASS}>
              Category <span className="text-destructive">*</span>
            </label>

            <select
              id="category"
              required
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value as TechnicianService["category"] | ""
                )
              }
              className={INPUT_CLASS}
            >
              <option value="" disabled>
                Select a category
              </option>

              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="basePrice" className={LABEL_CLASS}>
              Starting Price (USD) <span className="text-destructive">*</span>
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>

              <input
                id="basePrice"
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.basePrice}
                onChange={(event) =>
                  updateField("basePrice", event.target.value)
                }
                placeholder="e.g. 149"
                className={`${INPUT_CLASS} pl-8`}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Enter a positive starting price for this repair service.
            </p>
          </div>

        </div>

        {/* DURATION + SERVICE MODE */}

        <div className="grid gap-5 sm:grid-cols-2">

          <div className="space-y-2">
            <label
              htmlFor="estimatedDuration"
              className={LABEL_CLASS}
            >
              Estimated Duration <span className="text-destructive">*</span>
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                id="estimatedDuration"
                type="text"
                required
                maxLength={60}
                value={form.estimatedDuration}
                onChange={(event) =>
                  updateField("estimatedDuration", event.target.value)
                }
                placeholder="e.g. 2–3 hours, 1 day"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className={LABEL_CLASS}>
              Service Mode <span className="text-destructive">*</span>
            </span>

            <div className="grid grid-cols-2 gap-2">

              <label
                className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition ${
                  form.serviceMode === "Home Visit"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="serviceMode"
                  value="Home Visit"
                  checked={form.serviceMode === "Home Visit"}
                  onChange={() =>
                    updateField("serviceMode", "Home Visit")
                  }
                  className="sr-only"
                />

                <div className="flex items-center justify-between">
                  <House
                    size={19}
                    className={
                      form.serviceMode === "Home Visit"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
                  />

                  {form.serviceMode === "Home Visit" && (
                    <CheckCircle2 size={17} className="text-primary" />
                  )}
                </div>

                <span className="text-sm font-semibold text-foreground">
                  Home Visit
                </span>

                <span className="text-xs text-muted-foreground">
                  Technician visits customer location
                </span>
              </label>

              <label
                className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-3 transition ${
                  form.serviceMode === "Shop Drop-off"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="serviceMode"
                  value="Shop Drop-off"
                  checked={form.serviceMode === "Shop Drop-off"}
                  onChange={() =>
                    updateField("serviceMode", "Shop Drop-off")
                  }
                  className="sr-only"
                />

                <div className="flex items-center justify-between">
                  <Store
                    size={19}
                    className={
                      form.serviceMode === "Shop Drop-off"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
                  />

                  {form.serviceMode === "Shop Drop-off" && (
                    <CheckCircle2 size={17} className="text-primary" />
                  )}
                </div>

                <span className="text-sm font-semibold text-foreground">
                  Shop Drop-off
                </span>

                <span className="text-xs text-muted-foreground">
                  Customer brings device to shop
                </span>
              </label>

            </div>
          </div>

        </div>

        {/* SERVICE AREA */}

        <div className="space-y-2">
          <label htmlFor="serviceArea" className={LABEL_CLASS}>
            Service Area <span className="text-destructive">*</span>
          </label>

          <div className="relative">
            <input
              id="serviceArea"
              type="text"
              required
              maxLength={150}
              value={form.serviceArea}
              onChange={(event) =>
                updateField("serviceArea", event.target.value)
              }
              placeholder="e.g. Dhanmondi, Dhaka"
              className={`${INPUT_CLASS} pr-10`}
            />

            <MapPin
              size={17}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Specify the area where you provide this repair service.
          </p>
        </div>

        {/* DESCRIPTION */}

        <div className="space-y-2">
          <label htmlFor="description" className={LABEL_CLASS}>
            Service Description <span className="text-destructive">*</span>
          </label>

          <textarea
            id="description"
            required
            minLength={20}
            maxLength={3000}
            rows={5}
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Describe what this repair service includes, the problems you can fix, and any important details customers should know..."
            className="w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
          />

          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {form.description.length}/3000
            </span>
          </div>
        </div>

        {/* ---------------------------------
            SERVICE IMAGE
        --------------------------------- */}

        <div className="space-y-2">
          <label className={LABEL_CLASS}>
            Service Image <span className="text-destructive">*</span>
          </label>

          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-5 py-8 text-center transition hover:border-primary hover:bg-primary/5"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CloudUpload size={24} />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Upload Service Image
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  SVG, PNG, JPG or WEBP (maximum 5 MB)
                </p>
              </div>

              <span className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm">
                Browse File
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">

              <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="size-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {imageFile?.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {imageFile ? formatFileSize(imageFile.size) : ""}
                  {" · "}
                  {imageUrl
                    ? "Uploaded and hosted on ImgBB CDN"
                    : uploadingImage
                      ? "Uploading to ImgBB..."
                      : "Upload failed"}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                  {imageUrl ? (
                    <>
                      <CheckCircle2
                        size={14}
                        className="text-success"
                      />
                      <span className="text-success">
                        Ready for listing
                      </span>
                    </>
                  ) : uploadingImage ? (
                    <>
                      <LoaderCircle
                        size={14}
                        className="animate-spin text-primary"
                      />
                      <span className="text-primary">
                        Uploading image...
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (imageFile) {
                          void handleImageUpload(imageFile);
                        }
                      }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Retry upload
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploadingImage}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={15} />
                Remove
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

        </div>

        {/* LISTING SETTINGS */}

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wrench size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Available for Customers
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Enable this service for customers after admin approval.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) =>
                updateField("isAvailable", event.target.checked)
              }
              className="size-5 shrink-0 cursor-pointer accent-[#0F766E] dark:accent-[#2DD4BF]"
            />
          </label>
        </div>

        {/* TECHNICIAN INFORMATION */}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />

            <h2 className="text-sm font-semibold text-foreground">
              Technician Information
            </h2>
          </div>

          <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Technician Name
              </p>

              <div className="mt-2 flex items-center gap-2">
                <UserRound size={16} className="shrink-0 text-primary" />

                <span className="truncate text-sm font-medium text-foreground">
                  {technicianName}
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Technician Email
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-primary" />

                <span className="truncate text-sm font-medium text-foreground">
                  {technicianEmail}
                </span>
              </div>
            </div>

          </div>

          <p className="text-xs text-muted-foreground">
            Your technician information is automatically filled from your
            account and cannot be changed here.
          </p>
        </div>

        {/* APPROVAL NOTE */}

        <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4">
          <Clock3
            size={18}
            className="mt-0.5 shrink-0 text-warning"
          />

          <div>
            <p className="text-sm font-semibold text-foreground">
              Admin approval required
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              After publishing, your service will have Pending approval
              status. It will become available on the customer marketplace
              only after an admin approves it.
            </p>
          </div>
        </div>

        {/* FORM ACTIONS */}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/dashboard/technician"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft size={15} />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || uploadingImage || !imageUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Publish Service
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}