import {
  Github,
  Globe,
  Linkedin,
  Send,
  CreditCard,
  Wallet,
  Twitter,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Features", href: "#" },
  { label: "AI Tutors", href: "#" },
  { label: "Pricing Plans", href: "#" },
  { label: "For Schools", href: "#" },
  { label: "Case Studies", href: "#" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Press Kit", href: "#" },
  { label: "Contact", href: "#" },
];

const RESOURCE_LINKS: FooterLink[] = [
  { label: "Documentation", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "API Reference", href: "#" },
  { label: "Community", href: "#" },
  { label: "Partner Program", href: "#" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Security", href: "#" },
  { label: "Accessibility", href: "#" },
];

function FooterSection() {
  return (
    <footer className="w-full">
      {/* MAIN FOOTER */}
      <div className="bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white pt-16 pb-8 px-4 md:px-8 lg:px-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: Brand + Newsletter */}
          <div className="flex flex-col lg:flex-row justify-between gap-12 border-b border-gray-200 dark:border-gray-800 pb-12">
            {/* Brand */}
            <div className="flex flex-col gap-6 max-w-sm">
              <div className="flex items-center gap-2">
                <div className="bg-brand p-1.5 rounded-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NSKAI Platform</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Empowering the next generation of learners through personalized
                AI-driven education. Join thousands of students scaling their
                knowledge with 24/7 AI tutoring.
              </p>
              <div className="flex items-center gap-4">
                {[Twitter, Linkedin, Globe, Github].map((Icon, i) => (
                  <button
                    key={i}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-brand transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter Card */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full transition-colors">
              <h4 className="font-semibold text-lg mb-2">
                Stay updated with the latest in AI education
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Join our newsletter to receive updates on new AI tutors and
                features.
              </p>
              <div className="flex gap-2">
                <div className="relative grow">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                  />
                  <Send className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                </div>
                <button className="bg-brand hover:bg-brand/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap select-none shadow-sm shadow-brand/20">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates.
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-200 dark:border-gray-800">
            {[
              { title: "Product", links: PRODUCT_LINKS },
              { title: "Company", links: COMPANY_LINKS },
              { title: "Resources", links: RESOURCE_LINKS },
              { title: "Legal", links: LEGAL_LINKS },
            ].map((section) => (
              <div key={section.title}>
                <h5 className="font-semibold mb-6 text-sm tracking-wider uppercase text-gray-500 dark:text-gray-400">
                  {section.title}
                </h5>
                <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="hover:text-brand transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} NSKAI Education Platform. All
              rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer hover:text-brand transition-colors text-gray-500 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <span className="text-sm">English (US)</span>
              </div>
              <div className="flex gap-2">
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-500 dark:text-gray-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded text-gray-500 dark:text-gray-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS DIRECTORY */}
      <div className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white py-16 px-4 md:px-8 lg:px-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-bold mb-12 text-center">
            Quick Access Directory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              {
                title: "Core Platform",
                desc: "Access AI-tutors and personalized dashboard.",
              },
              {
                title: "Global API",
                desc: "Integrate our AI models into your school's LMS.",
              },
              {
                title: "Help Center",
                desc: "Guides, video tutorials, and technical support.",
              },
              {
                title: "Careers",
                desc: "We are always looking for AI researchers and educators.",
              },
              {
                title: "Security",
                desc: "Our commitment to data privacy and student safety.",
              },
              {
                title: "Community",
                desc: "Join the forum to discuss the future of education.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h6 className="text-brand font-bold mb-2 text-sm uppercase">
                  {item.title}
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
