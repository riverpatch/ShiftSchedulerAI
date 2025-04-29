import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', size = 'default', children, isLoading, icon, ...props }, ref) => {
    const variantClasses = {
      'primary': 'bg-scheduler-primary text-white hover:bg-scheduler-secondary',
      'secondary': 'bg-scheduler-secondary text-white hover:bg-scheduler-tertiary',
      'success': 'bg-scheduler-success text-white hover:bg-green-600',
      'warning': 'bg-scheduler-warning text-white hover:bg-orange-600',
      'destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive',
    };

    return (
      <Button
        className={cn(
          variant !== 'default' && variant in variantClasses ? variantClasses[variant as keyof typeof variantClasses] : '',
          isLoading && 'opacity-70 pointer-events-none',
          props.disabled && '!opacity-100',
          className
        )}
        variant={variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'warning' ? 'default' : variant}
        size={size}
        disabled={isLoading || props.disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && icon && <span className="mr-2">{icon}</span>}
        {children}
      </Button>
    );
  }
);

CustomButton.displayName = 'CustomButton';

export default CustomButton;
