import { Button } from "@/components/ui/button";
import { HelpCircle, Clock, History } from "lucide-react";

interface POSHeaderProps {
  onShowOrderHistory?: () => void;
}

export function POSHeader({ onShowOrderHistory }: POSHeaderProps) {
  const currentTime = new Date().toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <header className="flex items-center justify-between p-6 bg-card rounded-t-lg border-b border-border">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Percetakan XYZ</h1>
        <p className="text-sm text-muted-foreground">ID: PRT-001</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>
        
        {onShowOrderHistory && (
          <Button variant="secondary" size="sm" className="gap-2" onClick={onShowOrderHistory}>
            <History className="w-4 h-4" />
            Riwayat Pesanan
          </Button>
        )}
        
        <Button variant="secondary" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Bantuan
        </Button>
      </div>
    </header>
  );
}