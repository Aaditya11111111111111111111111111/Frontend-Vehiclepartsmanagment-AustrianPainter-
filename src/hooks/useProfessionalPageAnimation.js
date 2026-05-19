import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function useProfessionalPageAnimation() {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".page-header", {
        y: 20,
        opacity: 0,
        duration: 0.5,
      })
        .from(
          ".stat-card",
          {
            y: 18,
            opacity: 0,
            scale: 0.98,
            duration: 0.45,
            stagger: 0.08,
          },
          "-=0.25"
        )
        .from(
          ".card, .table-wrap",
          {
            y: 16,
            opacity: 0,
            duration: 0.4,
            stagger: 0.06,
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  return containerRef;
}
