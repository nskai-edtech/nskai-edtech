import { Award, CheckCircle } from "lucide-react";

interface CertificateTemplateProps {
  learnerName: string;
  courseTitle: string;
  tutorName: string;
  completionDate: Date;
}

export function CertificateTemplate({
  learnerName,
  courseTitle,
  tutorName,
  completionDate,
}: CertificateTemplateProps) {
  const formattedDate = completionDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      id="certificate-template"
      className="relative w-[1122px] h-[794px] bg-white p-16 overflow-hidden"
      style={{
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-8 border-4 border-double border-gray-800" />
      <div className="absolute inset-12 border border-gray-400" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
        {/* Logo and Brand */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-xl bg-[#ff0004] flex items-center justify-center">
              <span className="text-3xl font-black text-white">N</span>
            </div>
            <span className="text-4xl font-black text-gray-900">NSK.AI</span>
          </div>
          <p className="text-sm text-gray-600 tracking-widest uppercase">
            EdTech Platform
          </p>
        </div>

        {/* Certificate Title */}
        <div className="mb-8">
          <Award className="w-16 h-16 text-[#ff0004] mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Certificate of Completion
          </h1>
          <div className="w-32 h-1 bg-[#ff0004] mx-auto" />
        </div>

        {/* Certificate Body */}
        <div className="max-w-2xl mb-8">
          <p className="text-lg text-gray-700 mb-6">This is to certify that</p>

          {/* Learner Name */}
          <h2 className="text-4xl font-bold text-gray-900 mb-2 border-b-2 border-gray-300 pb-2">
            {learnerName}
          </h2>

          <p className="text-lg text-gray-700 mb-6 mt-6">
            has successfully completed the course
          </p>

          {/* Course Title */}
          <h3 className="text-2xl font-semibold text-[#ff0004] mb-8">
            {courseTitle}
          </h3>

          <p className="text-base text-gray-600">
            Demonstrating dedication, commitment, and mastery of the course
            material.
          </p>
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between w-full max-w-2xl mt-auto">
          {/* Date */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-[#ff0004]" />
              <p className="text-sm font-semibold text-gray-900">
                Completion Date
              </p>
            </div>
            <p className="text-base text-gray-700 border-t-2 border-gray-300 pt-2">
              {formattedDate}
            </p>
          </div>

          {/* Instructor */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Course Instructor
            </p>
            <p className="text-base text-gray-700 border-t-2 border-gray-300 pt-2">
              {tutorName}
            </p>
          </div>
        </div>

        {/* Certificate ID (Optional) */}
        <div className="mt-6">
          <p className="text-xs text-gray-500 tracking-wider">
            Certificate ID: NSK-
            {completionDate.getTime().toString(36).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-16 left-16 w-12 h-12 border-l-4 border-t-4 border-[#ff0004]" />
      <div className="absolute top-16 right-16 w-12 h-12 border-r-4 border-t-4 border-[#ff0004]" />
      <div className="absolute bottom-16 left-16 w-12 h-12 border-l-4 border-b-4 border-[#ff0004]" />
      <div className="absolute bottom-16 right-16 w-12 h-12 border-r-4 border-b-4 border-[#ff0004]" />
    </div>
  );
}
