"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { parseCSV } from "@/utils/data-processor";
import { Loader } from "lucide-react";

// The structure for the chart data after processing
type EVData = {
  type: string;
  count: number;
  fill: string;
};

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
};

export function EVTypeChart() {
  const [chartData, setChartData] = useState<EVData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Parse the CSV file
        const data = await parseCSV("/Electric_Vehicle_Population_Data.csv");

        // Process the CSV data: Group EV counts by Electric Vehicle Type
        const typeCounts = data.reduce<Record<string, number>>((acc, row) => {
          const evType = row["Electric Vehicle Type"];
          if (evType) {
            acc[evType] = (acc[evType] || 0) + 1;
          }
          return acc;
        }, {});

        // Convert the grouped data into an array suitable for charting
        const processedData = Object.entries(typeCounts).map(
          ([type, count], index) => ({
            type,
            count,
            fill: `hsl(var(--chart-${(index % 6) + 1}))`, // Assign a unique color
          })
        );
        // Update state with the processed data
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Electric Vehicle Type Breakdown</CardTitle>
        <CardDescription>Breakdown of EV Types by Count</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <Pie
                  maxRadius={30}
                  data={chartData}
                  dataKey="count"
                  nameKey="type"
                  outerRadius={100}
                  // Add labels for the pie chart slices
                  //   label={({ name, value }) => `${name}: ${value}`}
                />
              </PieChart>
            </ChartContainer>
          </>
        )}
        <div className="flex flex-wrap mb-4">
          {chartData.map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div
                style={{ backgroundColor: item.fill }}
                className="w-4 h-4 rounded-full"
              ></div>
              <span>{item.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
