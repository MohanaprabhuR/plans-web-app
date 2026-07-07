import { ScreenLoading } from "@/components/ui/screen-loading";

export default function CoverageLoading() {
  return (
    <ScreenLoading
      variant="detail"
      showHeader={false}
      label="Loading coverage"
      className="py-4"
    />
  );
}
