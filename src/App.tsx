import React, { useState, useEffect, useRef } from 'react';
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
  Tv,
  Truck,
  FileText,
  ClipboardCheck,
  CreditCard,
  Car,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Send,
  Paperclip,
  User,
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
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({
    totals: { assets: 0, openTickets: 0, software: 0 },
    assetsByType: [],
    ticketsByStatus: []
  });
  const [categoryConfigs, setCategoryConfigs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [viewingTicket, setViewingTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticketMessages]);
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
  const [newTicket, setNewTicket] = useState<any>({
    title: '',
    description: '',
    priority: 'Média',
    status: 'Aberto',
    asset_id: '',
    attachments: []
  });
  const [resolutionText, setResolutionText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    console.log('Current User:', user);
    console.log('Current Tickets:', tickets);
  }, [user, tickets]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchCategoryConfigs();
      fetchAssets();
      fetchTickets();
    }
  }, [isAuthenticated, user?.id, selectedPortal]);

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

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setNewTicket((prev: any) => ({
              ...prev,
              attachments: [...(prev.attachments || []), base64]
            }));
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const removeAttachment = (index: number) => {
    setNewTicket((prev: any) => ({
      ...prev,
      attachments: prev.attachments.filter((_: any, i: number) => i !== index)
    }));
  };

  const fetchStats = async () => {
    try {
      let url = '/api/stats';
      if (selectedPortal === 'Portal Lubpar' && user?.id) {
        url += `?user_id=${user.id}`;
      }
      const res = await fetch(url);
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
    if (!newAsset.name || !newAsset.type) return showToast('Nome e Categoria são obrigatórios');
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
      showToast('Erro ao salvar ativo');
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
      showToast('Erro ao excluir ativo');
    }
  };

  useEffect(() => {
    if (viewingTicket) {
      fetchTicketMessages(viewingTicket.id);
    }
  }, [viewingTicket]);

  const fetchTicketMessages = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setTicketMessages(data);
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const sendTicketMessage = async () => {
    if (!newMessage.trim() || !viewingTicket) return;
    setIsSendingMessage(true);
    try {
      const messageData = {
        user_id: user.id,
        user_name: user.name,
        message: newMessage,
        is_admin: selectedPortal === 'Gestão',
        created_at: new Date().toISOString()
      };

      const res = await fetch(`/api/tickets/${viewingTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (res.ok) {
        setNewMessage('');
        fetchTicketMessages(viewingTicket.id);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };
  const fetchTickets = async () => {
    try {
      let url = '/api/tickets';
      if (selectedPortal === 'Portal Lubpar' && user?.id) {
        url += `?user_id=${user.id}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log('Tickets fetched:', data);
        setTickets(data);
      } else {
        const errorData = await res.json();
        console.error('Error fetching tickets:', errorData);
        showToast('Erro ao carregar chamados: ' + (errorData.error || res.statusText), 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      showToast('Erro de conexão ao buscar chamados', 'error');
    }
  };

  const saveTicket = async () => {
    if (!newTicket.title.trim()) return showToast('Título é obrigatório');
    try {
      // Limpa o objeto para o Supabase (converte string vazia em null para FKs)
      const ticketData: any = {
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        status: newTicket.status,
        asset_id: newTicket.asset_id === '' ? null : newTicket.asset_id
      };

      // Só inclui o user_id se o usuário estiver logado
      if (user?.id) {
        ticketData.user_id = user.id;
      }

      // Só inclui anexos se houver algum, para evitar erro caso a coluna não exista
      if (newTicket.attachments && newTicket.attachments.length > 0) {
        ticketData.attachments = newTicket.attachments;
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (res.ok) {
        fetchTickets();
        fetchStats();
        setIsTicketModalOpen(false);
        setNewTicket({
          title: '',
          description: '',
          priority: 'Média',
          status: 'Aberto',
          asset_id: '',
          attachments: []
        });
        showToast('Chamado aberto com sucesso!', 'success');
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Erro ao salvar chamado');
      }
    } catch (error) {
      showToast('Erro ao salvar chamado');
    }
  };

  const updateTicketStatus = async (id: string, status: string, resolution?: string) => {
    try {
      const body: any = { status };
      if (resolution) body.resolution = resolution;
      if (status === 'Concluído' && !resolution && !selectedTicket?.resolution) {
        const ticket = tickets.find(t => t.id === id);
        setSelectedTicket(ticket);
        setIsResolutionModalOpen(true);
        return;
      }

      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchTickets();
        fetchStats();
        setIsResolutionModalOpen(false);
        setResolutionText('');
        setSelectedTicket(null);
      }
    } catch (error) {
      showToast('Erro ao atualizar status');
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm('Excluir este chamado?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      showToast('Erro ao excluir chamado');
    }
  };

  const saveCategoryConfig = async () => {
    if (!newCategoryName.trim()) return showToast('Nome da categoria é obrigatório');
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
      showToast('Erro ao salvar categoria');
    }
  };

  const deleteCategory = async (name: string) => {
    if (!confirm(`Excluir a categoria "${name}"?`)) return;
    try {
      const res = await fetch(`/api/category-configs/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res.ok) fetchCategoryConfigs();
    } catch (error) {
      showToast('Erro ao excluir categoria');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Ativos', icon: Package },
    { name: 'Chamados', icon: Ticket },
    { name: 'Configurações', icon: Settings },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          portalType: selectedPortal
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setActiveTab(selectedPortal === 'Gestão' ? 'Dashboard' : 'Início');
        showToast('Login realizado com sucesso!', 'success');
      } else {
        showToast(data.error || 'Usuário ou senha incorretos');
      }
    } catch (error) {
      showToast('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPortal) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPortal('Portal Lubpar')}
            className="group relative bg-white p-12 rounded-[40px] shadow-xl shadow-zinc-200 border border-zinc-100 text-left transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-zinc-200 group-hover:rotate-6 transition-transform">
              <Package className="text-white w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Portal Lubpar</h2>
            <p className="text-zinc-500 leading-relaxed">Acesse o portal institucional, comunicados e recursos gerais da empresa.</p>
            <div className="mt-8 flex items-center gap-2 text-zinc-900 font-bold">
              Acessar agora <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={120} />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPortal('Gestão')}
            className="group relative bg-zinc-900 p-12 rounded-[40px] shadow-xl shadow-zinc-900/20 text-left transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-white/10 group-hover:-rotate-6 transition-transform">
              <Settings className="text-zinc-900 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Gestão TI</h2>
            <p className="text-zinc-400 leading-relaxed">Gerencie ativos, chamados técnicos e configurações de infraestrutura.</p>
            <div className="mt-8 flex items-center gap-2 text-white font-bold">
              Entrar no sistema <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Settings size={120} className="text-white" />
            </div>
          </motion.button>
        </div>
        
        {/* Toast Notification for Selection Screen */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-8 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                toast.type === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}
            >
              {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-sm font-bold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-[32px] shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-100"
        >
          <div className="p-8 pt-12 text-center relative">
            <button 
              onClick={() => setSelectedPortal(null)}
              className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-zinc-200">
              {selectedPortal === 'Gestão' ? <Settings className="text-white w-8 h-8" /> : <Package className="text-white w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">{selectedPortal}</h1>
            <p className="text-zinc-500 text-sm">Entre com suas credenciais para acessar o portal.</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 pt-0 space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">E-mail</label>
              <input 
                type="email" 
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="email@lubpar.com.br"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 focus:ring-0 rounded-xl outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Senha</label>
              <input 
                type="password" 
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-zinc-900 focus:ring-0 rounded-xl outline-none transition-all text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-500 cursor-pointer">
                <input type="checkbox" className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                Lembrar de mim
              </label>
              <a href="#" className="font-bold text-zinc-900 hover:underline">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Autenticando...' : 'Acessar Portal'}
            </button>
          </form>

          <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Não tem uma conta? <a href="#" className="font-bold text-zinc-900 hover:underline">Solicitar acesso</a>
            </p>
          </div>
        </motion.div>

        {/* Toast Notification for Login Screen */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-8 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                toast.type === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}
            >
              {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-sm font-bold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900 relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col h-screen transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              {selectedPortal === 'Gestão' ? <Settings className="text-white w-6 h-6" /> : <Package className="text-white w-6 h-6" />}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Lubpar</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {selectedPortal === 'Gestão' ? 'Gestão de TI' : 'Portal Lubpar'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-zinc-900">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {selectedPortal === 'Gestão' ? (
            menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.name
                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </button>
            ))
          ) : (
            [
              { name: 'Início', icon: LayoutDashboard },
              { name: 'Chamados', icon: Ticket },
              { name: 'Meus Pedidos', icon: Truck },
              { name: 'Financeiro', icon: CreditCard },
              { name: 'Frota', icon: Car },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.name
                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </button>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setSelectedPortal(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-30 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg lg:text-xl font-bold text-zinc-900">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="pl-10 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl text-sm w-48 lg:w-64 transition-all outline-none"
                />
              </div>
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {selectedPortal === 'Portal Lubpar' && activeTab === 'Início' ? (
            <div className="space-y-8">
              <header className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900">Olá, Bem-vindo ao Portal Lubpar</h3>
                <p className="text-zinc-500">Selecione uma das opções abaixo para prosseguir.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Abrir Chamado', desc: 'Solicite suporte técnico ou manutenção.', icon: Ticket, color: 'bg-zinc-900', action: () => setIsTicketModalOpen(true) },
                  { title: 'Tracking de pedidos', desc: 'Acompanhe o status de suas entregas.', icon: Truck, color: 'bg-blue-600', action: () => setActiveTab('Meus Pedidos') },
                  { title: '2ª de boleto', desc: 'Emita a segunda via de seus boletos.', icon: FileText, color: 'bg-emerald-600', action: () => setActiveTab('Financeiro') },
                  { title: 'Checklist de Frota', desc: 'Realize a conferência de veículos.', icon: ClipboardCheck, color: 'bg-orange-600', action: () => setActiveTab('Frota') },
                ].map((item, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={item.title}
                    onClick={item.action}
                    className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                  >
                    <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                      <item.icon size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-zinc-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                    <div className="mt-6 flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
                      Acessar <ChevronRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Recent Tickets for Portal Lubpar */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">Meus Chamados Recentes</h3>
                  <button 
                    onClick={() => setActiveTab('Chamados')} 
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Ver todos
                  </button>
                </div>
                
                <div className="bg-white rounded-[32px] border border-zinc-200 overflow-hidden shadow-sm">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200">
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Título</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Data</th>
                          <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).slice(0, 5).map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-zinc-900">{ticket.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                ticket.status === 'Aberto' ? 'bg-orange-100 text-orange-600' :
                                ticket.status === 'Em análise' ? 'bg-blue-100 text-blue-600' :
                                ticket.status === 'Encerrado' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-zinc-100 text-zinc-600'
                              }`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-500">
                              {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setViewingTicket(ticket)}
                                className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all"
                              >
                                <MessageSquare size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-zinc-100">
                    {tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).slice(0, 5).map((ticket) => (
                      <div key={ticket.id} className="p-6 space-y-4 hover:bg-zinc-50 transition-colors" onClick={() => setViewingTicket(ticket)}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-bold text-zinc-900 leading-tight">{ticket.title}</div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.status === 'Aberto' ? 'bg-orange-100 text-orange-600' :
                            ticket.status === 'Em análise' ? 'bg-blue-100 text-blue-600' :
                            ticket.status === 'Encerrado' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                          <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                          <div className="flex items-center gap-1 text-blue-600">
                            VER DETALHES <ChevronRight size={12} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).length === 0 && (
                    <div className="px-6 py-12 text-center text-zinc-500 italic text-sm">
                      Nenhum chamado encontrado.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : activeTab === 'Dashboard' ? (
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Gestão de Categorias</h3>
                    <p className="text-sm text-zinc-500">Crie categorias e defina colunas personalizadas.</p>
                  </div>
                  <button 
                    onClick={() => openCategoryModal()}
                    className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors w-full sm:w-auto justify-center"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedCategory ? `Ativos: ${selectedCategory}` : 'Inventário de Ativos'}
                    </h3>
                    <p className="text-sm text-zinc-500">Visualize e gerencie seus ativos cadastrados.</p>
                  </div>
                  <button 
                    onClick={() => setIsAssetModalOpen(true)}
                    className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200 w-full sm:w-auto justify-center"
                  >
                    <Plus size={18} />
                    Cadastrar Ativo
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
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
          </div>
        ) : activeTab === 'Chamados' ? (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">
                  {selectedPortal === 'Gestão' ? 'Gestão de Chamados' : 'Central de Chamados'}
                </h3>
                <p className="text-zinc-500 mt-1">
                  {selectedPortal === 'Gestão' 
                    ? 'Gerencie e acompanhe todos os chamados abertos pelos usuários.' 
                    : 'Como podemos ajudar você hoje? Abra uma solicitação para nossa equipe.'}
                </p>
              </div>
              <button 
                onClick={() => setIsTicketModalOpen(true)}
                className="bg-[#1e3a5f] text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#152a45] transition-all shadow-lg shadow-blue-900/10 whitespace-nowrap"
              >
                <Plus size={20} />
                Novo Chamado
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Recent Tickets */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-zinc-900">Meus Chamados Recentes</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar chamado..."
                      className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm w-full sm:w-64 outline-none focus:border-zinc-400 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assunto</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Prioridade</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).length > 0 ? (
                          tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).slice(0, 20).map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-zinc-500">CH-{ticket.id.toString().padStart(4, '0')}</td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                                  {ticket.title}
                                  {ticket.attachments && ticket.attachments.length > 0 && (
                                    <ImageIcon size={12} className="text-blue-500" title={`${ticket.attachments.length} anexo(s)`} />
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                  {ticket.assets?.name || 'Suporte TI'} • {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                  ticket.priority === 'Alta' ? 'bg-red-50 text-red-500' :
                                  ticket.priority === 'Média' ? 'bg-zinc-100 text-zinc-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold w-fit ${
                                  ticket.status === 'Aberto' ? 'bg-orange-50 text-orange-600' :
                                  ticket.status === 'Em análise' ? 'bg-blue-50 text-blue-600' :
                                  ticket.status === 'Encerrado' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {ticket.status === 'Aberto' ? <Clock size={12} /> : 
                                   ticket.status === 'Em análise' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button 
                                  onClick={() => setViewingTicket(ticket)}
                                  className="text-zinc-300 hover:text-zinc-600 transition-colors"
                                >
                                  <MessageSquare size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                              Nenhum chamado recente encontrado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-zinc-50">
                    {tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).length > 0 ? (
                      tickets.filter(t => selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id)).slice(0, 20).map((ticket) => (
                        <div key={ticket.id} className="p-6 space-y-4" onClick={() => setViewingTicket(ticket)}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">CH-{ticket.id.toString().padStart(4, '0')}</div>
                              <div className="font-bold text-zinc-900 leading-tight">{ticket.title}</div>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ticket.status === 'Aberto' ? 'bg-orange-50 text-orange-600' :
                              ticket.status === 'Em análise' ? 'bg-blue-50 text-blue-600' :
                              ticket.status === 'Encerrado' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                              {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ticket.priority === 'Alta' ? 'bg-red-50 text-red-500' :
                              ticket.priority === 'Média' ? 'bg-zinc-100 text-zinc-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                              {ticket.priority}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center text-zinc-400 italic text-sm">
                        Nenhum chamado recente encontrado.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* SLA Card */}
                <div className="bg-[#1e3a5f] p-8 rounded-[32px] text-white shadow-xl shadow-blue-900/20">
                  <h4 className="text-lg font-bold mb-2">SLA de Atendimento</h4>
                  <p className="text-blue-200 text-xs leading-relaxed mb-6">
                    Nossa equipe trabalha para responder todas as solicitações o mais rápido possível.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                        <span>Crítico</span>
                        <span>2 horas</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                        <span>Média / Baixa</span>
                        <span>24 horas</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-1/3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Card */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                  <h4 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <AlertCircle size={14} />
                    </div>
                    Dúvidas Frequentes
                  </h4>
                  
                  <div className="space-y-4">
                    {[
                      'Como resetar minha senha do SAP?',
                      'Onde solicitar novos EPIs?',
                      'Qual o prazo para reembolso de viagens?'
                    ].map((q) => (
                      <button key={q} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all text-left group">
                        <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">{q}</span>
                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-900 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
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
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden m-4"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Nova Categoria</h3>
                  <button onClick={() => setIsCategoryModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-auto">
                  <div className="grid grid-cols-1 gap-6">
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
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {ICON_OPTIONS.map((opt) => (
                          <button
                            key={opt.name}
                            onClick={() => setNewCategoryIcon(opt.name)}
                            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
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
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden m-4"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Cadastrar Novo Ativo</h3>
                  <button onClick={() => setIsAssetModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        {/* Modal de Chamado */}
        <AnimatePresence>
          {isTicketModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsTicketModalOpen(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden m-4"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Novo Chamado</h3>
                  <button onClick={() => setIsTicketModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[80vh] overflow-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Título do Problema</label>
                      <input 
                        type="text" 
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                        placeholder="Ex: Monitor não liga"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Descrição Detalhada</label>
                      <div className="relative">
                        <textarea 
                          rows={3}
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          onPaste={handlePaste}
                          placeholder="Descreva o que está acontecendo... (Você pode colar prints aqui)"
                          className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all resize-none"
                        />
                        <div className="absolute right-3 bottom-3 text-zinc-400">
                          <ImageIcon size={18} />
                        </div>
                      </div>
                      
                      {newTicket.attachments && newTicket.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {newTicket.attachments.map((img: string, idx: number) => (
                            <div key={idx} className="relative group w-20 h-20">
                              <img 
                                src={img} 
                                alt={`Anexo ${idx + 1}`} 
                                className="w-full h-full object-cover rounded-lg border border-zinc-200"
                                referrerPolicy="no-referrer"
                              />
                              <button 
                                onClick={() => removeAttachment(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Prioridade</label>
                        <select 
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                        >
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Ativo Relacionado</label>
                        <select 
                          value={newTicket.asset_id}
                          onChange={(e) => setNewTicket({ ...newTicket, asset_id: e.target.value })}
                          className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                        >
                          <option value="">Nenhum</option>
                          {assets.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.serial})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 flex gap-3">
                  <button 
                    onClick={() => setIsTicketModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={saveTicket}
                    className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
                  >
                    Abrir Chamado
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Modal de Resolução de Chamado */}
        <AnimatePresence>
          {isResolutionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsResolutionModalOpen(false);
                  setSelectedTicket(null);
                  setResolutionText('');
                }}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden m-4"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Resolver Chamado</h3>
                  <button 
                    onClick={() => {
                      setIsResolutionModalOpen(false);
                      setSelectedTicket(null);
                      setResolutionText('');
                    }} 
                    className="text-zinc-400 hover:text-zinc-900"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 mb-1">{selectedTicket?.title}</h4>
                    <p className="text-xs text-zinc-500 mb-4">{selectedTicket?.description}</p>
                    
                    <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nota de Resolução</label>
                    <textarea 
                      rows={4}
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Descreva como o problema foi resolvido..."
                      className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all resize-none"
                    />
                  </div>
                </div>
                <div className="p-6 bg-zinc-50 flex gap-3">
                  <button 
                    onClick={() => {
                      setIsResolutionModalOpen(false);
                      setSelectedTicket(null);
                      setResolutionText('');
                    }}
                    className="flex-1 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => updateTicketStatus(selectedTicket.id, 'Concluído', resolutionText)}
                    disabled={!resolutionText.trim()}
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Chamado
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View Ticket Modal */}
        <AnimatePresence>
          {viewingTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#F8F9FA] w-full max-w-4xl h-[98vh] sm:h-[90vh] rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="p-4 sm:p-6 bg-white border-b border-zinc-100">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-2xl font-bold text-zinc-900 truncate pr-4">
                      #{viewingTicket.id.toString().padStart(4, '0')} - {viewingTicket.title}
                    </h3>
                    <button onClick={() => setViewingTicket(null)} className="text-zinc-400 hover:text-zinc-900 shrink-0">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {[
                      { label: 'Aberto', color: 'bg-emerald-500' },
                      { label: 'Em análise', color: 'bg-emerald-500' },
                      { label: 'Pendente cliente', color: 'bg-orange-400' },
                      { label: 'Validação cliente', color: 'bg-zinc-300' },
                      { label: 'Encerrado', color: 'bg-zinc-300' }
                    ].map((step, idx) => {
                      const statuses = ['Aberto', 'Em análise', 'Pendente cliente', 'Validação cliente', 'Encerrado'];
                      const currentIdx = statuses.indexOf(viewingTicket.status);
                      const isPast = currentIdx >= idx;
                      
                      return (
                        <div key={idx} className="flex-1 min-w-[120px]">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isPast ? 'text-emerald-500' : 'text-zinc-300'}`}>
                              <CheckCircle2 size={14} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isPast ? 'text-zinc-900' : 'text-zinc-400'}`}>
                              {step.label}
                            </span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isPast ? step.color : 'bg-zinc-200'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#F8F9FA]">
                  {/* Original Description as first message */}
                  <div className="flex justify-start">
                    <div className="max-w-[95%] sm:max-w-[80%] bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-zinc-100 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                          {user?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-zinc-900">{user?.name}</span>
                          <span className="text-zinc-400 ml-2">abriu o chamado:</span>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-zinc-600 leading-relaxed whitespace-pre-wrap">{viewingTicket.description}</p>
                      
                      {viewingTicket.attachments && viewingTicket.attachments.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {viewingTicket.attachments.map((img: string, idx: number) => (
                            <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="rounded-xl overflow-hidden border border-zinc-100">
                              <img src={img} alt="Anexo" className="w-full h-24 sm:h-32 object-cover" referrerPolicy="no-referrer" />
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-[10px] text-zinc-400 mt-4">
                        {new Date(viewingTicket.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {ticketMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[95%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border relative ${
                        msg.is_admin ? 'bg-[#FFF5EB] border-orange-100' : 'bg-[#EBF5FF] border-blue-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-4">
                          {!msg.is_admin && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                              {msg.user_name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="text-sm">
                            <span className="font-bold text-zinc-900">{msg.user_name}</span>
                            <span className="text-zinc-400 ml-2">deixou um comentário:</span>
                          </div>
                          {msg.is_admin && (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 ml-2 shrink-0">
                              {msg.user_name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-zinc-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className="text-[10px] text-zinc-400 mt-4">
                          {new Date(msg.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-6 bg-white border-t border-zinc-100">
                  <div className="flex items-center sm:items-end gap-2 sm:gap-4">
                    <button className="p-2 sm:p-3 text-blue-500 hover:bg-blue-50 rounded-full transition-colors border border-blue-100 shrink-0">
                      <Paperclip size={20} />
                    </button>
                    <div className="flex-1 relative">
                      <textarea 
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva uma mensagem"
                        className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 rounded-2xl sm:rounded-3xl outline-none transition-all resize-none max-h-32 text-sm sm:text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendTicketMessage();
                          }
                        }}
                      />
                    </div>
                    <button 
                      onClick={sendTicketMessage}
                      disabled={!newMessage.trim() || isSendingMessage}
                      className="p-2 sm:px-8 sm:py-3 bg-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                    >
                      <span className="hidden sm:inline">{isSendingMessage ? '...' : 'ENVIAR'}</span>
                      <Send size={18} />
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-4 text-[10px] text-zinc-400">
                    Observação: Para enviar anexos superiores a 20mb, <a href="#" className="text-blue-500 underline">clique aqui!</a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className={`fixed bottom-8 left-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
                toast.type === 'error' 
                  ? 'bg-red-50 border-red-100 text-red-600' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}
            >
              {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-sm font-bold">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
