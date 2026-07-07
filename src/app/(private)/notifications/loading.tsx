import { ScreenLoading } from "@/components/ui/screen-loading";

export default function NotificationsLoading() {
  return (
    <ScreenLoading
      variant="list"
      showHeader={false}
      rows={5}
      label="Loading notifications"
    />
  );
}
