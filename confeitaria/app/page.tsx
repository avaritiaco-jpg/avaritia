import { Cardapio } from "@/components/cardapio";
import { CartDrawer, FlyLayer, MobileCartBar } from "@/components/cart";
import { Faq } from "@/components/faq";
import { FinalCta, Footer } from "@/components/finale";
import { Hero } from "@/components/hero";
import { HowToOrder } from "@/components/how-to-order";
import { Nav } from "@/components/nav";
import { ProductSheet } from "@/components/product-sheet";
import { Ribbon } from "@/components/ribbon";
import { SizeGuide } from "@/components/size-guide";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ribbon />
        <Cardapio />
        <SizeGuide />
        <HowToOrder />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <ProductSheet />
      <CartDrawer />
      <MobileCartBar />
      <FlyLayer />
    </>
  );
}
