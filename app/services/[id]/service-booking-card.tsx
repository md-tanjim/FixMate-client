
"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";


import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TechnicianService } from "@/lib/api/technician-dashboard";
import { API_BASE_URL } from "@/lib/api/customer-dashboard";

type ServiceBookingCardProps = {
  service: Pick<
    TechnicianService,
    | "_id"
    | "title"
    | "basePrice"
    | "estimatedDuration"
    | "serviceMode"
    | "serviceArea"
  >;
};

type BookingFormValues = {
  phone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
};

type BookingErrors = Partial<
  Record<keyof BookingFormValues, string>
>;


const INITIAL_VALUES: BookingFormValues = {
  phone: "",
  address: "",
  preferredDate: "",
  problemDescription: "",
};

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function ServiceBookingCard({
  service,
}: ServiceBookingCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = authClient.useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [values, setValues] =
    useState<BookingFormValues>(INITIAL_VALUES);

  const [errors, setErrors] = useState<BookingErrors>({});

  const today = getTodayDate();
  const userRole = session?.user.role;

  const isRestricted =
    !!session && userRole !== "customer";

  const isDisabled = isPending || isRestricted;



  function handleRequestRepair() {
    if (isPending) return;


    if (!session) {
      router.push(
        `/signin?callbackURL=${encodeURIComponent(pathname)}`
      );
      return;
    }


    if (userRole !== "customer") return;

    setIsDialogOpen(true);
  }


  function handleChange(
    field: keyof BookingFormValues,
    value: string
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

 

  function validateForm(): BookingErrors {
    const newErrors: BookingErrors = {};

    if (!values.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    }

    if (!values.address.trim()) {
      newErrors.address = "Please enter your service address.";
    }

    if (!values.preferredDate) {
      newErrors.preferredDate = "Please select a preferred date.";
    } else if (values.preferredDate < today) {
      newErrors.preferredDate =
        "The preferred date cannot be in the past.";
    }

    if (!values.problemDescription.trim()) {
      newErrors.problemDescription =
        "Please describe your problem.";
    } else if (
      values.problemDescription.trim().length < 20
    ) {
      newErrors.problemDescription =
        "Please enter at least 20 characters.";
    }

    return newErrors;
  }



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!session || userRole !== "customer") {
      toast.error("Please sign in with a customer account.");
      return;
    }

    try {
      setIsSubmitting(true);


      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.");
      }

   
      const response = await fetch(`${API_BASE_URL}/customer/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service._id,
          customerPhone: values.phone.trim(),
          address: values.address.trim(),
          preferredDate: values.preferredDate,
          problemDescription: values.problemDescription.trim(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to submit your repair request."
        );
      }

      // Successful booking.
      setIsSuccessful(true);
      toast.success("Your repair request has been submitted!");

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }



  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      setValues(INITIAL_VALUES);
      setErrors({});
      setIsSuccessful(false);
    }
  }

  return (
    <>

      <Card className="w-full rounded-2xl border-border bg-card shadow-sm lg:sticky lg:top-24">
        <CardContent className="space-y-6 p-6">

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Service Booking
            </p>

            <h2 className="text-lg font-bold leading-snug text-foreground">
              {service.title}
            </h2>
          </div>

          {/* Base price */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Base Price
            </p>

            <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {formatPrice(service.basePrice)}
            </p>

            <p className="text-xs text-muted-foreground">
              Starting price
            </p>
          </div>

  
          <div className="space-y-3 rounded-xl bg-muted/60 p-4">

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="size-4 shrink-0" />
                <span>Duration</span>
              </div>

              <span className="text-right text-sm font-medium text-foreground">
                {service.estimatedDuration}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Service Mode
              </span>

              <span className="text-right text-sm font-medium text-foreground">
                {service.serviceMode}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span>Coverage Area</span>
              </div>

              <span className="text-right text-sm font-medium text-foreground">
                {service.serviceArea}
              </span>
            </div>

          </div>

          <div className="space-y-3">
            <Button
              type="button"
              size="lg"
              className="h-11 w-full gap-2 font-semibold"
              disabled={isDisabled}
              onClick={handleRequestRepair}
            >
              {isPending
                ? "Checking account..."
                : "Request Repair"}

              <ArrowRight className="size-4" />
            </Button>

            {isRestricted ? (
              <p className="text-center text-xs text-muted-foreground">
                Only customers can request a repair.
              </p>
            ) : (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                No upfront payment. Pay only after your repair is completed.
              </p>
            )}
          </div>

        </CardContent>
      </Card>



      <Dialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">

          {isSuccessful ? (
         
            <div className="flex flex-col items-center py-6 text-center">

              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="size-9 text-success" />
              </div>

              <DialogTitle className="text-xl font-bold">
                Request Submitted!
              </DialogTitle>

              <DialogDescription className="mt-2 max-w-sm">
                Your repair request has been sent to the technician.
                You can track its progress from your bookings.
              </DialogDescription>

              <Button className="mt-6 w-full">
                <Link href="/dashboard/customer/bookings">
                  View My Bookings
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="mt-2 w-full"
                onClick={() => handleDialogChange(false)}
              >
                Close
              </Button>

            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Request a Repair
                </DialogTitle>

                <DialogDescription>
                  Provide your contact information and describe
                  the problem so the technician can review your request.
                </DialogDescription>
              </DialogHeader>


              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 p-4">

                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Requesting Service
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-foreground">
                    {service.title}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    Base Price
                  </p>

                  <p className="text-base font-bold text-primary">
                    {formatPrice(service.basePrice)}
                  </p>
                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                <div className="space-y-4">

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Customer Information
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your account details are filled automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerName">
                      Full Name
                    </Label>

                    <Input
                      id="customerName"
                      value={session?.user.name ?? ""}
                      readOnly
                      className="bg-muted/60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">
                      Email Address
                    </Label>

                    <Input
                      id="customerEmail"
                      type="email"
                      value={session?.user.email ?? ""}
                      readOnly
                      className="bg-muted/60"
                    />
                  </div>

                </div>

 
                <div className="space-y-4">

                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Repair Information
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Tell the technician how and when to reach you.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={values.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                      aria-invalid={!!errors.phone}
                      disabled={isSubmitting}
                    />

                    {errors.phone && (
                      <p className="text-xs text-destructive">
                        {errors.phone}
                      </p>
                    )}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      id="address"
                      placeholder="House, road, area, city"
                      value={values.address}
                      onChange={(event) =>
                        handleChange("address", event.target.value)
                      }
                      aria-invalid={!!errors.address}
                      disabled={isSubmitting}
                    />

                    {errors.address && (
                      <p className="text-xs text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">
                      Preferred Date{" "}
                      <span className="text-destructive">*</span>
                    </Label>

                    <Input
                      id="preferredDate"
                      type="date"
                      min={today}
                      value={values.preferredDate}
                      onChange={(event) =>
                        handleChange("preferredDate", event.target.value)
                      }
                      aria-invalid={!!errors.preferredDate}
                      disabled={isSubmitting}
                    />

                    <p className="text-xs text-muted-foreground">
                      Select today or a future date.
                    </p>

                    {errors.preferredDate && (
                      <p className="text-xs text-destructive">
                        {errors.preferredDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="problemDescription">
                        Problem Description{" "}
                        <span className="text-destructive">*</span>
                      </Label>

                      <span className="text-xs tabular-nums text-muted-foreground">
                        {values.problemDescription.trim().length} / 20 min
                      </span>
                    </div>

                    <Textarea
                      id="problemDescription"
                      placeholder="Describe what's wrong with your device or appliance..."
                      rows={4}
                      value={values.problemDescription}
                      onChange={(event) =>
                        handleChange(
                          "problemDescription",
                          event.target.value
                        )
                      }
                      aria-invalid={!!errors.problemDescription}
                      disabled={isSubmitting}
                      className="resize-none"
                    />

                    {errors.problemDescription && (
                      <p className="text-xs text-destructive">
                        {errors.problemDescription}
                      </p>
                    )}
                  </div>

                </div>

     
                <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                    {!isSubmitting && (
                      <ArrowRight className="size-4" />
                    )}
                  </Button>

                </div>

              </form>
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
