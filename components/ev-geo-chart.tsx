"use client";

import { useEffect, useState } from "react";
import { Loader, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";

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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { parseCSV } from "@/utils/data-processor";

type GeoData = {
  region: string;
  count: number;
};

const chartConfig = {
  desktop: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function EvGeoChart() {
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await parseCSV("/Electric_Vehicle_Population_Data.csv");

        // Process the CSV data: Group EV counts by City
        const regionCounts = data.reduce<Record<string, number>>((acc, row) => {
          const city = row["City"];
          if (city) {
            acc[city] = (acc[city] || 0) + 1;
          }
          return acc;
        }, {});

        // Convert the grouped data into an array suitable for charting
        const processedData: GeoData[] = Object.entries(regionCounts).map(
          ([region, count]) => ({
            region,
            count,
          })
        );

        // Sort by count descending for better visualization
        processedData.sort((a, b) => b.count - a.count);

        // Set top 6 cities
        console.log(processedData);
        setGeoData(processedData.slice(0, 6));
      } catch (error) {
        console.error("Error fetching or processing data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">EV Distribution by City</CardTitle>
        <CardDescription className="text-center">
          Top 6 Cities by EV Population
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            {/* Use ResponsiveContainer for responsive chart rendering */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={geoData}
                layout="vertical"
                margin={{ left: 10, top: 20 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="region"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value} // Display full city names
                >
                  <Label value="City" position="left" offset={0} />
                </YAxis>
                <Tooltip content={<ChartTooltipContent />} cursor={false} />
                {/* Increase the bar width by setting barSize */}
                <Bar
                  dataKey="count"
                  fill="var(--color-desktop)"
                  radius={5}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-sm mt-auto">
        <div className="flex items-center justify-center gap-2 font-medium leading-none">
          <TrendingUp className="h-6 w-6" />
          <span>5.2% increase this month</span>
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total EV population in the top 6 cities
        </div>
      </CardFooter>
    </Card>
  );
}
