import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ShoppingCart, FileText, Package, Tag, LogOut, ArrowLeft, AlertTriangle } from "lucide-react";
import { DashboardTab } from "@/components/admin/DashboardTab";
import { OrderHistory } from "@/components/pos/OrderHistory";
import { ReportsTab } from "@/components/admin/ReportsTab";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { PromosTab } from "@/components/admin/PromosTab";
import { POSHeader } from "@/components/pos/POSHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'promos', label: 'Promo', icon: Tag },
    { id: 'reports', label: 'Laporan', icon: FileText },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Admin() {
    const [activeTab, setActiveTab] = useState<TabId>('dashboard');
    const navigate = useNavigate();
    const { profile, signOut } = useAuth();

    // The user explicitly requested to restrict this to "Zayn and Stevan"
    if (profile && !["Zayn", "Stevan", "Super Admin"].includes(profile.full_name)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    {/* Header with Logo */}
                    <div className="mb-8">
                        <img
                            src="/product-image/Tidurlah Logo Horizontal.png"
                            alt="TIDURLAH GRAFIKA"
                            className="h-12 mx-auto mb-4 object-contain"
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        {/* Custom Illustration */}
                        <div className="mb-6">
                            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#fff6e5' }}>
                                <img
                                    src="/product-image/403-Error.png"
                                    alt="Akses Ditolak"
                                    className="w-40 h-40 object-contain"
                                />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Akses Ditolak
                        </h1>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Maaf, Anda tidak memiliki hak akses administrator untuk membuka halaman ini.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/cashier')}
                                className="w-full bg-[#FF5E01] hover:bg-[#e54d00] text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Kembali ke Kasir
                            </button>

                            <button
                                onClick={async () => {
                                    await signOut();
                                    navigate('/login');
                                }}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <LogOut className="h-5 w-5" />
                                Ganti Akun / Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    useOrderNotifications();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <POSHeader cashierName={profile?.full_name || "Admin"} />

            {/* Tab Navigation */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4 pt-2">
                    <div className="flex gap-1 overflow-x-auto flex-nowrap no-scrollbar pb-1 select-none flex-1 -mb-px">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${activeTab === tab.id
                                    ? 'border-[#FF5E01] text-[#FF5E01]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 mb-1 flex-shrink-0"
                    >
                        <LogOut className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Logout</span>
                        <span className="sm:hidden">Keluar</span>
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'orders' && <OrderHistory />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'promos' && <PromosTab />}
                {activeTab === 'reports' && <ReportsTab />}
            </div>
        </div>
    );
}
