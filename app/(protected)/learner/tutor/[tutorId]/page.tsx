import { getTutorProfile } from "@/actions/tutors";
import { CourseCard } from "@/components/courses/course-card";
import {
  Users,
  BookOpen,
  Star,
  Mail,
  Globe,
  Award,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ tutorId: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { tutorId } = await params;
  const tutor = await getTutorProfile(tutorId);

  if (!tutor) {
    redirect("/learner/marketplace");
  }

  return (
    <div className="min-h-screen -m-6 sm:-m-8 lg:-m-10 relative overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-brand/5 dark:bg-brand/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 mb-20">
        {/* Back Button */}
        <Link
          href="/learner/marketplace"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-full bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/5 transition-all mb-8 group shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </Link>

        {/* Profile Header Card */}
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Glass Card */}
          <div className="relative rounded-[40px] overflow-hidden border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-[40px] overflow-hidden border-4 border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl relative z-10 bg-gray-100 dark:bg-surface-muted">
                  {tutor.imageUrl ? (
                    <Image
                      src={tutor.imageUrl}
                      alt={tutor.firstName || "Tutor"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-400 dark:text-white/20 bg-linear-to-br from-gray-200 to-gray-50 dark:from-white/5 dark:to-white/0">
                      {tutor.firstName?.[0]}
                    </div>
                  )}
                </div>
                {/* Glow Effect behind avatar */}
                <div className="absolute inset-0 bg-brand/30 dark:bg-brand/50 rounded-[40px] blur-2xl -z-10 group-hover:bg-brand/50 dark:group-hover:bg-brand/70 transition-colors duration-500" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                    {tutor.firstName} {tutor.lastName}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-white/60 font-medium">
                    {tutor.expertise || "Expert Instructor"}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 font-bold uppercase tracking-wider">
                        Students
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {tutor.totalStudents.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 font-bold uppercase tracking-wider">
                        Courses
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {tutor.courses.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none">
                    <Star className="w-5 h-5 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/40 font-bold uppercase tracking-wider">
                        Rating
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {tutor.avgRating > 0
                          ? tutor.avgRating.toFixed(1)
                          : "New"}{" "}
                        <span className="text-xs text-gray-400 dark:text-white/30 font-normal">
                          ({tutor.totalReviews})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/40 dark:border-white/5 shadow-inner">
                  <p className="text-gray-700 dark:text-white/80 leading-relaxed font-medium">
                    {tutor.bio ||
                      `${tutor.firstName} hasn't added a bio yet, but their courses speak for themselves!`}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-brand dark:hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{tutor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-white/60 hover:text-brand dark:hover:text-white transition-colors">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      nskai.edtech.com/tutor/{tutorId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="max-w-7xl mx-auto mt-20">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-brand" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Published Courses
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {tutor.courses.length > 0 ? (
              tutor.courses.map((course: (typeof tutor.courses)[number]) => (
                <div
                  key={course.id}
                  className="transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <CourseCard course={course} href={`/learner/${course.id}`} />
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400 dark:text-white/40 py-10">
                No courses published yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
