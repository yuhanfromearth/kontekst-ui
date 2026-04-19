import type { Message } from "#/types/message";
import MarkdownRenderer from "#/components/MarkdownRenderer";
import { useEffect, useRef, useState } from "react";

export default function ConversationHistory({
  messages,
}: {
  messages: Message[];
}) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const pendingScrollRef = useRef(false);

  useEffect(() => {
    const scrollContainer = spacerRef.current?.parentElement?.parentElement;
    if (!scrollContainer) return;

    const GAP = 24; // gap-6

    const recalculate = () => {
      const containerHeight = scrollContainer.clientHeight;
      const lastMessage = messages[messages.length - 1];

      if (lastMessage?.role === "user") {
        const userHeight = lastUserMessageRef.current?.clientHeight ?? 0;
        setSpacerHeight(Math.max(0, containerHeight - userHeight - GAP));
      } else if (lastMessage?.role === "assistant") {
        const userHeight = lastUserMessageRef.current?.clientHeight ?? 0;
        const assistantHeight =
          lastAssistantMessageRef.current?.clientHeight ?? 0;
        setSpacerHeight(
          Math.max(0, containerHeight - userHeight - assistantHeight - GAP * 2),
        );
      }
    };

    pendingScrollRef.current = true;
    recalculate();

    const observer = new ResizeObserver(recalculate);
    observer.observe(scrollContainer);
    return () => observer.disconnect();
  }, [messages.length]);

  // Scroll after the new spacerHeight has been painted to the DOM
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;
    lastUserMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [spacerHeight]);

  const lastUserIdx = messages.findLastIndex(
    (message: Message) => message.role === "user",
  );
  const lastAssistantIdx =
    messages[messages.length - 1]?.role === "assistant"
      ? messages.length - 1
      : -1;

  return (
    <div className="flex flex-col gap-6">
      {messages.map((message, index) =>
        message.role === "user" ? (
          <div
            key={index}
            ref={index === lastUserIdx ? lastUserMessageRef : null}
            className="flex justify-end"
          >
            <div className="bg-muted rounded-2xl px-4 py-2 max-w-[80%] text-base [&_.prose_p]:my-0">
              <MarkdownRenderer markdownString={message.content} />
            </div>
          </div>
        ) : (
          <div
            key={index}
            ref={index === lastAssistantIdx ? lastAssistantMessageRef : null}
            className="text-base"
          >
            <MarkdownRenderer markdownString={message.content} />
          </div>
        ),
      )}
      <div
        aria-hidden="true"
        ref={spacerRef}
        style={{ height: spacerHeight }}
        className="shrink-0"
      />
    </div>
  );
}
