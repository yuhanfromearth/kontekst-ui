import { createContext, useContext, useState } from "react";
import type { Message, TokenUsage } from "#/types/message";
import type { ModelDto } from "#/types/model";

interface ConversationState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  conversationId: string | undefined;
  setConversationId: (id: string | undefined) => void;
  tokenUsage: TokenUsage | undefined;
  setTokenUsage: (usage: TokenUsage | undefined) => void;
  selectedKontekst: string | undefined;
  setSelectedKontekst: (name: string | undefined) => void;
  selectedModel: string;
  setSelectedModel: (id: string) => void;
  selectedModelDto: ModelDto | undefined;
  setSelectedModelDto: (dto: ModelDto | undefined) => void;
  modelContextLength: number;
  setModelContextLength: (len: number) => void;
}

const ConversationContext = createContext<ConversationState | undefined>(
  undefined,
);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | undefined>();
  const [selectedKontekst, setSelectedKontekst] = useState<
    string | undefined
  >();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelDto, setSelectedModelDto] = useState<
    ModelDto | undefined
  >();
  const [modelContextLength, setModelContextLength] = useState(0);

  return (
    <ConversationContext.Provider
      value={{
        messages,
        setMessages,
        conversationId,
        setConversationId,
        tokenUsage,
        setTokenUsage,
        selectedKontekst,
        setSelectedKontekst,
        selectedModel,
        setSelectedModel,
        selectedModelDto,
        setSelectedModelDto,
        modelContextLength,
        setModelContextLength,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const ctx = useContext(ConversationContext);
  if (!ctx)
    throw new Error("useConversation must be used within ConversationProvider");

  return ctx;
}
