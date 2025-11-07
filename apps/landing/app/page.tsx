import Header from "../components/Header";
import Hero from "../components/Hero";
import ShariahCompliance from "../components/ShariahCompliance";
import Features from "../components/Features";
import EcosystemOverview from "../components/EcosystemOverview";
import NetworkStats from "../components/NetworkStats";
import FinancialProducts from "../components/FinancialProducts";
import GovernanceCompliance from "../components/GovernanceCompliance";
import CharityImpact from "../components/CharityImpact";
import TechnologyStack from "../components/TechnologyStack";
import Roadmap from "../components/Roadmap";
import FAQ from "../components/FAQ";
import Community from "../components/Community";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <Hero />
        <ShariahCompliance />
        <Features />
        <EcosystemOverview />
        <NetworkStats />
        <FinancialProducts />
        <GovernanceCompliance />
        <CharityImpact />
        <TechnologyStack />
        <Roadmap />
        <FAQ />
        <Community />
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}
