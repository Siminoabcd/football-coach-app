import { redirect } from "next/navigation";
export default function MeIndex() {
  redirect("/me/calendar");
}
