"use client";

import { useState } from "react";
import { updateLearnerProfile } from "@/actions/profile";
import { toast } from "sonner";
import { InterestsSelector } from "./interests-selector";

interface ProfileFormProps {
  initialBio: string | null;
  initialInterests: string[] | null;
}

export function ProfileForm({
  initialBio,
  initialInterests,
}: ProfileFormProps) {
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
