"use client";

import React, { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { Copy, Check } from "lucide-react";

// Floating Damage Text Component
type FloatingDamageItem = {
  id: string;
  text: string;
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  rotate: number;
};

type FloatingDamageSpawn = {
  text: string;
  left?: number;
  top?: number;
};

const FloatingDamage: React.FC<{ item: FloatingDamageItem; onComplete: () => void }> = ({ item, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className="fixed pointer-events-none z-[9999] font-bold text-white whitespace-nowrap"
      style={{
        left: item.left,
        top: item.top,
        transform: "translate(-50%, -50%)",
        textShadow: "0 0 7px rgba(0,0,0,0.4), 1.5px 1.5px 0px rgba(0,0,0,0.65)",
        fontSize: "clamp(0.8rem, 2.4vw, 1.15rem)",
        WebkitTextStroke: "1px rgba(255,255,255,0.1)",
      }}
    >
      <span 
        className="animate-damage inline-block"
        style={{
          animationDelay: "0ms",
          ["--drift-x" as any]: `${item.driftX}px`,
          ["--drift-y" as any]: `${item.driftY}px`,
          ["--drift-rotate" as any]: `${item.rotate}deg`,
        }}
      >
        {item.text}
      </span>
    </div>
  );
};

// Types
interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
}

interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

// Glass Effect Wrapper Component
const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
}) => {
  const glassStyle = {
    boxShadow: "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  const content = (
    <div
      className={`relative flex font-semibold overflow-hidden text-black cursor-pointer transition-all duration-700 ${className}`}
      style={glassStyle}
    >
      {/* Glass Layers */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{
          backdropFilter: "blur(3px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-[inherit]"
        style={{ background: "rgba(255, 255, 255, 0.25)" }}
      />
      <div
        className="absolute inset-0 z-20 rounded-[inherit] overflow-hidden"
        style={{
          boxShadow:
            "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)",
        }}
      />

      {/* Content */}
      <div className="relative z-30">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

const glassToastStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  backdropFilter: "blur(18px)",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
};

const useIsTouchLike = () => {
  const [isTouchLike, setIsTouchLike] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchLike(mediaQuery.matches);

    update();
    mediaQuery.addEventListener?.("change", update);

    return () => mediaQuery.removeEventListener?.("change", update);
  }, []);

  return isTouchLike;
};

// Dock Component
const GlassDock: React.FC<{ icons: DockIcon[]; href?: string }> = ({
  icons,
  href,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isTouchLike = useIsTouchLike();
  const dockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isTouchLike) return;

    const clear = (event: PointerEvent) => {
      if (dockRef.current && event.target instanceof Node && dockRef.current.contains(event.target)) {
        return;
      }

      setActiveIndex(null);
    };

    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [isTouchLike]);

  const visibleIndex = isTouchLike ? activeIndex : hoveredIndex;
  const isExpanded = isTouchLike ? activeIndex !== null : hoveredIndex !== null;

  const handleIconPress = (event: React.MouseEvent, index: number, action?: () => void) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const spawnAnchor = {
      left: rect.left + rect.width / 2 - 32 + (Math.random() * 8 - 4),
      top: rect.top + 2 + (Math.random() * 4 - 2),
    };

    if (!isTouchLike) {
      action?.();
      return;
    }

    if (activeIndex === index) {
      action?.();
      return;
    }

    setActiveIndex(index);
    const event1 = new CustomEvent<FloatingDamageSpawn>("spawn-damage", {
      detail: { text: "Tap again", ...spawnAnchor },
    });
    window.dispatchEvent(event1);
  };

  return (
    <div ref={dockRef} className="relative flex flex-col items-center">
      <div 
        className="mb-8 absolute -top-10 flex items-end justify-center transition-all duration-300 pointer-events-none"
        style={{ opacity: isExpanded ? 1 : 0, transform: isExpanded ? "translateY(0)" : "translateY(4px)" }}
      >
        <span
          className="text-white text-sm font-medium tracking-wide whitespace-nowrap select-none"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.35)",
          }}
        >
          {visibleIndex !== null ? icons[visibleIndex].alt : ""}
        </span>
      </div>
      <GlassEffect
        href={href}
        className={`rounded-3xl p-2.5 transition-all duration-700 ${isTouchLike ? (activeIndex !== null ? "p-3.5 rounded-4xl" : "") : "hover:p-3.5 hover:rounded-4xl"}`}
      >
        <div className={`flex items-center justify-center gap-1.5 rounded-3xl p-2.5 py-0 px-1 overflow-hidden transition-all duration-700 ${isTouchLike && activeIndex !== null ? "gap-2" : ""}`}>
          {icons.map((icon, index) => (
            <div 
              key={index}
              className="relative p-0.5"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(event) => handleIconPress(event, index, icon.onClick)}
            >
              <img
                src={icon.src}
                alt={icon.alt}
                className={`w-11 h-11 sm:w-14 sm:h-14 object-contain shrink-0 p-1 transition-all duration-700 hover:scale-110 cursor-pointer ${isTouchLike && activeIndex === index ? "scale-110" : ""} ${icon.className || ""}`}
                style={{
                  transformOrigin: "center center",
                  transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
                  ...icon.style
                }}
              />
            </div>
          ))}
        </div>
      </GlassEffect>
    </div>
  );
};

// Button Component
const GlassButton: React.FC<{ children: React.ReactNode; href?: string; className?: string }> = ({
  children,
  href,
  className = "",
}) => (
  <GlassEffect
    href={href}
    className={`rounded-3xl px-8 py-4 hover:px-9 hover:py-5 hover:rounded-4xl overflow-hidden ${className}`}
  >
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
      }}
    >
      {children}
    </div>
  </GlassEffect>
);

// SVG Filter Component
const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
// Main Component
export const Component = () => {
  const [emailPressed, setEmailPressed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingDamageItem[]>([]);
  const isTouchLike = useIsTouchLike();
  const emailRef = useRef<HTMLDivElement | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnDamage = (text: string, anchor?: { left: number; top: number }) => {
    const id = Math.random().toString(36).substring(7);
      const driftX = (Math.random() - 0.5) * 32;
      const driftY = -20 - Math.random() * 14;
      const rotate = (Math.random() - 0.5) * 6;

    setFloatingTexts((prev) => [
      ...prev,
      {
        id,
        text,
        left: anchor?.left ?? window.innerWidth * (0.4 + Math.random() * 0.2),
        top: anchor?.top ?? window.innerHeight * 0.5,
        driftX,
        driftY,
        rotate,
      },
    ]);
  };

  const removeDamage = (id: string) => {
    setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!isTouchLike) return;

    const clear = (event: PointerEvent) => {
      if (emailRef.current && event.target instanceof Node && emailRef.current.contains(event.target)) {
        return;
      }

      setEmailPressed(false);
    };

    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [isTouchLike]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleSpawn = (e: Event) => {
      const custom = e as CustomEvent<FloatingDamageSpawn>;
      spawnDamage(custom.detail.text, custom.detail.left !== undefined && custom.detail.top !== undefined ? { left: custom.detail.left, top: custom.detail.top } : undefined);
    };

    window.addEventListener("spawn-damage", handleSpawn as EventListener);
    return () => window.removeEventListener("spawn-damage", handleSpawn as EventListener);
  }, []);

  const dockIcons: DockIcon[] = [
    {
      src: "/icons/claude.png",
      alt: "carthagea.itch.io",
      onClick: () => window.open("https://carthagea.itch.io/", "_blank"),
    },
    {
      src: "/icons/linkedin-v2.png",
      alt: "Ahmed Ben Abdallah",
      onClick: () => window.open("https://www.linkedin.com/in/ahmed-ben-abdallah-dev/", "_blank"),
    },
    {
      src: "/icons/chatgpt.png",
      alt: "@carthageadev",
      onClick: () => window.open("https://x.com/carthageadev", "_blank"),
    },
    {
      src: "/icons/maps.png",
      alt: "Maps",
      onClick: () => window.open("https://maps.apple.com/place?auid=9826624420830457525", "_blank"),
    },
    {
      src: "/icons/reddit.png",
      alt: "u/CarthageaDev",
      onClick: () => window.open("https://www.reddit.com/user/CarthageaDev/", "_blank"),
    },
    {
      src: "/icons/github.png",
      alt: "GitHub",
      onClick: () => window.open("https://github.com/Ahmedd-dot-me", "_blank"),
    },
    // Steam icon — kept for future use
    // {
    //   src: "/icons/steam.png",
    //   alt: "id/carthageadev",
    //   onClick: () => window.open("https://steamcommunity.com/id/carthageadev/", "_blank"),
    // },
  ];

  return (
    <div className="min-h-screen h-full flex items-center justify-center font-light relative overflow-hidden w-full bg-black">
      {floatingTexts.map((t) => (
        <FloatingDamage key={t.id} item={t} onComplete={() => removeDamage(t.id)} />
      ))}
      <Toaster position="top-center" richColors />

      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-1000"
          poster="/videos/sunlight-grass-poster-small.jpg"
        >
          <source src="/videos/sunlight-grass-preview.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <GlassFilter />

      <div className="relative z-10 flex flex-col gap-6 items-center justify-center w-full">
        <GlassDock icons={dockIcons} href="https://x.com/carthageadev" />

        <div
          ref={emailRef}
          onClick={(event) => {
            event.stopPropagation();

            const rect = emailRef.current?.getBoundingClientRect();
            const anchor = rect
              ? { left: rect.left + rect.width / 2, top: rect.top - 8 }
              : undefined;

            if (isTouchLike && !emailPressed) {
              setEmailPressed(true);
              spawnDamage("Tap again", anchor);
              return;
            }

            navigator.clipboard.writeText("AhmedDev@email.com");
            setEmailPressed(false);
            spawnDamage("Copied", anchor);

            // Subtle icon swap feedback — clear previous timeout to avoid flicker on spam
            if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
            setCopied(true);
            copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1200);
          }}
        >
          <GlassButton className={`px-6 py-3 transition-all duration-700 ${isTouchLike && emailPressed ? "px-7 py-4 rounded-4xl" : ""}`}>
            <div className="text-lg text-white flex items-center gap-3">
              <p>AhmedDev@email.com</p>
              {copied ? (
                <Check size={16} className="opacity-80 transition-opacity duration-300" />
              ) : (
                <Copy size={16} className="opacity-60" />
              )}
            </div>
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
