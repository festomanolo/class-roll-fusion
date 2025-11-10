import { cn } from "@/lib/utils";
import React from "react";

interface SettingsGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-sm border border-border/50 rounded-[22px] overflow-hidden my-4",
      className
    )}>
      {children}
    </div>
  );
}

interface SettingsItemProps {
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  showDivider?: boolean;
  className?: string;
}

export function SettingsItem({ 
  icon, 
  label, 
  value, 
  onClick, 
  showDivider = true,
  className 
}: SettingsItemProps) {
  return (
    <>
      <div 
        className={cn(
          "flex items-center px-4 py-3.5 gap-3 transition-colors",
          onClick && "cursor-pointer active:bg-muted/50",
          className
        )}
        onClick={onClick}
      >
        {icon && (
          <div className="w-6 h-6 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <span className="flex-1 text-sm">{label}</span>
        {value && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {value}
          </div>
        )}
      </div>
      {showDivider && (
        <div className="h-[1px] bg-border/50 ml-[3.25rem] mr-4 last:hidden" />
      )}
    </>
  );
}
