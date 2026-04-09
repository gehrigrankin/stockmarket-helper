"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
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
}: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card id={id} className="border-border/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 hover:text-primary transition-colors min-w-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" />
            )}
            <span className="text-muted-foreground shrink-0">{icon}</span>
            <CardTitle className="text-sm font-semibold whitespace-nowrap">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[10px] ml-1 hidden sm:inline-flex">
                {badge}
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
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
        {description && !collapsed && (
          <p className="text-[11px] text-muted-foreground mt-1 ml-6 leading-relaxed">
            {description}
          </p>
        )}
      </CardHeader>
      {!collapsed && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
