import { BrandMarquee } from "@/components/brand-marquee";
import { CartDrawer, FlyLayer, MobileBagBar } from "@/components/cart";
import { Catalog } from "@/components/catalog";
import { Collections } from "@/components/collections";
import { ConcentrationGuide } from "@/components/concentration-guide";
import { Faq } from "@/components/faq";
import { FinalCta, Footer } from "@/components/finale";
import { Hero } from "@/components/hero";
import { HowToBuy } from "@/components/how-to-buy";
import { Intro } from "@/components/intro";
import { Nav } from "@/components/nav";
import { QuickView } from "@/components/quick-view";
import { Showcase } from "@/components/showcase";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main>
        <Hero />
        <BrandMarquee />
        <Showcase />
        <Collections />
        <ConcentrationGuide />
        <Catalog />
        <HowToBuy />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <QuickView />
      <CartDrawer />
      <MobileBagBar />
      <FlyLayer />
    </>
  );
}
