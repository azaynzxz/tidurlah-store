import type { Message } from "@/hooks/useChatBot";
import { ChatMessage } from "./ChatMessage";

interface ChatMessagesListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onSuggestionClick: (keyword: string) => void;
}

export const ChatMessagesList = ({ messages, messagesEndRef, onSuggestionClick }: ChatMessagesListProps) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} onSuggestionClick={onSuggestionClick} />
      ))}
      <div ref={messagesEndRef} /> {/* For auto-scroll */}
    </div>
  );
};
