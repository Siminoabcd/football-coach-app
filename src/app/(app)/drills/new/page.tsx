import DrillForm from "../shared/drill-form";
import { createDrill } from "../actions";

export default async function NewDrillPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">New drill</h3>
      <DrillForm
        initial={null}
        onSubmitAction={async (fd) => {
          "use server";
          return await createDrill(fd);
        }}
      />
    </div>
  );
}
