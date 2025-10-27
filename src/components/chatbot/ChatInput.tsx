import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  disabled: boolean;
}

export const ChatInput = ({ value, onChange, onSend, disabled }: ChatInputProps) => {
  return (
    <div className="p-3 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSend();
            }
          }}
          placeholder="Tulis pesan..."
          className="flex-1"
          disabled={disabled}
        />
        <Button 
          onClick={onSend}
          variant="default"
          size="icon"
          className="h-10 w-10 bg-[#FF5E01] hover:bg-[#FF5E01]/90 rounded-full flex-shrink-0"
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500">Powered by TIDURLAH STORE</span>
      </div>
    </div>
  );
};
