import type { Metadata } from "next";
import { CartDrawer } from "@/components/cart";
import { Checkout } from "@/components/checkout";
import { Footer } from "@/components/finale";
import { Nav } from "@/components/nav";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Finalizar encomenda · ${site.fullName}`,
  description: "Confira o pedido, escolha a data de retirada e pague o sinal por Pix, PicPay ou dinheiro.",
  alternates: { canonical: "/pagamento/" },
  robots: { index: false, follow: true },
};

export default function Pagamento() {
  return (
    <>
      <Nav home={false} />
      <main>
        <Checkout />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
