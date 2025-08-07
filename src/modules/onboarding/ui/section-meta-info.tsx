import { Alert, AlertDescription } from "@/components/ui/alert";

export function SectionMetaInfo({ items }: { items: string[] }) {
  return (
    <Alert>
      <AlertDescription className="pl-4 pr-0">
        <ul className="list-outside list-disc font-inter">
          {items.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
