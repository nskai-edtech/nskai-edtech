import { Blocks, BookOpenTextIcon, School } from "lucide-react";

const FEATURES = [
  {
    title: "Personalized Curriculum",
    description:
      "Our AI-powered system adapts to your learning pace and style, ensuring you get the most out of your study time.",
    icon: <BookOpenTextIcon />,
  },
  {
    title: "24/7 AI Mentorship",
    description:
      "Get instant guidance and feedbacks from our AI-integrated tutor, available anytime to help you overcome hurdles and master complex concepts.",
    icon: <School />,
  },
  {
    title: "Interactive Simulations",
    description:
      "Engage with interactive simulations to reinforce your understanding and retention.",
    icon: <Blocks />,
  },
];

function FeaturesSection() {
  return (
    <div className="py-24">
      {/* Heading */}
      <div className="flex flex-col items-center gap-6">
        <div className="bg-brand/40 dark:bg-brand/20 text-brand text-sm font-semibold px-4 py-2 rounded-full text-center">
          Our Features
        </div>
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-primary-text text-center">
            Empowering Your Learning Journey With{" "}
            <span className="text-brand">AI</span>
          </h2>
          <p className="text-base md:text-lg mt-4 text-secondary-text text-center">
            Our features are designed to provide a seamless and effective
            learning experience using the latest AI technology, tailored to your
            learning style and goals.
          </p>
        </div>
      </div>
      {/* Feature card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-brand text-white rounded-lg">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-primary-text">
              {feature.title}
            </h3>
            <p className="text-secondary-text leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturesSection;
