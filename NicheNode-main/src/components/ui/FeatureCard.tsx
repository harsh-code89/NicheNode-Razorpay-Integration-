import React from "react";
import { cn } from "@/lib/utils";

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow",
      className
    )}
    {...props}
  />
));
FeatureCard.displayName = "FeatureCard";

const FeatureCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
FeatureCardHeader.displayName = "FeatureCardHeader";

const FeatureCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
FeatureCardTitle.displayName = "FeatureCardTitle";

const FeatureCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FeatureCardDescription.displayName = "FeatureCardDescription";

const FeatureCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
FeatureCardContent.displayName = "FeatureCardContent";

export {
  FeatureCard,
  FeatureCardHeader,
  FeatureCardTitle,
  FeatureCardDescription,
  FeatureCardContent,
};
