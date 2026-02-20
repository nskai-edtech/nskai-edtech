import { getTutorProfile } from "@/actions/tutor-settings";
import { SettingsForm } from "@/components/tutor/settings-form";

export default async function TutorSettingsPage() {
  const profile = await getTutorProfile();

  if ("error" in profile) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900">
          Error: {profile.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-text">Settings</h1>
        <p className="text-secondary-text mt-1">
          Manage your profile, account, and payout preferences.
        </p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  );
}
