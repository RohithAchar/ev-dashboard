import { EvGeoChart } from "@/components/ev-geo-chart";
import { EVRangeChart } from "@/components/ev-range-chart";
import { EvTrendChart } from "@/components/ev-trend-chart";
import { EVTypeChart } from "@/components/ev-type-chart";
import { PopularEVChart } from "@/components/popular-ev-chart";

export default function Home() {
  return (
    <div className="space-y-4 w-full md:max-w-screen-xl mx-auto py-10 px-6">
      <h1 className="text-center text-4xl font-bold">
        Electric Vehicles Dashboard
      </h1>
      <EvTrendChart />
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        <EvGeoChart />
        <PopularEVChart />
        <EVTypeChart />
      </div>
      <EVRangeChart />
    </div>
  );
}
