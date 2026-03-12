import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Ticket, 
  Settings, 
  LogOut,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Laptop,
  Smartphone,
  HardDrive,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({
    totals: { assets: 0, openTickets: 0, software: 0 },
    assetsByType: [],
    ticketsByStatus: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Ativos', icon: Package },
    { name: 'Chamados', icon: Ticket },
    { name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Lubpar</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Gestão de TI</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.name
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-10 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">{activeTab}</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="pl-10 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl text-sm w-64 transition-all outline-none"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'Dashboard' ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total de Ativos', value: stats.totals.assets, icon: Package, color: 'bg-blue-500' },
                  { label: 'Chamados Abertos', value: stats.totals.openTickets, icon: Ticket, color: 'bg-orange-500' },
                  { label: 'Softwares', value: stats.totals.software, icon: Monitor, color: 'bg-emerald-500' },
                ].map((stat, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={stat.label}
                    className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-xl text-white`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Welcome Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Bem-vindo ao Lubpar TI</h3>
                  <p className="text-zinc-400 max-w-md">
                    O sistema foi reiniciado. Começaremos a reconstruir as funcionalidades a partir daqui para garantir estabilidade total.
                  </p>
                  <button className="mt-6 bg-white text-zinc-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors">
                    Ver Documentação
                  </button>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute left-1/2 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Funcionalidade em desenvolvimento</p>
              <p className="text-sm">Estamos reconstruindo o sistema para você.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
