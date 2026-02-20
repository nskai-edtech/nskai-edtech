/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useTransition } from "react";
import {
  updateTutorProfile,
  type TutorProfile,
  type UpdateTutorProfileData,
} from "@/actions/tutor-settings";
import { toast } from "sonner";
import {
  User,
  Mail,
  BookOpen,
  Save,
  Loader2,
  Shield,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface SettingsFormProps {
  profile: TutorProfile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [formData, setFormData] = useState<UpdateTutorProfileData>({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    bio: profile.bio || "",
    expertise: profile.expertise || "",
  });

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTutorProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Section 1: Profile Information ──────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand" />
            <h2 className="font-semibold text-lg text-primary-text">
              Profile Information
            </h2>
          </div>
          <p className="text-sm text-secondary-text mt-1">
            This information is visible to students on your course pages.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Profile photo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden shrink-0 border-2 border-border">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-brand" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-text">
                Profile Photo
              </p>
              <p className="text-xs text-secondary-text">
                Your photo is synced from your Clerk account settings.
              </p>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-primary-text mb-1.5"
              >
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="John"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-primary-text mb-1.5"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Doe"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-primary-text mb-1.5"
            >
              Bio
            </label>
            <p className="text-xs text-secondary-text mb-2">
              Tell students about your background and teaching experience.
            </p>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="I'm a passionate educator with 5+ years of experience in AI and Machine Learning..."
              rows={4}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all resize-none"
            />
            <p className="text-xs text-secondary-text mt-1 text-right">
              {(formData.bio || "").length} / 500
            </p>
          </div>

          {/* Expertise */}
          <div>
            <label
              htmlFor="expertise"
              className="block text-sm font-medium text-primary-text mb-1.5"
            >
              Expertise / Specialization
            </label>
            <p className="text-xs text-secondary-text mb-2">
              Your primary area of knowledge (e.g., &quot;Artificial
              Intelligence&quot;, &quot;Web Development&quot;).
            </p>
            <input
              id="expertise"
              type="text"
              value={formData.expertise}
              onChange={(e) =>
                setFormData({ ...formData, expertise: e.target.value })
              }
              placeholder="e.g., Artificial Intelligence, Data Science"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
            />
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Account & Security ───────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg text-primary-text">
              Account & Security
            </h2>
          </div>
          <p className="text-sm text-secondary-text mt-1">
            Your account is managed through Clerk for security.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-muted border border-border rounded-lg">
              <Mail className="w-4 h-4 text-secondary-text" />
              <span className="text-primary-text text-sm">{profile.email}</span>
              <span className="ml-auto text-[10px] uppercase tracking-wider font-semibold text-secondary-text bg-background px-2 py-0.5 rounded-full border border-border">
                Managed by Clerk
              </span>
            </div>
          </div>

          {/* Member since */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-1.5">
              Member Since
            </label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-muted border border-border rounded-lg">
              <Calendar className="w-4 h-4 text-secondary-text" />
              <span className="text-primary-text text-sm">
                {new Date(profile.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Security actions */}
          <div className="pt-2">
            <p className="text-xs text-secondary-text mb-3">
              To change your password, enable 2FA, or manage connected accounts,
              use the Clerk account menu in the sidebar.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Payout Settings ──────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-lg text-primary-text">
              Payout Settings
            </h2>
          </div>
          <p className="text-sm text-secondary-text mt-1">
            Configure how you receive your course earnings.
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-muted border border-border rounded-lg">
            <BookOpen className="w-4 h-4 text-secondary-text" />
            <div>
              <p className="text-sm font-medium text-primary-text">
                Paystack Integration
              </p>
              <p className="text-xs text-secondary-text">
                {profile.paystackCustomerCode
                  ? `Connected — ${profile.paystackCustomerCode.substring(0, 12)}...`
                  : "Not configured yet. Payout setup coming soon."}
              </p>
            </div>
            <span
              className={`ml-auto text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                profile.paystackCustomerCode
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900"
                  : "text-secondary-text bg-background border-border"
              }`}
            >
              {profile.paystackCustomerCode ? "Connected" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 4: Danger Zone ──────────────────────────────────── */}
      <div className="bg-surface border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold text-lg text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-text">
                Deactivate Account
              </p>
              <p className="text-xs text-secondary-text max-w-sm">
                This will remove your courses from the marketplace and disable
                student access. This action can be reversed by contacting
                support.
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
