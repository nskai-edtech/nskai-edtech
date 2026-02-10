import { Metadata } from "next";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Press Kit",
  description: "Brand assets and guidelines for media usage.",
};

export default function PressKitPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Press Kit</h1>
      <p className="lead">
        Official brand assets, logos, and guidelines for NSK.AI.
      </p>

      <h2>Logos</h2>
      <div className="not-prose grid gap-6 sm:grid-cols-2 my-8">
        <div className="border border-border p-8 rounded-xl bg-white flex flex-col items-center justify-center gap-4">
          <div className="text-2xl font-bold text-black">NSK.AI</div>
          <p className="text-gray-500 text-sm">Light Mode Logo</p>
          <button className="flex items-center gap-2 text-sm text-brand font-medium">
            <Download className="w-4 h-4" /> Download SVG
          </button>
        </div>
        <div className="border border-border p-8 rounded-xl bg-[#0f172a] flex flex-col items-center justify-center gap-4">
          <div className="text-2xl font-bold text-white">NSK.AI</div>
          <p className="text-gray-400 text-sm">Dark Mode Logo</p>
          <button className="flex items-center gap-2 text-sm text-brand font-medium">
            <Download className="w-4 h-4" /> Download SVG
          </button>
        </div>
      </div>

      <h2>Brand Colors</h2>
      <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        {[
          { name: "Brand Red", hex: "#ff0004", text: "text-white" },
          { name: "Surface", hex: "#ffffff", border: true },
          { name: "Dark Surface", hex: "#0f172a", text: "text-white" },
          { name: "Text", hex: "#111827", text: "text-white" },
        ].map((color) => (
          <div
            key={color.name}
            className={`h-24 rounded-lg flex items-end p-3 ${color.border ? "border border-gray-200" : ""}`}
            style={{ backgroundColor: color.hex }}
          >
            <div
              className={`text-xs font-mono ${color.text || "text-gray-900"}`}
            >
              {color.hex}
            </div>
          </div>
        ))}
      </div>

      <h2>Media Contact</h2>
      <p>
        For press inquiries, please contact{" "}
        <a href="mailto:press@nskai.org">press@nskai.org</a>
      </p>
    </div>
  );
}
