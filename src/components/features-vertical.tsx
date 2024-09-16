"use client";

import * as Accordion from "@radix-ui/react-accordion";
import {
  animate,
  AnimatePresence,
  AnimationPlaybackControls,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type AccordionItemProps = {
  children: React.ReactNode;
  className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={cn("mt-px focus-within:relative focus-within:z-10", className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          "group flex flex-1 cursor-pointer items-center justify-between px-5 text-[15px] leading-none outline-none",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
);
AccordionTrigger.displayName = "AccordionTrigger";
type AccordionContentProps = {
  children: ReactNode;
  className?: string;
} & Accordion.AccordionContentProps;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={cn(
        "overflow-hidden text-[15px] font-medium data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="px-5 py-2">{children}</div>
    </Accordion.Content>
  )
);
AccordionContent.displayName = "AccordionContent";

export type FeaturesDataProps = {
  id: number;
  title: string;
  content: string;
  image?: string;
  video?: string;
  icon?: React.ReactNode;
};

export type FeaturesProps = {
  collapseDelay?: number;
  ltr?: boolean;
  linePosition?: "left" | "right" | "top" | "bottom";
  data: FeaturesDataProps[];
};

export default function Features({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "left",
  data = [],
}: FeaturesProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [direction, setDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const carouselTransitionDuration = 600;
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const progress = useMotionValue(0);
  const progressHeight = useTransform(progress, [0, 100], ["0%", "105%"]);
  const progressWidth = useTransform(progress, [0, 100], ["0%", "105%"]);
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: collapseDelay / 1000,
      ease: "linear",
      repeat: Infinity,
    });

    controlsRef.current = controls;
    return () => controls.stop();
  }, [collapseDelay, controlsRef, progress]);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  // useMotionValueEvent(progress, "change", (latest) => {
  //   console.log("latest", latest);
  //   console.log("progressWidth", progressWidth);
  // });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInView]);

  const [isAnimationCompleting, setIsAnimationCompleting] = useState(false);

  useMotionValueEvent(progress, "change", (latest) => {
    if (latest > 99 && !isAnimationCompleting) {
      setIsAnimationCompleting(true);

      setTimeout(() => {
        controlsRef.current?.complete();
        controlsRef.current?.play();

        setCurrentIndex((prevIndex) =>
          prevIndex !== undefined ? (prevIndex + 1) % data.length : 0
        );

        setTimeout(() => {
          setIsAnimationCompleting(false);
        }, 50);
      }, 0);
    }
  });

  const handleAccordionChange = useCallback(
    (value: string) => {
      if (isTransitioning) return;

      const newIndex = Number(value.split("-")[1]);
      setDirection(newIndex > currentIndex ? 1 : -1);
      setCurrentIndex(newIndex);
      setIsTransitioning(true);
      controlsRef.current?.complete();
      controlsRef.current?.play();

      setTimeout(() => {
        setIsTransitioning(false);
      }, carouselTransitionDuration);
    },
    [currentIndex, isTransitioning]
  );
  // const scrollToIndex = (index: number) => {
  //   if (carouselRef.current) {
  //     const card = carouselRef.current.querySelectorAll(".card")[index];
  //     if (card) {
  //       const cardRect = card.getBoundingClientRect();
  //       const carouselRect = carouselRef.current.getBoundingClientRect();
  //       const offset =
  //         cardRect.left -
  //         carouselRect.left -
  //         (carouselRect.width - cardRect.width) / 2;

  //       carouselRef.current.scrollTo({
  //         left: carouselRef.current.scrollLeft + offset,
  //         behavior: "smooth",
  //       });
  //     }
  //   }
  // };

  // useEffect(() => {
  //   const handleAutoScroll = () => {
  //     const nextIndex =
  //       (currentIndex !== undefined ? currentIndex + 1 : 0) % data.length;
  //     scrollToIndex(nextIndex);
  //   };

  //   const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

  //   return () => clearInterval(autoScrollTimer);
  // }, [currentIndex, collapseDelay, data.length]);

  // useEffect(() => {
  //   const carousel = carouselRef.current;
  //   if (carousel) {
  //     const handleScroll = () => {
  //       const scrollLeft = carousel.scrollLeft;
  //       const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
  //       const newIndex = Math.min(
  //         Math.floor(scrollLeft / cardWidth),
  //         data.length - 1
  //       );
  //       setCurrentIndex(newIndex);
  //     };

  //     carousel.addEventListener("scroll", handleScroll);
  //     return () => carousel.removeEventListener("scroll", handleScroll);
  //   }
  // }, []);

  console.log("currentIndex", currentIndex);
  console.log("direction", direction);

  return (
    <section ref={ref} id="features">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          <div className="mx-auto my-12 h-full grid lg:grid-cols-2 gap-10 items-center">
            <div
              className={` hidden lg:flex order-1 lg:order-[0] ${
                ltr ? "lg:order-2 lg:justify-end" : "justify-start"
              }`}
            >
              <Accordion.Root
                className={isTransitioning ? "pointer-events-none" : ""}
                type="single"
                defaultValue={`item-${currentIndex}`}
                value={`item-${currentIndex}`}
                onValueChange={handleAccordionChange}
              >
                {data.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    className="relative mb-8 last:mb-0"
                    value={`item-${index}`}
                  >
                    {linePosition === "left" || linePosition === "right" ? (
                      <div
                        className={`absolute bottom-0 top-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                          linePosition === "right"
                            ? "left-auto right-0"
                            : "left-0 right-auto"
                        }`}
                      >
                        {currentIndex === index ? (
                          <motion.div
                            initial={{ height: "0%" }}
                            className={`absolute left-0 top-0 w-full origin-top bg-primary transition-all ease-linear dark:bg-white`}
                            style={{
                              height: progressHeight,
                            }}
                          ></motion.div>
                        ) : null}
                      </div>
                    ) : null}

                    {linePosition === "top" || linePosition === "bottom" ? (
                      <div
                        className={`absolute left-0 right-0 w-full h-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                          linePosition === "bottom" ? "-bottom-4" : "-top-4"
                        }`}
                      >
                        {currentIndex === index ? (
                          <motion.div
                            initial={{ width: "0%" }}
                            className={`absolute left-0 ${
                              linePosition === "bottom" ? "bottom-0" : "top-0"
                            } h-full origin-left bg-primary transition-all ease-linear dark:bg-white`}
                            style={{ width: progressWidth }}
                          ></motion.div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex items-center relative">
                      <div className="item-box w-12 h-12 bg-primary/10 rounded-full sm:mx-6 mx-2 shrink-0 flex items-center justify-center">
                        {item.icon}
                      </div>

                      <div>
                        <AccordionTrigger className="text-xl font-bold">
                          {item.title}
                        </AccordionTrigger>

                        <AccordionTrigger className="justify-start text-left leading-4 font-sans text-[16px]">
                          {item.content}
                        </AccordionTrigger>
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`h-[350px] min-h-[200px] relative overflow-hidden rounded-xl w-auto  ${
                ltr && "lg:order-1"
              }`}
            >
              <AnimatePresence mode="popLayout" custom={direction}>
                {data[currentIndex]?.image ? (
                  <motion.img
                    onMouseEnter={() => controlsRef.current?.pause()}
                    onMouseLeave={() => controlsRef.current?.play()}
                    key={currentIndex}
                    src={data[currentIndex].image}
                    alt="feature"
                    className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 object-cover object-left-top p-1 shadow-lg"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={direction}
                    transition={{
                      duration: carouselTransitionDuration / 1000,
                      type: "spring",
                      bounce: 0,
                    }}
                  />
                ) : data[currentIndex]?.video ? (
                  <video
                    preload="auto"
                    src={data[currentIndex].video}
                    className="aspect-auto h-full w-full rounded-lg object-cover shadow-lg"
                    autoPlay
                    loop
                    muted
                  />
                ) : (
                  <div className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1"></div>
                )}
              </AnimatePresence>
            </div>

            {/* <ul
              ref={carouselRef}
              className=" flex h-full snap-x flex-nowrap overflow-x-auto py-10 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden snap-mandatory"
              style={{
                padding: "50px calc(50%)",
              }}
            >
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className="card relative mr-8 grid h-full max-w-60 shrink-0 items-start justify-center py-4 last:mr-0"
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    scrollSnapAlign: "center",
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-auto top-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30">
                    <div
                      className={`absolute left-0 top-0 h-full ${
                        currentIndex === index ? "w-full" : "w-0"
                      } origin-top bg-primary transition-all ease-linear`}
                      style={{
                        transitionDuration:
                          currentIndex === index ? `${collapseDelay}ms` : "0s",
                      }}
                    ></div>
                  </div>
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p className="mx-0 max-w-sm text-balance text-sm">
                    {item.content}
                  </p>
                </div>
              ))}
            </ul> */}
          </div>
        </div>
      </div>
    </section>
  );
}

const variants = {
  initial: (direction: number) => {
    return { y: `${110 * direction}%`, opacity: 0 };
  },
  animate: { y: "0%", opacity: 1, scale: 1 },
  exit: (direction: number) => {
    return { y: `${-110 * direction}%`, opacity: 0 };
  },
};
