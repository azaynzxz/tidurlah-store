interface ChatBubbleProps {
  show: boolean;
}

export const ChatBubble = ({ show }: ChatBubbleProps) => {
  if (!show) return null;

  return (
    <div className="mb-2 transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95">
      <div className="bg-[#FF5E01] text-white px-4 py-2 rounded-2xl shadow-lg mb-2 relative">
        <p className="text-sm font-medium whitespace-nowrap">Ada yang ingin ditanyakan kak? 👋</p>
        {/* Speech bubble tail */}
        <div className="absolute bottom-[-8px] right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#FF5E01]"></div>
      </div>
    </div>
  );
};
