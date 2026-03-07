import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, FileText } from "lucide-react";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { POSHeader } from "@/components/pos/POSHeader";

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'reports', label: 'Laporan', icon: FileText },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Admin() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <POSHeader cashierName="Admin" />

            {/* Tab Navigation */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 flex gap-1 pt-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-[#FF5E01] text-[#FF5E01]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'reports' && <ReportsTab />}
            </div>
        </div>
    );
}
