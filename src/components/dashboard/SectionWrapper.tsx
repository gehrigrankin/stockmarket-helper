"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  badge?: string;
  defaultCollapsed?: boolean;
}

export function SectionWrapper({
  id,
  title,
  icon,
  children,
  description,
  onRefresh,
  isLoading,
  lastUpdated,
  badge,
  defaultCollapsed = false,
}: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <Card id={id} className="border-border/50">
      <CardHeader className="py-2.5 px-3 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 hover:text-primary transition-colors min-w-0"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <CardTitle className="text-sm font-semibold whitespace-nowrap">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[10px] ml-1 hidden sm:inline-flex">
                {badge}
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            {description && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
              >
                <Info className={cn("h-3 w-3", showInfo ? "text-primary" : "text-muted-foreground")} />
              </Button>
            )}
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("h-3 w-3", isLoading && "animate-spin")}
                />
              </Button>
            )}
          </div>
        </div>
        {showInfo && description && (
          <p className="text-[11px] text-muted-foreground mt-1.5 ml-5 leading-relaxed bg-muted/30 rounded px-2 py-1.5">
            {description}
          </p>
        )}
      </CardHeader>
      {!collapsed && <CardContent className="pt-0 px-3 sm:px-4">{children}</CardContent>}
    </Card>
  );
}
