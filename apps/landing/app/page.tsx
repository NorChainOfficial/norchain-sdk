import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import EcosystemOverview from "../components/EcosystemOverview";
import DeveloperQuickStart from "../components/DeveloperQuickStart";
import EnterpriseFeatures from "../components/EnterpriseFeatures";
import NetworkStats from "../components/NetworkStats";
import TechnologyStack from "../components/TechnologyStack";
import FAQ from "../components/FAQ";
import Community from "../components/Community";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import AgenticChatbot from "../components/AgenticChatbot";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Features />
      <EcosystemOverview />
      <DeveloperQuickStart />
      <EnterpriseFeatures />
      <NetworkStats />
      <TechnologyStack />
      <FAQ />
      <Community />
      <Footer />
      <ScrollToTop />
      <AgenticChatbot />
    </div>
  );
}
