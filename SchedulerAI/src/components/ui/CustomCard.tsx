import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
  onClick?: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  description,
  className,
  children,
  footer,
  isHoverable = false,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "bg-background border-primary",
        isHoverable &&
          "transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:border-[#001140]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-foreground">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-shade">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
};

export default CustomCard;
