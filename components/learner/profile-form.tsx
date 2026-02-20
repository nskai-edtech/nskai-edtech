"use client";

import { useState } from "react";
import { updateLearnerProfile } from "@/actions/profile";
import { toast } from "sonner";
import { InterestsSelector } from "./interests-selector";
import { FileUpload } from "@/components/file-upload";
import Image from "next/image";
import { X } from "lucide-react";

interface ProfileFormProps {
  initialFirstName: string | null;
  initialLastName: string | null;
  initialImageUrl: string | null;
  initialBio: string | null;
  initialInterests: string[] | null;
}

export function ProfileForm({
  initialFirstName,
  initialLastName,
  initialImageUrl,
  initialBio,
  initialInterests,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [bio, setBio] = useState(initialBio || "");
  const [interests, setInterests] = useState<string[]>(initialInterests || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (topicId: string) => {
    setInterests((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateLearnerProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        imageUrl: imageUrl || undefined,
        bio: bio.trim() || undefined,
        interests: interests.length > 0 ? interests : undefined,
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("[ERROR UPDATING PROFILE]", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Image Field */}
      <div className="flex flex-col items-center sm:items-start space-y-4">
        <label className="block text-sm font-bold text-primary-text">
          Profile Picture
        </label>
        {imageUrl ? (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border border-border shadow-sm">
            <Image src={imageUrl} alt="Avatar" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-0 right-0 p-1 m-1 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full sm:w-80 h-48 border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-surface-muted overflow-hidden">
            <FileUpload
              endpoint="courseImage" // Using existing general image uploader config
              onChange={(url) => setImageUrl(url || "")}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name Field */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-bold text-primary-text mb-2"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="John"
          />
        </div>
        {/* Last Name Field */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-bold text-primary-text mb-2"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Bio Field */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-bold text-primary-text mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand resize-none"
        />
        <p className="text-xs text-secondary-text mt-1">
          {bio.length}/500 characters
        </p>
      </div>

      {/* Interests Field */}
      <div>
        <label className="block text-sm font-bold text-primary-text mb-3">
          Interests
        </label>
        <p className="text-xs text-secondary-text mb-3">
          Select topics you&apos;re interested in learning about
        </p>
        <InterestsSelector
          selectedInterests={interests}
          onToggle={toggleInterest}
        />
        <p className="text-xs text-secondary-text mt-2">
          {interests.length} topic{interests.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-brand text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
