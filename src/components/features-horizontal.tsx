"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
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
import clsx from "clsx";

type AccordionItemProps = {
  children: React.ReactNode;
  className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={cn(
        "mt-px focus-within:relative focus-within:z-10",
        className
      )}
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
    <Accordion.Header className="">
      <Accordion.Trigger
        className={cn("", className)}
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
        "data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
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

type CardDataProps = {
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
  data: CardDataProps[];
};

export default function Features({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "left",
  data = [],
}: FeaturesProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [direction, setDirection] = useState<number>(1);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const carouselTransitionDuration = 800;

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, [0, 100], ["0%", "105%"]);
  const progressHeight = useTransform(progress, [0, 100], ["0%", "105%"]);
  // useMotionValueEvent(progress, "change", (latest) => {
  //   console.log("latest", latest);
  //   console.log("progressWidth", progressWidth);
  // });
  // const carouselRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const controls = animate(progress, 100, {
      duration: collapseDelay / 1000,
      ease: "linear",
      repeat: Infinity,
    });

    controlsRef.current = controls;
  }, [collapseDelay]);

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

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
      // console.log("animationComplete");

      // Use setTimeout to ensure this runs after the current call stack is cleared
      setTimeout(() => {
        controlsRef.current?.complete();
        controlsRef.current?.play();

        setCurrentIndex((prevIndex) =>
          prevIndex !== undefined ? (prevIndex + 1) % data.length : 0
        );

        // Reset the flag after a short delay to prepare for the next cycle
        setTimeout(() => {
          setIsAnimationCompleting(false);
        }, 50);
      }, 0);
    }
  });

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex !== undefined ? (prevIndex + 1) % data.length : 0
  //     );
  //   }, collapseDelay);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [currentIndex, data.length, collapseDelay]);

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
  // }, [currentIndex, data.length, collapseDelay]);

  // useEffect(() => {
  //   const carousel = carouselRef.current;
  //   console.log(carousel);
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
  // }, [data.length, collapseDelay]);

  return (
    <section ref={ref} id="features">
      <div className="container">
        <div className="max-w-6xl mx-auto ">
          <div className="">
            <div
              className={`hidden md:flex order-1 md:order-[0]  ${
                ltr ? "md:order-2 md:justify-end" : "justify-start"
              }`}
            >
              <Accordion.Root
                className={clsx("grid md:grid-cols-4 gap-x-10 py-8", {
                  "pointer-events-none": isTransitioning,
                })}
                type="single"
                defaultValue={`item-${currentIndex}`}
                value={`item-${currentIndex}`}
                onValueChange={handleAccordionChange}
              >
                {data.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    className="relative mb-8"
                    value={`item-${index}`}
                  >
                    {linePosition === "left" || linePosition === "right" ? (
                      <div
                        className={`absolute bottom-0 top-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                          linePosition === "right"
                            ? "left-auto -right-4"
                            : "-left-4 right-auto"
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
                          linePosition === "bottom" ? "bottom-0" : "-top-4"
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

                    <AccordionTrigger>
                      <div className="flex items-center relative flex-col">
                        <div className="item-box size-16 bg-primary/10 rounded-full sm:mx-6 mx-2 shrink-0 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div className="font-bold text-xl my-3 ">
                          {item.title}
                        </div>
                        <div className="justify-center text-center mb-4">
                          {item.content}
                        </div>
                      </div>
                    </AccordionTrigger>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`w-auto overflow-hidden relative rounded-lg ${
                ltr && "md:order-1"
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
                    className="aspect-auto h-full w-full object-cover relative border rounded-lg shadow-lg"
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
                    className="aspect-auto h-full w-full rounded-lg object-cover border shadow-lg"
                    autoPlay
                    loop
                    muted
                  />
                ) : (
                  <div className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1 min-h-[600px]"></div>
                )}
              </AnimatePresence>
              <BorderBeam
                size={400}
                duration={12}
                delay={9}
                borderWidth={1.5}
                colorFrom="hsl(var(--primary))"
                colorTo="hsl(var(--primary)/0)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const variants = {
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  animate: { x: "0%", opacity: 1 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};
