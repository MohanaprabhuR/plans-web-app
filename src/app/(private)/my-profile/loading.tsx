import { ScreenLoading } from "@/components/ui/screen-loading";

export default function MyProfileLoading() {
  return (
    <ScreenLoading
      variant="detail"
      showHeader={false}
      label="Loading profile"
      className="py-4"
    />
  );
}
