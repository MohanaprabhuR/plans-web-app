import { ScreenLoading } from "@/components/ui/screen-loading";

export default function DashboardLoading() {
  return (
    <ScreenLoading
      variant="cards-row"
      rows={4}
      label="Loading dashboard"
      className="py-2"
    />
  );
}
