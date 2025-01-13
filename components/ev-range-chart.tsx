"use client";

import { useEffect, useState } from "react";
import { parseCSV } from "@/utils/data-processor";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Loader } from "lucide-react";

const chartConfig = {
  desktop: {
    label: "Average Electric Range",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function EVRangeChart() {
  const [chartData, setChartData] = useState<
    { make: string; avgElectricRange: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await parseCSV("/Electric_Vehicle_Population_Data.csv");

        const makeRangeMap: Record<string, number[]> = {};
        data.forEach((row) => {
          const make = row["Make"];
          const electricRange = parseFloat(row["Electric Range"]);
          if (make && !isNaN(electricRange)) {
            if (!makeRangeMap[make]) {
              makeRangeMap[make] = [];
            }
            makeRangeMap[make].push(electricRange);
          }
        });

        const processedData = Object.entries(makeRangeMap)
          .map(([make, ranges]) => ({
            make,
            avgElectricRange:
              ranges.reduce((sum, range) => sum + range, 0) / ranges.length,
          }))
          .sort((a, b) => b.avgElectricRange - a.avgElectricRange)
          .slice(0, 15);

        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Average Electric Range by Vehicle Make</CardTitle>
        <CardDescription>
          Top 15 Electric Vehicle Manufacturers by Range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full h-[400px] sm:h-[500px] md:h-[600px]"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  left: 60,
                  right: 20,
                  top: 20,
                  bottom: 0, // Increased bottom margin for labels
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="make"
                  height={120} // Increased height for X-axis
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="end"
                        fill="currentColor"
                        className="text-xs"
                        transform="rotate(-65)" // Increased rotation angle
                      >
                        {payload.value}
                      </text>
                    </g>
                  )}
                  interval={0}
                  label={{
                    value: "Vehicle Make",
                    position: "bottom",
                    offset: 100, // Increased offset for label
                    style: { textAnchor: "middle" },
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{
                    value: "Average Electric Range (miles)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -40,
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgElectricRange"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing the average electric range for the top 15 vehicle makes. Tap
          or hover over data points for more details.
        </div>
      </CardFooter>
    </Card>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (active && payload && payload.length > 0) {
    const value = payload[0]?.value ?? 0; // Use a fallback value if undefined
    return (
      <div className="bg-background border border-border rounded p-2 shadow-md">
        <p className="font-bold">{label}</p>
        <p>Average Range: {value.toFixed(2)} miles</p>
      </div>
    );
  }
  return null;
}
