import Navbar from "@/components/landing-page/navbar";
import FooterSection from "@/components/landing-page/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
