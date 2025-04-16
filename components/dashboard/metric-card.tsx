import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  valueLabel?: string;
  valueColor?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  description?: string;
  additionalInfo?: string;
  showTrend?: boolean;
  invertTrend?: boolean;
}

export default function MetricCard({
  title,
  value,
  valueLabel,
  valueColor,
  icon,
  trend = 0,
  trendLabel,
  description,
  additionalInfo,
  showTrend = true,
  invertTrend = false,
}: MetricCardProps) {
  // If invertTrend is true, negative trends are good (e.g., for expenses)
  const isPositiveTrend = invertTrend ? trend <= 0 : trend >= 0;
  const trendColor = isPositiveTrend ? "text-green-500" : "text-red-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={
            showTrend && isPositiveTrend
              ? "text-green-500"
              : showTrend
              ? "text-red-500"
              : "text-muted-foreground"
          }
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor || ""}`}>
          {value}
          {valueLabel && <span className="text-sm ml-1">{valueLabel}</span>}
        </div>

        {showTrend && trend !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositiveTrend ? (
              invertTrend ? (
                <ArrowDownRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              )
            ) : invertTrend ? (
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={trendColor}>{Math.abs(trend).toFixed(1)}%</span>
            {trendLabel && <span className="ml-1">{trendLabel}</span>}
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {additionalInfo && (
          <div className="mt-2 text-xs text-muted-foreground">
            {additionalInfo}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
