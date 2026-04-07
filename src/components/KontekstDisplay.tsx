import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";

interface KontekstDisplayProps {
  selected?: string;
  onSelect: (kontekst: string) => void;
}

async function fetchKonteksts(): Promise<string[]> {
  const res = await fetch("/api/konteksts");
  if (!res.ok) throw new Error("Failed to fetch konteksts");

  return res.json();
}

export default function KontekstDisplay({
  selected,
  onSelect,
}: KontekstDisplayProps) {
  const { data: kontekstList = [], isError } = useQuery({
    queryKey: ["konteksts"],
    queryFn: fetchKonteksts,
  });

  if (isError) return <p>Something went wrong.</p>;

  return (
    <div className="flex w-full mt-8 flex-wrap justify-center gap-2">
      {kontekstList.map((kontekst) => (
        <Badge
          key={kontekst}
          onClick={() => onSelect(kontekst)}
          variant={selected === kontekst ? "default" : "outline"}
          className="cursor-pointer"
        >
          {kontekst}
        </Badge>
      ))}
    </div>
  );
}
