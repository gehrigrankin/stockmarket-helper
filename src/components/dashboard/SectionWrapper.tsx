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
  refreshInterval?: number;
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
  onRefresh,
  isLoading,
  lastUpdated,
  badge,
}: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card id={id} className="border-border/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="text-muted-foreground">{icon}</span>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[10px] ml-1">
                {badge}
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
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
      </CardHeader>
      {!collapsed && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
