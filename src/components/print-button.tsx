"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mt-2 px-3 py-1 border rounded text-sm hover:bg-accent print:hidden"
    >
      Print
    </button>
  );
}
