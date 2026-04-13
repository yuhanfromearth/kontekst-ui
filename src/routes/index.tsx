import KontekstDisplay from "#/components/KontekstDisplay";
import ConversationHistory from "#/components/ConversationHistory";
import ModelSelector from "#/components/ModelSelector";
import { Button } from "#/components/ui/button";
import { Kbd } from "#/components/ui/kbd";
import { Spinner } from "#/components/ui/spinner";
import { Textarea } from "#/components/ui/textarea";
import type { Message } from "#/types/message";
import type { ModelDto } from "#/types/model";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedKontekst, setSelectedKontekst] = useState<
    string | undefined
  >();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelName, setSelectedModelName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: defaultModel } = useQuery<ModelDto>({
    queryKey: ["models", "default"],
    queryFn: () => fetch("/api/models/default").then((res) => res.json()),
  });

  useEffect(() => {
    if (defaultModel && !selectedModel) {
      setSelectedModel(defaultModel.id);
      setSelectedModelName(defaultModel.name);
    }
  }, [defaultModel, selectedModel]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        textareaRef.current?.blur();
      }

      // skip if already typing in an input
      if (document.activeElement === textareaRef.current) return;

      if (e.key === "/") {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: {
      messages: Message[];
      kontekstName?: string;
      model?: string;
    }) =>
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((response) => response.text()),
    onSuccess: (responseText) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseText },
      ]);
    },
  });

  const { data: shortcuts } = useQuery<Record<string, string>>({
    queryKey: ["shortcuts"],
    queryFn: () => fetch("/api/shortcuts").then((res) => res.json()),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input) return;
    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(updatedMessages);
    setInput("");
    mutate({
      messages: updatedMessages,
      kontekstName: selectedKontekst,
      model: selectedModel || undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-1">
      <h2 className="font-bold text-2xl mb-8 ml-2">kontekst.</h2>
      <form onSubmit={handleSubmit}>
        <ModelSelector
          selectedModel={selectedModel}
          selectedModelName={selectedModelName}
          onSelect={(id, name) => {
            setSelectedModel(id);
            setSelectedModelName(name);
          }}
        />
        <Textarea
          ref={textareaRef}
          placeholder="How can I help you? [/]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.metaKey && e.key === "Enter" && input.trim() !== "") {
              e.preventDefault();
              const updatedMessages: Message[] = [
                ...messages,
                { role: "user", content: input },
              ];
              setMessages(updatedMessages);
              setInput("");
              mutate({
                messages: updatedMessages,
                kontekstName: selectedKontekst,
                model: selectedModel || undefined,
              });
            }
          }}
        />
        <Button
          className="mt-5 w-full"
          variant="outline"
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner />
          ) : (
            <>
              Send <Kbd>⌘ + Enter</Kbd>
            </>
          )}
        </Button>
      </form>

      <KontekstDisplay
        selected={selectedKontekst}
        onSelect={setSelectedKontekst}
        shortcuts={shortcuts}
      />

      {messages.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto mt-16">
          <ConversationHistory messages={messages} />
        </div>
      )}
    </div>
  );
}
