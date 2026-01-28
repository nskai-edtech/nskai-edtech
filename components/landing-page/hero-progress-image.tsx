import { TrafficCone } from "lucide-react";

function HeroProgressImage() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 w-full h-auto min-h-[350px] md:h-[480px] px-4 md:px-8 py-8 flex flex-col justify-end rounded-2xl">
      <div className="flex flex-col gap-6 bg-white dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start md:flex-row md:items-center gap-4">
            <TrafficCone className="w-12 h-12 bg-brand p-2 rounded-full text-white" />
            <div>
              <p className="text-brand font-semibold text-xl">
                Current Progress
              </p>
              <p className="text-secondary-text">RAG Agents Learning Path</p>
            </div>
          </div>
        </div>
        {/* progress bar */}
        <div>
          <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700">
            <div
              className="bg-brand h-6 rounded-full transition-all duration-300"
              style={{ width: "65%" }}
            >
              <p className="text-white text-center">65%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroProgressImage;
