import React from 'react';
import { ExternalLink, DivideIcon as LucideIcon } from 'lucide-react';

interface ExternalLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  showExternalIcon?: boolean;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function ExternalLinkButton({
  href,
  children,
  className = '',
  icon: Icon,
  showExternalIcon = true,
  ariaLabel,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}: ExternalLinkButtonProps) {
  // Validate URL for security
  const isValidUrl = (url: string): boolean => {
    try {
      const validUrl = new URL(url);
      return ['https:', 'http:'].includes(validUrl.protocol);
    } catch {
      return false;
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent';
      case 'secondary':
        return 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 border-transparent';
      case 'outline':
        return 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500';
      case 'ghost':
        return 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 focus:ring-slate-500';
      case 'link':
        return 'bg-transparent text-blue-600 border-transparent hover:text-blue-700 focus:ring-blue-500 underline';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent';
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-6 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Validate URL before opening
    if (!isValidUrl(href)) {
      event.preventDefault();
      console.error('Invalid URL:', href);
      alert('Invalid link. Please contact support if this issue persists.');
      return;
    }

    // Call custom onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  // Don't render if URL is invalid
  if (!isValidUrl(href)) {
    return (
      <button
        disabled
        className={`
          inline-flex items-center justify-center space-x-2 rounded-lg border font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200
          ${getSizeStyles()}
          ${className}
        `}
        aria-label="Invalid link"
      >
        <span>Invalid Link</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center space-x-2 rounded-lg border font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${disabled 
          ? 'opacity-50 cursor-not-allowed pointer-events-none' 
          : 'cursor-pointer hover:shadow-md active:scale-95'
        }
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      aria-label={ariaLabel || `${children} (opens in new tab)`}
      role="button"
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
      {showExternalIcon && <ExternalLink className="w-4 h-4" />}
    </a>
  );
}

// Specialized components for common use cases
export function ExternalDocumentationButton({ href, children, ...props }: Omit<ExternalLinkButtonProps, 'variant' | 'showExternalIcon'>) {
  return (
    <ExternalLinkButton
      href={href}
      variant="outline"
      showExternalIcon={true}
      {...props}
    >
      {children}
    </ExternalLinkButton>
  );
}

export function ExternalSocialButton({ href, children, icon, ...props }: Omit<ExternalLinkButtonProps, 'variant' | 'showExternalIcon'>) {
  return (
    <ExternalLinkButton
      href={href}
      variant="ghost"
      showExternalIcon={false}
      icon={icon}
      {...props}
    >
      {children}
    </ExternalLinkButton>
  );
}

export function ExternalHelpButton({ href, children, ...props }: Omit<ExternalLinkButtonProps, 'variant'>) {
  return (
    <ExternalLinkButton
      href={href}
      variant="secondary"
      {...props}
    >
      {children}
    </ExternalLinkButton>
  );
}