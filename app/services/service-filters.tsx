
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, ListFilter, X } from "lucide-react";

import type { PublicServicesQuery } from "@/lib/api/publicApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ServiceFiltersProps = {
  initialFilters?: PublicServicesQuery;
};

const CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
  "others",
] as const;

const SERVICE_MODES = [
  "Home Visit",
  "Shop Drop-off",
] as const;

export default function ServiceFilters({
  initialFilters,
}: ServiceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Clean up the debounce timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // --------------------------------------------------
  // UPDATE URL
  // --------------------------------------------------

  function updateUrl(updates: Record<string, string>) {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    const params = new URLSearchParams(window.location.search);

    // Preserve the current search input when another filter changes.
    if (!("search" in updates)) {
      const currentSearch = searchInputRef.current?.value.trim() ?? "";

      if (currentSearch) {
        params.set("search", currentSearch);
      } else {
        params.delete("search");
      }
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || value === "newest") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();

    router.replace(
      queryString ? `${pathname}?${queryString}` : pathname,
      { scroll: false }
    );
  }

  // --------------------------------------------------
  // SEARCH — DEBOUNCED
  // --------------------------------------------------

  function handleSearchChange(value: string) {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      updateUrl({ search: value.trim() });
    }, 400);
  }

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  function clearFilters() {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }

    updateUrl({
      search: "",
      category: "",
      serviceMode: "",
      sort: "newest",
    });
  }

  const selectedCategory = initialFilters?.category || "all";
  const selectedServiceMode = initialFilters?.serviceMode || "all";
  const selectedSort = initialFilters?.sort || "newest";

  const hasActiveFilters =
    !!initialFilters?.search ||
    !!initialFilters?.category ||
    !!initialFilters?.serviceMode ||
    selectedSort !== "newest";

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_190px_190px_180px_auto] lg:items-center">

      {/* Search */}
      <div className="relative sm:col-span-2 lg:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          key={initialFilters?.search ?? ""}
          ref={searchInputRef}
          type="search"
          placeholder="Search by service name or category..."
          defaultValue={initialFilters?.search ?? ""}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
          maxLength={100}
          className="h-11 border-0 bg-muted/60 pl-10 shadow-none focus-visible:ring-1"
        />
      </div>

      {/* Category */}
      <Select
  value={selectedCategory === "all" ? undefined : selectedCategory}
  onValueChange={(value) =>
    updateUrl({ category: value as string})
  }
>
  <SelectTrigger className="h-11 w-full border-0 bg-muted/60 shadow-none">
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem>

    {CATEGORIES.map((item) => (
      <SelectItem key={item} value={item}>
        {item === "others" ? "Others" : item}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

      {/* Service Mode */}
      <Select
  value={selectedServiceMode === "all" ? undefined : selectedServiceMode}
  onValueChange={(value) =>
    updateUrl({ serviceMode: value as string})
  }
>
  <SelectTrigger className="h-11 w-full border-0 bg-muted/60 shadow-none">
    <SelectValue placeholder="All Service Modes" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="all">All Service Modes</SelectItem>

    {SERVICE_MODES.map((mode) => (
      <SelectItem key={mode} value={mode}>
        {mode}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

      {/* Sort */}
      <Select
        value={selectedSort}
        onValueChange={(value) =>
          updateUrl({ sort: value  as string})
        }
      >
        <SelectTrigger className="h-11 w-full border-0 bg-muted/60 shadow-none">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="Sort by" />
            <ListFilter className="size-4 text-muted-foreground" />
          </div>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>

          <SelectItem value="price-asc">
            Price: Low to High
          </SelectItem>

          <SelectItem value="price-desc">
            Price: High to Low
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      <Button
        type="button"
        variant="ghost"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="h-11 gap-2 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <X className="size-4" />
        Clear Filters
      </Button>

    </div>
  );
}
