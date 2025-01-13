"use client";

import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

type EVData = {
  make: string;
  count: number;
  fill: string;
};

const chartConfig = {
  make: {
    label: "Make",
  },
} satisfies ChartConfig;

export function PopularEVChart() {
  const [chartData, setChartData] = useState<EVData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await parseCSV("/Electric_Vehicle_Population_Data.csv");

        // Process the CSV data: Group EV counts by Make
        const makeCounts = data.reduce<Record<string, number>>((acc, row) => {
          const make = row["Make"];
          if (make) {
            acc[make] = (acc[make] || 0) + 1;
          }
          return acc;
        }, {});

        // Convert the grouped data into an array suitable for charting
        const processedData: EVData[] = Object.entries(makeCounts).map(
          ([make, count], index) => ({
            make,
            count,
            fill: `hsl(var(--chart-${(index % 6) + 1}))`, // Assign a unique color
          })
        );

        // Sort by count descending for better visualization and slice top 6
        processedData.sort((a, b) => b.count - a.count);
        setChartData(processedData.slice(0, 6)); // Display top 6 makes
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalEVs = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 text-center">
        <CardTitle>Popular EV Models and Makes</CardTitle>
        <CardDescription>Top 6 EV Makes by Count</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="make"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalEVs.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            EVs
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col text-center gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Displaying the top 6 EV makes by total count.
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the most popular EV makes in the top 6 categories
        </div>
      </CardFooter>
    </Card>
  );
}
