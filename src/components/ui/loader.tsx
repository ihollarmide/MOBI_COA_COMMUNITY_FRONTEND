import { LoaderIcon } from "lucide-react";

export function Loader({
  label,
  loaderSize = 16,
}: {
  label?: string;
  loaderSize?: number;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-y-1">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <LoaderIcon className="animate-spin" size={loaderSize} />
    </div>
  );
}
