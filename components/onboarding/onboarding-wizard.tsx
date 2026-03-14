"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullOnboardingSchema,
  OnboardingFormData,
} from "@/lib/validations/onboarding";
import { completeSchoolOnboarding } from "@/actions/onboarding";
import { useUser } from "@clerk/nextjs";
import { FileUpload } from "@/components/file-upload";
import { X } from "lucide-react";
import { AFRICAN_COUNTRIES_STATES } from "@/lib/data/locations";

const steps = [
  { id: 1, title: "Identity & Brand" },
  { id: 2, title: "Contact & Location" },
  { id: 3, title: "Financial & Compliance" },
];

export function OnboardingWizard() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(
      fullOnboardingSchema,
    ) as unknown as Resolver<OnboardingFormData>,
    defaultValues: {
      educationLevels: [],
    },
  });

  const watchEducationLevels = watch("educationLevels") || [];

  const handleNext = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        "name",
        "motto",
        "yearEstablished",
        "schoolType",
        "educationLevels",
        "logoUrl",
        "primaryColor",
        "curriculumType",
      ];
    } else if (currentStep === 2) {
      fieldsToValidate = [
        "email",
        "receptionPhone",
        "fullAddress",
        "state",
        "lga",
        "website",
        "ownerName", // [NEW]
        "ownerEmail", // [NEW]
        "proprietorName", // [NEW]
        "proprietorEmail", // [NEW]
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      document.getElementById("onboarding-scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit: SubmitHandler<OnboardingFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await completeSchoolOnboarding(data);
      if (res.error) {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }

      await user?.reload();
      alert("School Registration Submitted! You are now the School Admin.");
      window.location.href = "/pending-approval"; // Show waiting screen
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEducationLevel = (level: string) => {
    const current = watchEducationLevels;
    if (current.includes(level)) {
      setValue(
        "educationLevels",
        current.filter((l) => l !== level),
        { shouldValidate: true },
      );
    } else {
      setValue("educationLevels", [...current, level], {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-xl">
      {/* Progress Stepper */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          School Registration
        </h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 rounded bg-gray-100"></div>
          <div
            className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 rounded bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          ></div>
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold text-sm transition-colors ${
                step.id <= currentStep
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-400"
              }`}
            >
              {step.id}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs font-medium text-gray-500">
          {steps.map((step) => (
            <span
              key={step.id}
              className={step.id <= currentStep ? "text-blue-600" : ""}
            >
              {step.title}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-4">
        {/* STEP 1: IDENTITY & BRAND */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Identity & Brand
              </h3>
              <p className="text-sm text-gray-500">
                Tell us about your institution.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Greenwood High School"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Motto
                </label>
                <input
                  type="text"
                  {...register("motto")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Excellence in Education"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Type *
                </label>
                <select
                  {...register("schoolType")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Charter">Charter</option>
                  <option value="International">International</option>
                </select>
                {errors.schoolType && (
                  <p className="text-xs text-red-500">
                    {errors.schoolType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Year Established
                </label>
                <input
                  type="number"
                  {...register("yearEstablished")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 1995"
                />
                {errors.yearEstablished && (
                  <p className="text-xs text-red-500">
                    {errors.yearEstablished.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Education Levels *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Nursery",
                    "Primary",
                    "Junior Secondary",
                    "Senior Secondary",
                    "A-Levels",
                  ].map((level) => {
                    const isSelected = watchEducationLevels.includes(level);
                    return (
                      <button
                        type="button"
                        key={level}
                        onClick={() => toggleEducationLevel(level)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-800"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
                {errors.educationLevels && (
                  <p className="text-xs text-red-500">
                    {errors.educationLevels.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Curriculum Type *
                </label>
                <select
                  {...register("curriculumType")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Curriculum</option>
                  <option value="National">National</option>
                  <option value="British">British</option>
                  <option value="American">American</option>
                  <option value="Montessori">Montessori</option>
                  <option value="Blended">Blended / Other</option>
                </select>
                {errors.curriculumType && (
                  <p className="text-xs text-red-500">
                    {errors.curriculumType.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    {...register("primaryColor")}
                    value={watch("primaryColor") || "#000000"}
                    onChange={(e) => setValue("primaryColor", e.target.value, { shouldValidate: true })}
                    className="h-9 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-1"
                  />
                  <input
                    type="text"
                    {...register("primaryColor")}
                    value={watch("primaryColor") || ""}
                    onChange={(e) => setValue("primaryColor", e.target.value, { shouldValidate: true })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                    placeholder="#FFFFFF"
                  />
                </div>
                {errors.primaryColor && (
                  <p className="text-xs text-red-500">
                    {errors.primaryColor.message}
                  </p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Logo
                </label>
                {watch("logoUrl") ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={watch("logoUrl")} alt="Logo" className="object-cover w-full h-full" />
                    <button 
                      type="button"
                      onClick={() => setValue("logoUrl", "", { shouldValidate: true })} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <FileUpload
                    endpoint="schoolLogo"
                    onChange={(url) => {
                      if (url) {
                        setValue("logoUrl", url, { shouldValidate: true });
                      }
                    }}
                  />
                )}
                {errors.logoUrl && (
                  <p className="text-xs text-red-500">
                    {errors.logoUrl.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT & LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact & Location
              </h3>
              <p className="text-sm text-gray-500">
                Provide public contact details and private leadership points.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  School Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="hello@school.edu"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reception Phone *
                </label>
                <input
                  type="tel"
                  {...register("receptionPhone")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+234..."
                />
                {errors.receptionPhone && (
                  <p className="text-xs text-red-500">
                    {errors.receptionPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Address *
                </label>
                <textarea
                  {...register("fullAddress")}
                  rows={2}
                  className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="123 Education Drive..."
                />
                {errors.fullAddress && (
                  <p className="text-xs text-red-500">
                    {errors.fullAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country *
                </label>
                <select
                  {...register("country")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  {Object.keys(AFRICAN_COUNTRIES_STATES).map((cty) => (
                    <option key={cty} value={cty}>
                      {cty}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-xs text-red-500">{errors.country.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  State *
                </label>
                <select
                  {...register("state")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select State</option>
                  {watch("country") && AFRICAN_COUNTRIES_STATES[watch("country")] ? (
                    AFRICAN_COUNTRIES_STATES[watch("country")].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Select a country first</option>
                  )}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  LGA / City *
                </label>
                <input
                  type="text"
                  {...register("lga")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Ikeja"
                />
                {errors.lga && (
                  <p className="text-xs text-red-500">{errors.lga.message}</p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website URL
                </label>
                <input
                  type="url"
                  {...register("website")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://www.school.edu"
                />
                {errors.website && (
                  <p className="text-xs text-red-500">
                    {errors.website.message}
                  </p>
                )}
              </div>

              {/* PROP CHALLENGE DETAILS */}
              <div className="md:col-span-2 mt-2 pt-5 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Security & Ownership Details
                </h4>
                <p className="text-xs text-gray-500 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  For your school&apos;s security, students and staff will be
                  asked to identify these names from a list before requesting to
                  join your school.
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      {...register("ownerName")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.ownerName && (
                      <p className="text-xs text-red-500">
                        {errors.ownerName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      {...register("ownerEmail")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.ownerEmail && (
                      <p className="text-xs text-red-500">
                        {errors.ownerEmail.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proprietor/Principal Name *
                    </label>
                    <input
                      type="text"
                      {...register("proprietorName")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.proprietorName && (
                      <p className="text-xs text-red-500">
                        {errors.proprietorName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proprietor/Principal Email *
                    </label>
                    <input
                      type="email"
                      {...register("proprietorEmail")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.proprietorEmail && (
                      <p className="text-xs text-red-500">
                        {errors.proprietorEmail.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL & COMPLIANCE */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Financials & Compliance
              </h3>
              <p className="text-sm text-gray-500">
                Required for payment settlements via Paystack/Flutterwave.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CAC Registration No. *
                </label>
                <input
                  type="text"
                  {...register("cacRegistrationNumber")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                  placeholder="RC-123456"
                />
                {errors.cacRegistrationNumber && (
                  <p className="text-xs text-red-500">
                    {errors.cacRegistrationNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  TIN (Tax ID) *
                </label>
                <input
                  type="text"
                  {...register("tin")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="12345678-0001"
                />
                {errors.tin && (
                  <p className="text-xs text-red-500">{errors.tin.message}</p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Settlement Bank Name *
                </label>
                <select
                  {...register("settlementBankName")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Bank</option>
                  <option value="Guaranty Trust Bank (GTB)">GTB</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="United Bank for Africa (UBA)">UBA</option>
                  <option value="Other">Other Bank</option>
                </select>
                {errors.settlementBankName && (
                  <p className="text-xs text-red-500">
                    {errors.settlementBankName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Number *
                </label>
                <input
                  type="text"
                  {...register("accountNumber")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0123456789"
                  maxLength={10}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-red-500">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Name *
                </label>
                <input
                  type="text"
                  {...register("accountName")}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                  placeholder="GREENWOOD EDU LIMITED"
                />
                {errors.accountName && (
                  <p className="text-xs text-red-500">
                    {errors.accountName.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION CONTROLS */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back
            </button>
          ) : (
            <div></div> // Spacer to push next to right
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue Forward
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Complete Registration"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
