"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { WhatsappLogo } from "@phosphor-icons/react";
import { whatsappLink } from "@/lib/site";

// Atalho para o WhatsApp: aparece depois que o visitante passa do topo.
export function WhatsAppFab() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => {
    const end = document.documentElement.scrollHeight - window.innerHeight;
    setShow(v > 640 && v < end - 320);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar com a Avaritia no WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-gold text-ink shadow-[0_18px_40px_-12px_rgb(233_180_76/0.45)] md:bottom-8 md:right-8 md:size-16"
        >
          <WhatsappLogo size={30} weight="fill" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
