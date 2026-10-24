// components/auth/onboarding/components/PostcodeLookup.tsx
"use client";

import { useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

export interface PostcodeAddress {
  line_1: string;
  line_2: string;
  post_town: string;
  postcode: string;
  county: string;
}

interface PostcodeLookupProps {
  postalCode: string;
  address: string;
  city: string;
  state: string;
  onChange: (patch: {
    postalCode?: string;
    address?: string;
    city?: string;
    state?: string;
  }) => void;
  disabled?: boolean;
}

export function PostcodeLookup({
  postalCode,
  address,
  city,
  state,
  onChange,
  disabled,
}: PostcodeLookupProps) {
  const [addresses, setAddresses] = useState<PostcodeAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupPostcode = async () => {
    const cleaned = postalCode.trim().replace(/\s+/g, "");
    if (!cleaned) {
      setError("Enter a postcode first.");
      return;
    }

    setLoading(true);
    setError(null);
    setAddresses([]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_IDEAL_POSTCODES_API_KEY;
      if (!apiKey) {
        setError("Postcode lookup is not configured.");
        return;
      }

      const res = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          cleaned
        )}?api_key=${apiKey}`
      );

      if (!res.ok) {
        setError("Could not look up that postcode. Please try again.");
        return;
      }

      const json = await res.json();
      const results = json?.result ?? [];

      if (!results.length) {
        setError("No addresses found for that postcode.");
        return;
      }

      const options: PostcodeAddress[] = results.map((r: any) => ({
        line_1: r.line_1 || "",
        line_2: r.line_2 || "",
        post_town: r.post_town || "",
        postcode: r.postcode || "",
        county: r.county || "",
      }));

      setAddresses(options);

      if (options.length === 1) {
        applyAddress(options[0]);
      }
    } catch (err) {
      console.error("Postcode lookup failed:", err);
      setError("Address lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyAddress = (addr: PostcodeAddress) => {
    onChange({
      address: [addr.line_1, addr.line_2].filter(Boolean).join(", "),
      city: addr.post_town,
      state: addr.county,
      postalCode: addr.postcode,
    });
    setAddresses([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Postcode input */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Postcode
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  lookupPostcode();
                }
              }}
              placeholder="SW1A 1AA"
              disabled={disabled || loading}
              className="w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
            />
          </div>
          <button
            type="button"
            onClick={lookupPostcode}
            disabled={disabled || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>

      {/* Address dropdown */}
      {addresses.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Select address ({addresses.length} found)
          </label>
          <select
            defaultValue=""
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              if (!isNaN(idx)) applyAddress(addresses[idx]);
            }}
            disabled={disabled}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="" disabled>
              Choose an address…
            </option>
            {addresses.map((a, i) => (
              <option key={i} value={i}>
                {[a.line_1, a.line_2].filter(Boolean).join(", ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Confirmed address */}
      {address && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onChange({ address: e.target.value })}
            disabled={disabled}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
          />
        </div>
      )}

      {/* City + State */}
      {(city || state) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {city && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Town / City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => onChange({ city: e.target.value })}
                disabled={disabled}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
              />
            </div>
          )}
          {state && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                County / Region
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => onChange({ state: e.target.value })}
                disabled={disabled}
                placeholder="Optional"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}