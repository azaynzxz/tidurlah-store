import { ChevronRight } from "lucide-react";
import type { Message } from "@/hooks/useChatBot";
import { suggestions, subMenus } from "@/data/chatbot/responses";

interface ChatMessageProps {
  message: Message;
  onSuggestionClick: (keyword: string) => void;
  index?: number;
}

export const ChatMessage = ({ message, onSuggestionClick, index = 0 }: ChatMessageProps) => {
  const handleSuggestionClick = (keyword: string) => {
    // For all suggestions, use the normal handler (including "cara order" which is handled in useChatBot)
    onSuggestionClick(keyword);
  };

  return (
    <div 
      className={`mb-3 ${message.isBot ? "text-left" : "text-right"} chat-message-bubble`}
      style={{ 
        animationDelay: `${index * 30}ms`,
        animationFillMode: 'both'
      }}
    >
      <div 
        className={`inline-block p-2 rounded-lg max-w-[85%] text-sm ${
          message.isBot 
            ? "bg-gray-100 text-gray-800" 
            : "bg-[#FF5E01] text-white"
        }`}
      >
        {message.isTyping ? (
          <div className="flex items-center gap-1 px-2">
            <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            <div className="bg-gray-400 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
          </div>
        ) : (
          message.text
        )}
      </div>
      
      {/* Show suggestion buttons below bot message */}
      {message.isBot && message.showSuggestions && (
        <div className="flex flex-wrap gap-2 mt-3 mb-1">
          {suggestions.map((suggestion, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSuggestionClick(suggestion.keyword)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center ${suggestion.color}`}
            >
              {suggestion.hasIcon && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.6 6.32C16.2 4.93 14.2 4.1 12.1 4.1C7.8 4.1 4.3 7.6 4.3 11.9C4.3 13.3 4.7 14.7 5.4 15.9L4.2 19.9L8.3 18.7C9.5 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.8 19 7.8 17.6 6.32ZM12.1 18.3C10.9 18.3 9.7 17.9 8.7 17.2L8.4 17L6 17.7L6.7 15.4L6.4 15.1C5.6 14 5.2 13 5.2 11.9C5.2 8.1 8.3 5.1 12 5.1C13.8 5.1 15.5 5.8 16.7 7C17.9 8.2 18.6 9.9 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.9 11.5C9.7 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.8 9.2 9.6 8.8C9.4 8.4 9.2 8.4 9 8.4C8.9 8.4 8.7 8.4 8.5 8.4C8.3 8.4 8 8.5 7.8 8.8C7.6 9.1 7.1 9.5 7.1 10.4C7.1 11.3 7.8 12.2 7.9 12.4C8.1 12.6 9.7 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z"/>
                </svg>
              )}
              {suggestion.text}
              <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          ))}
        </div>
      )}
      
      {/* Show sub-menu buttons if this message has a sub-menu */}
      {message.isBot && message.showSubMenu && subMenus[message.showSubMenu as keyof typeof subMenus] && (
        <div className="flex flex-wrap gap-2 mt-3 mb-1">
          <p className="w-full text-xs text-gray-500 mb-1">Detail produk:</p>
          {subMenus[message.showSubMenu as keyof typeof subMenus].map((subItem, subIdx) => (
            <button
              key={subIdx}
              onClick={() => onSuggestionClick(subItem.keyword)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${subItem.color}`}
            >
              {subItem.text}
            </button>
          ))}
        </div>
      )}
      
      {message.isWhatsAppPrompt && (() => {
        // Determine the message to send
        let whatsappMessage = "";
        if (message.collectedName) {
          if (message.collectedInstansi && message.collectedInstansi.toLowerCase() !== 'tidak ada' && message.collectedInstansi.trim() !== '') {
            whatsappMessage = `Halo Mincard, saya ${message.collectedName} dari ${message.collectedInstansi} ingin bertanya terkait produk tidurlah.com`;
          } else {
            whatsappMessage = `Halo Mincard, saya ${message.collectedName} ingin bertanya terkait produk tidurlah.com`;
          }
        } else {
          whatsappMessage = "Halo Mincard, saya ingin bertanya terkait produk tidurlah.com";
        }
        
        return (
          <a 
            href={`https://wa.me/6285172157808?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex items-center justify-center mt-2 bg-green-500 hover:bg-green-600 text-white rounded-full py-2 px-4 font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.6 6.32C16.2 4.93 14.2 4.1 12.1 4.1C7.8 4.1 4.3 7.6 4.3 11.9C4.3 13.3 4.7 14.7 5.4 15.9L4.2 19.9L8.3 18.7C9.5 19.3 10.7 19.7 12 19.7C16.3 19.7 19.8 16.2 19.8 11.9C19.8 9.8 19 7.8 17.6 6.32ZM12.1 18.3C10.9 18.3 9.7 17.9 8.7 17.2L8.4 17L6 17.7L6.7 15.4L6.4 15.1C5.6 14 5.2 13 5.2 11.9C5.2 8.1 8.3 5.1 12 5.1C13.8 5.1 15.5 5.8 16.7 7C17.9 8.2 18.6 9.9 18.6 11.7C18.8 15.5 15.8 18.3 12.1 18.3ZM15.2 13.2C15 13.1 14.1 12.7 13.9 12.6C13.7 12.5 13.5 12.5 13.4 12.7C13.2 12.9 12.9 13.3 12.8 13.5C12.7 13.7 12.5 13.7 12.3 13.6C11.3 13.1 10.6 12.7 9.9 11.5C9.7 11.2 10 11.2 10.3 10.6C10.4 10.4 10.3 10.3 10.2 10.2C10.1 10.1 9.8 9.2 9.6 8.8C9.4 8.4 9.2 8.4 9 8.4C8.9 8.4 8.7 8.4 8.5 8.4C8.3 8.4 8 8.5 7.8 8.8C7.6 9.1 7.1 9.5 7.1 10.4C7.1 11.3 7.8 12.2 7.9 12.4C8.1 12.6 9.7 15 12.1 16C13.2 16.5 13.7 16.5 14.3 16.4C14.7 16.3 15.4 15.9 15.6 15.5C15.8 15.1 15.8 14.7 15.7 14.6C15.6 14.5 15.4 14.4 15.2 14.3L15.2 13.2Z"/>
            </svg>
            Hubungi via WhatsApp
          </a>
        );
      })()}
    </div>
  );
};
