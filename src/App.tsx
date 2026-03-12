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
  X,
  Cpu,
  Printer,
  Wifi,
  Server,
  Keyboard,
  Mouse,
  Headphones,
  Camera,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ICON_OPTIONS = [
  { name: 'Package', icon: Package },
  { name: 'Laptop', icon: Laptop },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Monitor', icon: Monitor },
  { name: 'Cpu', icon: Cpu },
  { name: 'Printer', icon: Printer },
  { name: 'Wifi', icon: Wifi },
  { name: 'Server', icon: Server },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Mouse', icon: Mouse },
  { name: 'Headphones', icon: Headphones },
  { name: 'Camera', icon: Camera },
  { name: 'Tv', icon: Tv },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({
    totals: { assets: 0, openTickets: 0, software: 0 },
    assetsByType: [],
    ticketsByStatus: []
  });
  const [categoryConfigs, setCategoryConfigs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Package');
  const [newCategoryColumns, setNewCategoryColumns] = useState<any[]>([]);
  const [newAsset, setNewAsset] = useState<any>({
    name: '',
    serial: '',
    type: '',
    custom_data: {}
  });

  useEffect(() => {
    fetchStats();
    fetchCategoryConfigs();
    fetchAssets();
  }, []);

  const openCategoryModal = (config?: any) => {
    if (config) {
      setEditingCategory(config);
      setNewCategoryName(config.category);
      setNewCategoryIcon(config.icon || 'Package');
      setNewCategoryColumns(config.columns);
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryIcon('Package');
      setNewCategoryColumns([]);
    }
    setIsCategoryModalOpen(true);
  };

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

  const fetchCategoryConfigs = async () => {
    try {
      const res = await fetch('/api/category-configs');
      if (res.ok) {
        const data = await res.json();
        setCategoryConfigs(data);
        // Seleciona a primeira categoria automaticamente se nenhuma estiver selecionada
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].category);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar configs:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Erro ao buscar ativos:', error);
    }
  };

  const saveAsset = async () => {
    if (!newAsset.name || !newAsset.type) return alert('Nome e Categoria são obrigatórios');
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      });
      if (res.ok) {
        fetchAssets();
        fetchStats();
        setIsAssetModalOpen(false);
        setNewAsset({ name: '', serial: '', type: '', custom_data: {} });
      }
    } catch (error) {
      alert('Erro ao salvar ativo');
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('Excluir este ativo?')) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAssets();
        fetchStats();
      }
    } catch (error) {
      alert('Erro ao excluir ativo');
    }
  };

  const saveCategoryConfig = async () => {
    if (!newCategoryName.trim()) return alert('Nome da categoria é obrigatório');
    try {
      const res = await fetch('/api/category-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategoryName,
          icon: newCategoryIcon,
          columns: newCategoryColumns
        })
      });
      if (res.ok) {
        fetchCategoryConfigs();
        setIsCategoryModalOpen(false);
        setNewCategoryName('');
        setNewCategoryIcon('Package');
        setNewCategoryColumns([]);
      }
    } catch (error) {
      alert('Erro ao salvar categoria');
    }
  };

  const deleteCategory = async (name: string) => {
    if (!confirm(`Excluir a categoria "${name}"?`)) return;
    try {
      const res = await fetch(`/api/category-configs/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res.ok) fetchCategoryConfigs();
    } catch (error) {
      alert('Erro ao excluir categoria');
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
          ) : activeTab === 'Ativos' ? (
            <div className="space-y-8">
              {/* Gestão de Categorias */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Gestão de Categorias</h3>
                    <p className="text-sm text-zinc-500">Crie categorias e defina colunas personalizadas.</p>
                  </div>
                  <button 
                    onClick={() => openCategoryModal()}
                    className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                  >
                    <Plus size={18} />
                    Nova Categoria
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryConfigs.map((config) => (
                    <div 
                      key={config.id} 
                      className={`p-4 rounded-2xl border transition-all group relative cursor-pointer ${
                        selectedCategory === config.category 
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' 
                        : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300'
                      }`}
                      onClick={() => setSelectedCategory(config.category)}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(config.category);
                        }}
                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryModal(config);
                        }}
                        className="absolute bottom-2 right-2 p-1 text-zinc-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Settings size={14} />
                      </button>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        selectedCategory === config.category ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {(() => {
                          const Icon = ICON_OPTIONS.find(i => i.name === config.icon)?.icon || Package;
                          return <Icon size={20} />;
                        })()}
                      </div>
                      <h4 className="font-bold text-sm mb-1">{config.category}</h4>
                      <p className={`text-[10px] ${selectedCategory === config.category ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {assets.filter(a => a.type === config.category).length} ativos
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-zinc-200" />

              {/* Lista de Ativos */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedCategory ? `Ativos: ${selectedCategory}` : 'Inventário de Ativos'}
                    </h3>
                    <p className="text-sm text-zinc-500">Visualize e gerencie seus ativos cadastrados.</p>
                  </div>
                  <button 
                    onClick={() => setIsAssetModalOpen(true)}
                    className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                  >
                    <Plus size={18} />
                    Cadastrar Ativo
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200">
                        {!selectedCategory ? (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ativo</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Serial</th>
                          </>
                        ) : (
                          /* Colunas Dinâmicas da Categoria Selecionada */
                          categoryConfigs.find(c => c.category === selectedCategory)?.columns.map((col: any) => (
                            <th key={col.id} className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                              {col.label}
                            </th>
                          ))
                        )}

                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {assets
                        .filter(asset => !selectedCategory || asset.type === selectedCategory)
                        .map((asset) => (
                        <tr key={asset.id} className="hover:bg-zinc-50 transition-colors">
                          {!selectedCategory ? (
                            <>
                              <td className="px-6 py-4">
                                <div className="font-bold text-sm">{asset.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-600 uppercase">
                                  {asset.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-500">{asset.serial || '-'}</td>
                            </>
                          ) : (
                            /* Dados Dinâmicos */
                            categoryConfigs.find(c => c.category === selectedCategory)?.columns.map((col: any) => (
                              <td key={col.id} className="px-6 py-4 text-sm text-zinc-500">
                                {asset.custom_data?.[col.id] || '-'}
                              </td>
                            ))
                          )}

                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                              <CheckCircle2 size={14} />
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => deleteAsset(asset.id)}
                              className="text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {assets.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-zinc-400">
                            <Package size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Nenhum ativo cadastrado</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Funcionalidade em desenvolvimento</p>
              <p className="text-sm">Estamos reconstruindo o sistema para você.</p>
            </div>
          )}
        </div>

        {/* Modal de Categoria */}
        <AnimatePresence>
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Nova Categoria</h3>
                  <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nome da Categoria</label>
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex: Notebooks, Servidores..."
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Ícone</label>
                      <div className="grid grid-cols-7 gap-2">
                        {ICON_OPTIONS.map((opt) => (
                          <button
                            key={opt.name}
                            onClick={() => setNewCategoryIcon(opt.name)}
                            className={`p-2 rounded-lg transition-all ${
                              newCategoryIcon === opt.name 
                              ? 'bg-zinc-900 text-white shadow-md' 
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                            }`}
                            title={opt.name}
                          >
                            <opt.icon size={18} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider">Colunas (Campos)</label>
                      <button 
                        onClick={() => setNewCategoryColumns([...newCategoryColumns, { id: `col_${Date.now()}`, label: '', type: 'text' }])}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> Adicionar Campo
                      </button>
                    </div>
                    <div className="space-y-3">
                      {newCategoryColumns.map((col, index) => (
                        <div key={col.id} className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={col.label}
                              onChange={(e) => {
                                const updated = [...newCategoryColumns];
                                updated[index].label = e.target.value;
                                setNewCategoryColumns(updated);
                              }}
                              placeholder="Nome do campo"
                              className="w-full bg-transparent border-none outline-none text-sm font-medium"
                              disabled={col.isSystem}
                            />
                          </div>
                          <select 
                            value={col.type}
                            onChange={(e) => {
                              const updated = [...newCategoryColumns];
                              updated[index].type = e.target.value;
                              setNewCategoryColumns(updated);
                            }}
                            className="bg-white border border-zinc-200 rounded-lg text-xs p-1 outline-none"
                            disabled={col.isSystem}
                          >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="date">Data</option>
                          </select>
                          {!col.isSystem && (
                            <button 
                              onClick={() => setNewCategoryColumns(newCategoryColumns.filter((_, i) => i !== index))}
                              className="text-zinc-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 flex gap-3">
                  <button 
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={saveCategoryConfig}
                    className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                  >
                    Salvar Categoria
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal de Ativo */}
        <AnimatePresence>
          {isAssetModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAssetModalOpen(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Cadastrar Novo Ativo</h3>
                  <button onClick={() => setIsAssetModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nome do Ativo</label>
                      <input 
                        type="text" 
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="Ex: MacBook Pro 14"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Categoria</label>
                      <select 
                        value={newAsset.type}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setNewAsset({ ...newAsset, type: cat, custom_data: {} });
                        }}
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      >
                        <option value="">Selecionar...</option>
                        {categoryConfigs.map(c => (
                          <option key={c.id} value={c.category}>{c.category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nº de Série</label>
                      <input 
                        type="text" 
                        value={newAsset.serial}
                        onChange={(e) => setNewAsset({ ...newAsset, serial: e.target.value })}
                        placeholder="Ex: SN123456"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  {newAsset.type && (
                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Campos da Categoria</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {categoryConfigs.find(c => c.category === newAsset.type)?.columns.filter((col: any) => !col.isSystem).map((col: any) => (
                          <div key={col.id}>
                            <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">{col.label}</label>
                            <input 
                              type={col.type} 
                              value={newAsset.custom_data[col.id] || ''}
                              onChange={(e) => setNewAsset({
                                ...newAsset,
                                custom_data: { ...newAsset.custom_data, [col.id]: e.target.value }
                              })}
                              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-300 rounded-lg outline-none transition-all text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 bg-zinc-50 flex gap-3">
                  <button 
                    onClick={() => setIsAssetModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={saveAsset}
                    className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                  >
                    Salvar Ativo
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
