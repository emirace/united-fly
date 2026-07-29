import { redirect } from "next/navigation";

// The dashboard root has no view of its own — bookings is the landing screen.
export default function DashboardIndex() {
  redirect("/dashboard/bookings");
}
