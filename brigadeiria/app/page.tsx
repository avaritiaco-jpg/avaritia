import { AlgoMais } from "@/components/algo-mais";
import { BoxBuilder } from "@/components/box-builder";
import { Finale } from "@/components/finale";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Nav } from "@/components/nav";
import { Processo } from "@/components/processo";
import { Visite } from "@/components/visite";
import { Vitrine } from "@/components/vitrine";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Vitrine />
        <BoxBuilder />
        <Processo />
        <AlgoMais />
        <Visite />
      </main>
      <Finale />
    </>
  );
}
