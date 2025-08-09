import { redirect } from "next/navigation";

export default function TeamIndex({ params }: { params: { teamId: string } }) {
  redirect(`/teams/${params.teamId}/players`);
}
