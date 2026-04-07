import KontekstDisplay from "#/components/KontekstDisplay";
import { Button } from "#/components/ui/button";
import { Kbd } from "#/components/ui/kbd";
import { Textarea } from "#/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [input, setInput] = useState("");
  const [selectedKontekst, setSelectedKontekst] = useState<
    string | undefined
  >();

  const { mutate, data, isPending } = useMutation({
    mutationFn: (payload: { input: string; kontekstName?: string }) =>
      fetch("/api/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((response) => response.text()),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ input, kontekstName: selectedKontekst });
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="How can I help you?"
          onChange={(e) => setInput(e.target.value)}
        />
        <Button className="mt-5 w-full" variant="outline" type="submit">
          Send <Kbd>⌘ + Enter</Kbd>
        </Button>
      </form>

      <KontekstDisplay
        selected={selectedKontekst}
        onSelect={setSelectedKontekst}
      />

      <div className="mt-16">
        {isPending && (
          <p className="max-h-96 overflow-y-auto text-justify p-4">
            Loading...
          </p>
        )}
        {data && (
          <p className="max-h-96 overflow-y-auto text-justify p-4">{data}</p>
        )}
      </div>
    </div>
  );
}
