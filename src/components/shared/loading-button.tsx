import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, LucideIcon } from "lucide-react";

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
}

/**
 * LoadingButton:
 * Reusable action button that seamlessly toggles spinner animation,
 * disables interaction during async operations, and renders domain icons.
 */
export function LoadingButton({
  isLoading = false,
  loadingText,
  icon: Icon,
  iconClassName = "w-4 h-4 mr-2",
  children,
  disabled,
  ...props
}: Readonly<LoadingButtonProps>) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        Icon && <Icon className={iconClassName} />
      )}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
