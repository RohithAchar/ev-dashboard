"use client";

import { Loader, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { parseCSV } from "@/utils/data-processor";

const chartConfig = {
  desktop: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function EvTrendChart() {
  const [chartData, setChartData] = useState<
    { modelYear: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const data = await parseCSV("/Electric_Vehicle_Population_Data.csv");

        const yearCounts: Record<string, number> = {};
        data.forEach((row) => {
          const modelYear = row["Model Year"];
          if (modelYear) {
            yearCounts[modelYear] = (yearCounts[modelYear] || 0) + 1;
          }
        });

        const processedData = Object.entries(yearCounts).map(
          ([year, count]) => ({
            modelYear: year,
            count: count,
          })
        );

        setChartData(processedData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const latestYear = 2024;
  const previousYear = 2023;
  const latestCount = 2086;
  const previousCount = 16791;
  const percentageChange =
    ((latestCount - previousCount) / previousCount) * 100;
  const isTrendingUp = percentageChange > 0;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>EV Adoption Trends Over Time</CardTitle>
        <CardDescription>
          Shows how EV adoption is growing over the years
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="modelYear"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tickFormatter={(value) => value.slice(0, 4)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="count"
                  type="natural"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {isTrendingUp ? (
            <>
              Trending up by {percentageChange.toFixed(2)}% this year{" "}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(percentageChange).toFixed(2)}% this
              year <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total EV registrations for {previousYear} and {latestYear}
        </div>
      </CardFooter>
    </Card>
  );
}
