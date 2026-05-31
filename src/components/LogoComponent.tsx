/**
 * LogoComponent - Responsive logo placeholder for the application
 * Used in: Navbar, Login page, Footer
 * Features: Responsive sizing, gradient background, SVG placeholder
 */

export interface LogoComponentProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function LogoComponent({ size = "md", showText = false, className = "" }: LogoComponentProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Container with Gradient Background */}
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-lg bg-gradient-hero shadow-soft`}>
        {/* SVG Logo Placeholder */}
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full p-2 text-primary-foreground"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple investment/growth icon: upward trending chart */}
          <path d="M 20 70 L 35 55 L 50 65 L 70 30 M 70 30 L 75 30 L 75 35" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Alternative: Simple shield with upward arrow - represents security and growth */}
          {/* <path d="M 50 15 L 30 25 L 30 50 Q 50 70 50 70 Q 70 70 70 50 L 70 25 Z" fill="currentColor" opacity="0.8" />
          <path d="M 50 40 L 50 65" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M 45 55 L 50 65 L 55 55" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /> */}
        </svg>
      </div>

      {/* Brand Text (Optional) */}
      {showText && (
        <div className="hidden sm:block">
          <div className={`font-display ${textSizeClasses[size]} font-bold text-foreground`}>
            Amana Invest
          </div>
          <div className="text-xs font-medium tracking-wide text-muted-foreground">
            الاستثمار الآمن
          </div>
        </div>
      )}
    </div>
  );
}
