import { LoaderIcon } from "lucide-react";

export function Loader({ label }: { label?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-y-1">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <LoaderIcon className="animate-spin" size={16} />
    </div>
  );
}
