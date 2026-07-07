import { ScreenLoading } from "@/components/ui/screen-loading";

export default function MyClaimsLoading() {
  return (
    <ScreenLoading
      variant="summary"
      showHeader={false}
      statCount={4}
      rows={3}
      label="Loading claims"
    />
  );
}
