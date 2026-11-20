"use client";

import { useEffect, useRef, useState } from "react";

import {
  CheckCircle2,
  Clock3,
  CloudUpload,
  LoaderCircle,
  Mail,
  MapPin,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
    uploadServiceImage,
  type TechnicianService,
  type UpdateTechnicianServiceInput,
} from "@/lib/api/technician-dashboard";



type EditServiceDialogProps = {
  service: TechnicianService;
  onClose: () => void;
  onSave: (
    serviceId: string,
    data: UpdateTechnicianServiceInput
  ) => Promise<void>;
};

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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20";

const LABEL_CLASS = "text-sm font-semibold text-foreground";

type EditForm = UpdateTechnicianServiceInput;

export default function EditServiceDialog({
  service,
  onClose,
  onSave,
}: EditServiceDialogProps) {
  // Initialize the form from the selected service.
  // The parent renders this component with key={service._id}.
  const [form, setForm] = useState<EditForm>(() => ({
    title: service.title,
    category: service.category,
    description: service.description,
    image: service.image,
    basePrice: service.basePrice,
    estimatedDuration: service.estimatedDuration,
    serviceMode: service.serviceMode,
    serviceArea: service.serviceArea,
  }));

  const [imagePreview, setImagePreview] = useState(service.image);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const uploadRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      uploadRequestRef.current += 1;

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof EditForm>(
    field: K,
    value: EditForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // ------------------------------------------
  // Upload replacement image
  // ------------------------------------------

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

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

    setImagePreview(previewUrl);
    updateField("image", "");

    const requestId = ++uploadRequestRef.current;

    try {
      setUploadingImage(true);

      const uploadedUrl = await uploadServiceImage(file);

      if (requestId !== uploadRequestRef.current) return;

      updateField("image", uploadedUrl);
      setImagePreview(uploadedUrl);

      // The uploaded URL is now the preview, so the local object URL
      // can be released.
      URL.revokeObjectURL(previewUrl);
      previewUrlRef.current = null;

      toast.success("Service image uploaded successfully.");
    } catch (error) {
      if (requestId !== uploadRequestRef.current) return;

      console.error("Edit service image upload error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      if (requestId === uploadRequestRef.current) {
        setUploadingImage(false);
      }
    }
  }

  function handleRemoveImage() {
    uploadRequestRef.current += 1;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImagePreview("");
    updateField("image", "");
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ------------------------------------------
  // Save edited service
  // ------------------------------------------

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.estimatedDuration.trim() ||
      !form.serviceMode ||
      !form.serviceArea.trim() ||
      !form.image.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    const price = Number(form.basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Please enter a valid positive price.");
      return;
    }

    if (uploadingImage) {
      toast.error("Please wait until the image upload finishes.");
      return;
    }

    const updatedData: EditForm = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      estimatedDuration: form.estimatedDuration.trim(),
      serviceArea: form.serviceArea.trim(),
      basePrice: price,
    };

    try {
      setSaving(true);

      await onSave(service._id, updatedData);

      toast.success(
        "Service updated. It is now waiting for admin re-approval."
      );

      onClose();
    } catch (error) {
      console.error("Update service error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update service."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">

      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close edit service dialog"
        disabled={saving}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-service-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2
              id="edit-service-title"
              className="text-lg font-bold text-foreground"
            >
              Edit Service
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update your service information and submit it for re-approval.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6"
        >

          {/* Service title */}
          <div className="space-y-2">
            <label htmlFor="edit-title" className={LABEL_CLASS}>
              Service Title <span className="text-destructive">*</span>
            </label>

            <input
              id="edit-title"
              type="text"
              required
              maxLength={120}
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className={INPUT_CLASS}
            />
          </div>

          {/* Category and base price */}
          <div className="grid gap-5 sm:grid-cols-2">

            <div className="space-y-2">
              <label htmlFor="edit-category" className={LABEL_CLASS}>
                Category <span className="text-destructive">*</span>
              </label>

              <select
                id="edit-category"
                required
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value as TechnicianService["category"]
                  )
                }
                className={INPUT_CLASS}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category === "others" ? "Others" : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-price" className={LABEL_CLASS}>
                Starting Price (USD) <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>

                <input
                  id="edit-price"
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(event) =>
                    updateField(
                      "basePrice",
                      Number(event.target.value)
                    )
                  }
                  className={`${INPUT_CLASS} pl-8`}
                />
              </div>
            </div>

          </div>

          {/* Duration and service mode */}
          <div className="grid gap-5 sm:grid-cols-2">

            <div className="space-y-2">
              <label htmlFor="edit-duration" className={LABEL_CLASS}>
                Estimated Duration <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <Clock3
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="edit-duration"
                  type="text"
                  required
                  maxLength={60}
                  value={form.estimatedDuration}
                  onChange={(event) =>
                    updateField("estimatedDuration", event.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className={LABEL_CLASS}>
                Service Mode <span className="text-destructive">*</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {(
                  ["Home Visit", "Shop Drop-off"] as const
                ).map((mode) => {
                  const selected = form.serviceMode === mode;
                  const Icon = mode === "Home Visit" ? MapPin : Store;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateField("serviceMode", mode)}
                      className={`flex min-h-20 flex-col items-start justify-between rounded-lg border p-3 text-left transition ${
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon
                          size={18}
                          className={selected ? "text-primary" : "text-muted-foreground"}
                        />

                        {selected && (
                          <CheckCircle2
                            size={15}
                            className="text-primary"
                          />
                        )}
                      </div>

                      <span className="text-xs font-semibold text-foreground">
                        {mode}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Service area */}
          <div className="space-y-2">
            <label htmlFor="edit-area" className={LABEL_CLASS}>
              Service Area <span className="text-destructive">*</span>
            </label>

            <div className="relative">
              <input
                id="edit-area"
                type="text"
                required
                maxLength={150}
                value={form.serviceArea}
                onChange={(event) =>
                  updateField("serviceArea", event.target.value)
                }
                className={`${INPUT_CLASS} pr-10`}
              />

              <MapPin
                size={17}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="edit-description" className={LABEL_CLASS}>
              Service Description <span className="text-destructive">*</span>
            </label>

            <textarea
              id="edit-description"
              required
              minLength={20}
              maxLength={3000}
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20"
            />

            <p className="text-right text-xs text-muted-foreground">
              {form.description.length}/3000
            </p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className={LABEL_CLASS}>
              Service Image <span className="text-destructive">*</span>
            </label>

            {imagePreview ? (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="size-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Service image
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {form.image
                      ? "Image ready to save"
                      : uploadingImage
                        ? "Uploading image..."
                        : "Select an image to replace the current one"}
                  </p>

                  {uploadingImage && (
                    <span className="mt-2 inline-flex items-center gap-2 text-xs text-primary">
                      <LoaderCircle size={14} className="animate-spin" />
                      Uploading to ImgBB...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={uploadingImage || saving}
                  onClick={handleRemoveImage}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-5 transition hover:border-primary hover:bg-primary/5"
              >
                <CloudUpload size={26} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Upload Service Image
                </span>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, WEBP or GIF · Maximum 5 MB
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void handleImageChange(event)}
              className="hidden"
            />

            {!imagePreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Browse file
              </button>
            )}
          </div>

          {/* Availability display */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Marketplace Availability
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Change availability using the confirmed toggle on the service card.
                </p>
              </div>

              <span className="text-xs font-semibold text-foreground">
                {service.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Technician information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Technician Information
              </h3>
            </div>

            <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Technician Name
                </p>

                <p className="mt-2 flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  <UserRound size={15} className="shrink-0 text-primary" />
                  {service.technicianName}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Technician Email
                </p>

                <p className="mt-2 flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  <Mail size={15} className="shrink-0 text-primary" />
                  {service.technicianEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Re-approval notice */}
          <div className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4">
            <Clock3 size={18} className="mt-0.5 shrink-0 text-warning" />

            <div>
              <p className="text-sm font-semibold text-foreground">
                Admin re-approval required
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Saving changes will reset this services approval status to
                Pending. It must be approved again before appearing on the
                customer marketplace.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage || !form.image}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}