import { Avisos } from "@/components/avisos";
import { Contato } from "@/components/contato";
import { Doces } from "@/components/doces";
import { Encomendas } from "@/components/encomendas";
import { Galeria } from "@/components/galeria";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Avisos />
        <Doces />
        <Encomendas />
        <Galeria />
        <Contato />
      </main>
    </>
  );
}
