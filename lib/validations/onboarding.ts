import { z } from "zod";

export const identitySchema = z.object({
  name: z.string().min(2, "School name is required"),
  motto: z.string().optional(),
  yearEstablished: z.coerce
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  schoolType: z.string().min(1, "School type is required"),
  educationLevels: z
    .array(z.string())
    .min(1, "Select at least one education level"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .optional()
    .or(z.literal("")),
  curriculumType: z.string().min(1, "Curriculum type is required"),
});

export const locationSchema = z.object({
  email: z.string().email("Valid email is required"),
  receptionPhone: z.string().min(5, "Phone number is required"),
  fullAddress: z.string().min(5, "Full address is required"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "LGA is required"),
  website: z.string().url("Valid URL is required").optional().or(z.literal("")),
  // [NEW] Security Challenge Fields
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Valid owner email is required"),
  proprietorName: z.string().min(2, "Proprietor name is required"),
  proprietorEmail: z.string().email("Valid proprietor email is required"),
});

export const financialSchema = z.object({
  cacRegistrationNumber: z.string().min(1, "CAC Registration is required"),
  tin: z.string().min(1, "TIN is required"),
  settlementBankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Valid account number required").max(12),
  accountName: z.string().min(2, "Account name is required"),
});

// For final submission typing
export const fullOnboardingSchema = identitySchema
  .merge(locationSchema)
  .merge(financialSchema);
export type OnboardingFormData = z.infer<typeof fullOnboardingSchema>;
