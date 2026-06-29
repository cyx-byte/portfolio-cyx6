"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookFlipImageProps {
  currentSrc: string;
  nextSrc?: string;
  prevSrc?: string;
  direction: "forward" | "backward" | null;
  onFlipEnd: () => void;
}

/**
 * Page-turn animation:
 * - Rotation axis fixed at image center (book spine).
 * - Rotates about 60° — enough to feel the page lift, not a full flip.
 * - Gradient overlays simulate a curved page surface.
 * - Underneath: the incoming image, revealed as the page lifts away.
 */
export function BookFlipImage({ currentSrc, nextSrc, prevSrc, direction, onFlipEnd }: BookFlipImageProps) {
  const [flipping, setFlipping] = useState(false);

  const triggerFlip = useCallback(() => {
    if (!direction || flipping) return;
    const src = direction === "forward" ? nextSrc : prevSrc;
    if (!src) { onFlipEnd(); return; }
    setFlipping(true);
  }, [direction, flipping, nextSrc, prevSrc, onFlipEnd]);

  useEffect(() => {
    if (direction) triggerFlip();
  }, [direction, triggerFlip]);

  function handleComplete() {
    setFlipping(false);
    onFlipEnd();
  }

  const show = flipping && direction;

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ perspective: "700px", perspectiveOrigin: "center" }}
    >
      {/* Underneath: incoming image, fades in as the page lifts away */}
      <AnimatePresence>
        {show && (
          <motion.div
            key="under"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {direction === "forward" && nextSrc ? (
              <img src={nextSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />
            ) : direction === "backward" && prevSrc ? (
              <img src={prevSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left half — always stays (static part of the spread) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
        {currentSrc && <img src={currentSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
      </div>

      {/* Right half — the "page" that turns */}
      <AnimatePresence>
        {show && direction === "forward" ? (
          <motion.div
            key="page-fwd"
            className="absolute inset-y-0 w-1/2 overflow-hidden"
            style={{
              left: "50%",  // panel sits at right half, left edge = image center
              transformOrigin: "left center",
            }}
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: -65, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.33, 0, 0.1, 1] }}
            onAnimationComplete={handleComplete}
          >
            {/* Curvature shadow: spine-dark → mid-light → edge-dark */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to right,
                    rgba(0,0,0,0.18) 0%,
                    transparent 20%,
                    transparent 75%,
                    rgba(0,0,0,0.08) 100%
                  )
                `,
              }}
            />
            {/* Right half of current image */}
            <div className="absolute inset-y-0 right-0 w-[200%]">
              <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
                {currentSrc && <img src={currentSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
              </div>
            </div>
            {/* Back face: left half of next (shown after rotation) */}
            <div
              className="absolute inset-y-0 right-0 w-[200%]"
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                {nextSrc && <img src={nextSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
              </div>
            </div>
          </motion.div>
        ) : show && direction === "backward" ? (
          <motion.div
            key="page-bwd"
            className="absolute inset-y-0 w-1/2 overflow-hidden"
            style={{
              left: "0%",  // panel sits at left half, right edge = image center
              transformOrigin: "right center",
            }}
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: 65, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.33, 0, 0.1, 1] }}
            onAnimationComplete={handleComplete}
          >
            {/* Curvature shadow */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to left,
                    rgba(0,0,0,0.18) 0%,
                    transparent 20%,
                    transparent 75%,
                    rgba(0,0,0,0.08) 100%
                  )
                `,
              }}
            />
            {/* Left half of current image */}
            <div className="absolute inset-y-0 left-0 w-[200%]">
              <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                {currentSrc && <img src={currentSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
              </div>
            </div>
            {/* Back face: right half of prev */}
            <div
              className="absolute inset-y-0 left-0 w-[200%]"
              style={{ transform: "rotateY(-180deg)", backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
                {prevSrc && <img src={prevSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Static right half (when not flipping) */}
      {!show && (
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
          {currentSrc && <img src={currentSrc} alt="" className="absolute inset-0 w-full h-full object-contain" />}
        </div>
      )}
    </div>
  );
}
