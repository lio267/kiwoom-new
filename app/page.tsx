import dynamic from "next/dynamic";

const ChartDashboard = dynamic(
  () => import("@/components/dashboard/ChartDashboard"),
  {
    ssr: false
  }
);

export default function HomePage() {
  return <ChartDashboard />;
}
