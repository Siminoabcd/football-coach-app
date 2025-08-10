import { notFound } from "next/navigation";
import { getDrill } from "@/lib/drills-queries";
import { updateDrill } from "../../actions";
import DrillForm from "../../shared/drill-form";

export default async function EditDrillPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const drill = await getDrill(id).catch(() => null);
  if (!drill) notFound();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Edit drill</h3>
      <DrillForm
        initial={drill}
        onSubmitAction={async (fd) => {
          "use server";
          return await updateDrill(drill.id, fd);
        }}
      />
    </div>
  );
}
