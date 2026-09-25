// app/(auth)/onboarding/components/CompanyDetails.tsx
"use client";

import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { OnboardingData } from "../../../../(auth)/onboarding/page";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CompanyDetailsProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;               // ← ADD

}

const COMPANY_TYPES = [
  "Wholesaler",
  "Distributor",
  "Manufacturer",
  "Importer",
  "Brand Owner",
  "Retailer",
];

export function CompanyDetails({ data, updateData, onNext, onBack }: CompanyDetailsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Company details
        </h2>
        <p className="mt-2 text-sm sm:text-base text-neutral-600">
          Tell us about your business so buyers can find you.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Company Information */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
            Business Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Company Name *"
                name="companyName"
                placeholder="Your Company Ltd"
                value={data.companyName}
                onChange={(e) => updateData({ companyName: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Company Type *
              </label>
              <select
                value={data.companyType}
                onChange={(e) => updateData({ companyType: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              >
                <option value="">Select a company type</option>
                {COMPANY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Business Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                rows={3}
                placeholder="Tell us what you sell and who you serve..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Email *"
              type="email"
              name="companyEmail"
              placeholder="contact@company.com"
              icon="mail"
              value={data.companyEmail}
              onChange={(e) => updateData({ companyEmail: e.target.value })}
              required
            />

            <Input
              label="Business Phone *"
              type="tel"
              name="companyPhone"
              placeholder="+44 7000 000000"
              icon="phone"
              value={data.companyPhone}
              onChange={(e) => updateData({ companyPhone: e.target.value })}
              required
            />

            <div className="sm:col-span-2">
              <Input
                label="Website"
                type="url"
                name="companyWebsite"
                placeholder="https://yourcompany.com"
                value={data.companyWebsite}
                onChange={(e) => updateData({ companyWebsite: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
            Business Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Street Address *"
                name="address"
                placeholder="123 Business Street"
                value={data.address}
                onChange={(e) => updateData({ address: e.target.value })}
                required
              />
            </div>

            <Input
              label="City *"
              name="city"
              placeholder="London"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              required
            />

            <Input
              label="State/Region"
              name="state"
              placeholder="Greater London"
              value={data.state}
              onChange={(e) => updateData({ state: e.target.value })}
            />

            <Input
              label="Postal Code *"
              name="postalCode"
              placeholder="SW1A 1AA"
              value={data.postalCode}
              onChange={(e) => updateData({ postalCode: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Country *
              </label>
              <select
                value={data.country}
                onChange={(e) => updateData({ country: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
            Legal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Registration Number"
              name="registrationNumber"
              placeholder="12345678"
              value={data.registrationNumber}
              onChange={(e) => updateData({ registrationNumber: e.target.value })}
            />

            <Input
              label="VAT/Tax ID"
              name="taxId"
              placeholder="GB123456789"
              value={data.taxId}
              onChange={(e) => updateData({ taxId: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-[180px] justify-center"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}