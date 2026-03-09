import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Gift, CreditCard, Sparkles, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { TierBenefitSlide } from "@/components/TierBenefitSlide";
import { cn } from "@/lib/utils";

const slides = [
  {
    type: "feature" as const,
    icon: Sparkles,
    title: "Welcome to Axis",
    description:
      "Your premium loyalty experience. Earn points on every purchase and unlock exclusive rewards.",
    gradient: "from-primary to-primary-glow",
    iconColor: "text-white",
  },
  {
    type: "feature" as const,
    icon: CreditCard,
    title: "Link Your Cards",
    description:
      "Connect your payment cards to automatically earn points whenever you shop at partner stores.",
    gradient: "from-emerald-500 to-teal-600",
    iconColor: "text-white",
  },
  {
    type: "feature" as const,
    icon: Gift,
    title: "Redeem Rewards",
    description:
      "Browse our curated catalog of luxury rewards from travel to shopping and experiences.",
    gradient: "from-rose-500 to-pink-600",
    iconColor: "text-white",
  },
  {
    type: "tiers" as const,
    icon: Trophy,
    title: "Membership Tiers",
    description: "",
    gradient: "from-gold to-amber-600",
    iconColor: "text-white",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleNext = () => {
    if (selectedIndex === slides.length - 1) {
      // Mark onboarding as complete and navigate to home
      localStorage.setItem("onboarding_complete", "true");
      navigate("/");
    } else {
      scrollTo(selectedIndex + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true");
    navigate("/");
  };

  const isLastSlide = selectedIndex === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 flex items-center justify-center"
            >
              {slide.type === "tiers" ? (
                <TierBenefitSlide isActive={selectedIndex === index} />
              ) : (
                <OnboardingSlide
                  icon={slide.icon}
                  title={slide.title}
                  description={slide.description}
                  gradient={slide.gradient}
                  iconColor={slide.iconColor}
                  isActive={selectedIndex === index}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 pb-12 pt-4">
        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleNext}
          className={cn(
            "w-full h-14 rounded-2xl text-base font-semibold",
            "bg-gradient-to-r from-primary to-primary-glow",
            "hover:opacity-90 transition-all duration-300",
            "shadow-lg shadow-primary/25"
          )}
        >
          {isLastSlide ? (
            <>
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
