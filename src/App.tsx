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
  Download,
  Car,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Send,
  Paperclip,
  User,
  UserPlus,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

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

const LubparIcon = ({ size = 24, light = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base Sphere Outline */}
    <circle cx="50" cy="50" r="46" stroke={light ? "white" : "#006699"} strokeWidth="1" strokeOpacity="0.1" />
    
    {/* Stylized Network Nodes (Approximating the image) */}
    <circle cx="35" cy="45" r="7" fill={light ? "white" : "#006699"} />
    <circle cx="50" cy="35" r="5" fill={light ? "white" : "#66AACC"} />
    <circle cx="65" cy="45" r="5" fill={light ? "white" : "#66AACC"} />
    <circle cx="60" cy="65" r="6" fill={light ? "white" : "#006699"} />
    <circle cx="40" cy="70" r="5" fill={light ? "white" : "#66AACC"} />
    <circle cx="25" cy="60" r="6" fill={light ? "white" : "#006699"} />
    
    {/* Connections */}
    <path d="M35 45 Q42 40 50 35" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M50 35 Q57 40 65 45" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M65 45 Q62 55 60 65" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M60 65 Q50 67 40 70" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M40 70 Q32 65 25 60" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    <path d="M25 60 Q30 52 35 45" stroke={light ? "white" : "#006699"} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    
    {/* Inner connections */}
    <path d="M35 45 L60 65" stroke={light ? "white" : "#006699"} strokeWidth="2" strokeOpacity="0.3" />
    <path d="M50 35 L40 70" stroke={light ? "white" : "#006699"} strokeWidth="2" strokeOpacity="0.3" />
  </svg>
);

const LubparLogo = ({ className = "", iconSize = 24, textSize = "text-xl", showText = true, light = false, suffix = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="flex-none">
      <LubparIcon size={iconSize} light={light} />
    </div>
    {showText && (
      <div className={`font-black ${textSize} tracking-tighter flex items-center italic`}>
        <span className={light ? 'text-white' : 'text-lubpar-blue'}>LUB</span>
        <span className={light ? 'text-white/80' : 'text-lubpar-gray'}>PAR</span>
        {suffix && (
          <span className={`ml-1 ${light ? 'text-white/80' : 'text-lubpar-gray'} text-[0.7em] whitespace-nowrap`}>
            {suffix.toUpperCase()}
          </span>
        )}
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({
    totals: { assets: 0, openTickets: 0, software: 0, inventory: 0 },
    assetsByType: [],
    ticketsByStatus: [],
    inventoryLevels: []
  });
  const [categoryConfigs, setCategoryConfigs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any | null>(null);
  const [newInventory, setNewInventory] = useState<any>({
    name: '',
    quantity: 0,
    min_quantity: 0,
    category: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });
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
  const [ticketSearch, setTicketSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferringTicket, setTransferringTicket] = useState<any>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'Cliente'
  });

  // 2ª via de boleto state
  const [boletoSearchBy, setBoletoSearchBy] = useState('CNPJ');
  const [boletoSearchData, setBoletoSearchData] = useState('');
  const [boletoFilial, setBoletoFilial] = useState('01');
  const [boletoPedido, setBoletoPedido] = useState('');
  const [boletoBranch, setBoletoBranch] = useState('SÃO PAULO');
  const [boletosResults, setBoletosResults] = useState<any[]>([]);
  const [isSearchingBoletos, setIsSearchingBoletos] = useState(false);

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
      if (selectedPortal === 'Gestão') {
        fetchInventory();
      }
    }
  }, [isAuthenticated, user?.id, selectedPortal]);

  useEffect(() => {
    if ((activeTab === 'Configurações' || isTransferModalOpen) && selectedPortal === 'Gestão') {
      fetchUsers();
    }
  }, [activeTab, selectedPortal, isTransferModalOpen]);

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
      if (selectedPortal === 'Colaborador' && user?.id) {
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
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        showToast('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      showToast('Erro ao carregar usuários');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const openUserModal = (userToEdit?: any) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        type: userToEdit.type
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        email: '',
        password: '',
        type: 'Cliente'
      });
    }
    setIsUserModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PATCH' : 'POST';
      const body = { 
        ...userFormData, 
        oldType: editingUser?.type 
      };
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        showToast(editingUser ? 'Usuário atualizado' : 'Usuário criado', 'success');
        setIsUserModalOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      showToast('Erro ao salvar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string, type: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`/api/users/${id}?type=${type}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Usuário excluído', 'success');
        fetchUsers();
      }
    } catch (error) {
      showToast('Erro ao excluir usuário');
    }
  };

  const searchBoletos = async () => {
    if (!boletoFilial || !boletoPedido) {
      showToast('Por favor, insira a Filial e o Pedido.');
      return;
    }
    setIsSearchingBoletos(true);
    try {
      const response = await fetch('/api/boletos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchBy: 'PEDIDO',
          searchData: boletoPedido,
          branch: boletoFilial,
          filial: boletoFilial,
          pedido: boletoPedido
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar boletos.');
      }

      const data = await response.json();
      
      // Map the API data to our table structure
      // Handle different possible structures (direct array, or object with array)
      let boletosArray = [];
      if (Array.isArray(data)) {
        boletosArray = data;
      } else if (data && typeof data === 'object') {
        // Look for common array properties in Protheus responses
        const possibleArray = data.items || data.boletos || data.data || data.objects;
        if (Array.isArray(possibleArray)) {
          boletosArray = possibleArray;
        } else if (data.cliente || data.CLIENTE) {
          // If the object itself is a single boleto
          boletosArray = [data];
        }
      }

      const formattedBoletos = boletosArray.map((b: any, index: number) => ({
        id: b.id || b.ID || String(index),
        cliente: b.cliente || b.CLIENTE || 'N/A',
        vendedor: b.vendedor || b.VENDEDOR || b.VENDEDOR1 || b.VENDEDOR_1 || b.vendedor1 || 'N/A',
        vencimento: b.vencimento || b.VENCIMENTO || 'N/A',
        pagamento: b.pagamento || b.PAGAMENTO || '',
        valor: b.valor || b.VALOR || 'R$ 0,00',
        status: b.status || b.STATUS || 'Pendente',
        downloadUrl: b.downloadUrl || b.URL || '#'
      }));

      setBoletosResults(formattedBoletos);
      if (formattedBoletos.length === 0) {
        showToast('Nenhum boleto encontrado.', 'success');
      }
    } catch (error: any) {
      console.error('Search boletos error:', error);
      showToast(error.message || 'Erro ao buscar boletos.');
      setBoletosResults([]);
    } finally {
      setIsSearchingBoletos(false);
    }
  };

  const saveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingInventory ? `/api/inventory/${editingInventory.id}` : '/api/inventory';
      const method = editingInventory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInventory)
      });

      if (res.ok) {
        showToast(editingInventory ? 'Item atualizado' : 'Item adicionado', 'success');
        setIsInventoryModalOpen(false);
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
      showToast('Erro ao salvar item de estoque');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInventory = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Item excluído', 'success');
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
      showToast('Erro ao excluir item');
    }
  };

  const fetchTickets = async () => {
    try {
      let url = '/api/tickets';
      if (selectedPortal === 'Colaborador' && user?.id) {
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
      if (status === 'Encerrado' && !resolution && !selectedTicket?.resolution) {
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

  const assumeTicket = async (ticketId: string) => {
    if (!user || selectedPortal !== 'Gestão') return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responsible_id: user.id,
          responsible_name: user.name,
          status: 'Em Análise' // Quando assume, geralmente muda para Em Análise
        })
      });
      if (res.ok) {
        fetchTickets();
        showToast('Você assumiu o chamado!', 'success');
      }
    } catch (error) {
      showToast('Erro ao assumir chamado');
    }
  };

  const transferTicket = async (ticketId: string, newResponsible: any) => {
    if (!user || selectedPortal !== 'Gestão') return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          responsible_id: newResponsible.id,
          responsible_name: newResponsible.name,
          status: 'Em Análise'
        })
      });
      if (res.ok) {
        fetchTickets();
        setIsTransferModalOpen(false);
        setTransferringTicket(null);
        showToast(`Chamado transferido para ${newResponsible.name}!`, 'success');
      }
    } catch (error) {
      showToast('Erro ao transferir chamado');
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          password: profileData.password || undefined,
          portalType: user.portalType
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setIsProfileModalOpen(false);
        showToast('Perfil atualizado com sucesso!', 'success');
      } else {
        showToast(data.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      showToast('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedPortal(null);
    setIsProfileMenuOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Ativos', icon: Package },
    { name: 'Chamados', icon: Ticket },
    { name: 'Estoque', icon: HardDrive },
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
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <LubparLogo iconSize={48} textSize="text-4xl" />
        </motion.div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPortal('Colaborador')}
            className="group relative bg-white p-8 rounded-[32px] shadow-xl shadow-zinc-200 border border-zinc-100 text-left transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-lubpar-blue/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-zinc-100 group-hover:rotate-6 transition-transform">
              <LubparLogo showText={false} iconSize={32} />
            </div>
            <h2 className="text-2xl font-bold text-lubpar-blue mb-3">Colaborador</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">Acesse o portal institucional, comunicados e recursos gerais da empresa.</p>
            <div className="mt-6 flex items-center gap-2 text-lubpar-blue text-sm font-bold">
              Acessar agora <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Globe size={100} className="text-lubpar-blue" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedPortal('Gestão')}
            className="group relative bg-lubpar-blue p-8 rounded-[32px] shadow-xl shadow-lubpar-blue/20 text-left transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
          >
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-white/5 group-hover:-rotate-6 transition-transform">
              <LubparLogo showText={false} iconSize={32} light />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Gestão TI</h2>
            <p className="text-white/60 text-sm leading-relaxed">Gerencie ativos, chamados técnicos e configurações de infraestrutura.</p>
            <div className="mt-6 flex items-center gap-2 text-white text-sm font-bold">
              Entrar no sistema <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Settings size={100} className="text-white" />
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
            <div className="mb-6">
              <LubparLogo 
                className="justify-center" 
                textSize="text-2xl" 
                suffix={selectedPortal === 'Gestão' ? 'Gestão' : ''} 
              />
            </div>
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
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
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
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-zinc-500 cursor-pointer">
                <input type="checkbox" className="rounded border-zinc-300 text-lubpar-blue focus:ring-lubpar-blue" />
                Lembrar de mim
              </label>
              <a href="#" className="font-bold text-lubpar-blue hover:underline">Esqueceu a senha?</a>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-lubpar-blue text-white rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-xl shadow-lubpar-blue/20 mt-4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

  const filteredTickets = tickets.filter(t => {
    const matchesPortal = selectedPortal === 'Gestão' || String(t.user_id) === String(user?.id);
    const matchesSearch = t.title.toLowerCase().includes(ticketSearch.toLowerCase()) || 
                         t.id.toString().includes(ticketSearch) ||
                         (t.assets?.name || '').toLowerCase().includes(ticketSearch.toLowerCase());
    return matchesPortal && matchesSearch;
  });

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
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <LubparLogo textSize="text-base" suffix={selectedPortal === 'Gestão' ? 'Gestão' : 'Colaborador'} />
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
                    ? 'bg-lubpar-blue text-white shadow-lg shadow-lubpar-blue/20' 
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
              { name: '2ª via de boleto', icon: CreditCard },
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
                    ? 'bg-lubpar-blue text-white shadow-lg shadow-lubpar-blue/20' 
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
            onClick={handleLogout}
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
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm overflow-hidden shrink-0 hover:border-lubpar-blue transition-colors"
                >
                  <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" referrerPolicy="no-referrer" />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-zinc-50">
                          <p className="text-sm font-bold text-zinc-900 truncate">{user?.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate uppercase tracking-wider">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <button 
                            onClick={() => {
                              setProfileData({ name: user.name, email: user.email, password: '' });
                              setIsProfileModalOpen(true);
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                          >
                            <User size={18} />
                            Editar Perfil
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            Sair
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {selectedPortal === 'Colaborador' && activeTab === 'Início' ? (
            <div className="space-y-8">
              <header className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900">Bem-vindo ao Portal Lubpar</h3>
                <p className="text-zinc-500">Selecione uma das opções abaixo para prosseguir.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Chamados', desc: 'Gerencie e solicite suporte técnico ou manutenção.', icon: Ticket, color: 'bg-zinc-900', action: () => setActiveTab('Chamados') },
                  { title: 'Tracking de pedidos', desc: 'Acompanhe o status de suas entregas.', icon: Truck, color: 'bg-blue-600', action: () => setActiveTab('Meus Pedidos') },
                  { title: '2ª via de boleto', desc: 'Emita a segunda via de seus boletos.', icon: FileText, color: 'bg-emerald-600', action: () => setActiveTab('2ª via de boleto') },
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

            </div>
          ) : activeTab === 'Dashboard' ? (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total de Ativos', value: stats.totals.assets, icon: Package, color: 'bg-blue-500' },
                  { label: 'Chamados Abertos', value: stats.totals.openTickets, icon: Ticket, color: 'bg-orange-500' },
                  { label: 'Itens em Estoque', value: stats.totals.inventory, icon: HardDrive, color: 'bg-emerald-500' },
                  { label: 'Softwares', value: stats.totals.software, icon: Monitor, color: 'bg-purple-500' },
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

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-zinc-900">Níveis de Estoque</h4>
                      <p className="text-sm text-zinc-500">Quantidade por equipamento</p>
                    </div>
                    <HardDrive className="text-zinc-400" size={24} />
                  </div>
                  
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.inventoryLevels}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#71717a', fontSize: 12 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                          }}
                        />
                        <Bar dataKey="quantity" radius={[6, 6, 0, 0]} barSize={40}>
                          {stats.inventoryLevels.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.quantity < entry.min_quantity ? '#ef4444' : '#006699'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-lubpar-blue rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-center"
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Resumo do Sistema</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <span className="text-sm font-medium">Chamados Críticos</span>
                        <span className="font-bold">0</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <span className="text-sm font-medium">Ativos em Manutenção</span>
                        <span className="font-bold">0</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <span className="text-sm font-medium">Itens com Estoque Baixo</span>
                        <span className="font-bold text-red-300">
                          {stats.inventoryLevels.filter((i: any) => i.quantity < i.min_quantity).length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-0 bottom-0 p-8 opacity-10">
                    <LayoutDashboard size={160} />
                  </div>
                </motion.div>
              </div>
            </div>
          ) : activeTab === 'Estoque' ? (
            <div className="space-y-8">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">Estoque de Equipamentos</h3>
                  <p className="text-zinc-500">Controle de suprimentos e periféricos de TI.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingInventory(null);
                    setNewInventory({ name: '', quantity: 0, min_quantity: 5, category: '' });
                    setIsInventoryModalOpen(true);
                  }}
                  className="bg-lubpar-blue text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-lubpar-blue/20"
                >
                  <Plus size={20} />
                  Novo Item
                </button>
              </header>

              <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-100">
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Categoria</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quantidade</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {inventory.map((item) => {
                        const isLow = item.quantity <= item.min_quantity;
                        return (
                          <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm">{item.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-600 uppercase">
                                {item.category || 'Geral'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isLow ? 'text-red-500' : 'text-zinc-900'}`}>
                                  {item.quantity}
                                </span>
                                <span className="text-xs text-zinc-400">/ min {item.min_quantity}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                isLow ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {isLow ? 'Estoque Baixo' : 'Normal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingInventory(item);
                                    setNewInventory({ ...item });
                                    setIsInventoryModalOpen(true);
                                  }}
                                  className="p-2 text-zinc-400 hover:text-lubpar-blue transition-colors"
                                >
                                  <Settings size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteInventory(item.id)}
                                  className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {inventory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-zinc-400">
                            <HardDrive size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Nenhum item no estoque</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                <h3 className="text-2xl font-bold text-lubpar-blue">
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
                className="bg-lubpar-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-lubpar-blue/10 whitespace-nowrap"
              >
                <Plus size={20} />
                Novo Chamado
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Recent Tickets */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-zinc-900">
                    {selectedPortal === 'Gestão' ? 'Chamados Recentes' : 'Meus Chamados'}
                  </h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Pesquisar chamado..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
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
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Usuário</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Prioridade</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Responsável</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {filteredTickets.length > 0 ? (
                          filteredTickets.slice(0, 20).map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-zinc-500">{ticket.id}</td>
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
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                {ticket.user_name || ticket.portal_users?.name || 'Usuário'}
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
                                  ticket.status === 'Em Análise' ? 'bg-blue-50 text-blue-600' :
                                  ticket.status === 'Validação Pendente' ? 'bg-purple-50 text-purple-600' :
                                  ticket.status === 'Encerrado' ? 'bg-emerald-50 text-emerald-600' :
                                  'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {ticket.status === 'Aberto' ? <Clock size={12} /> : 
                                   ticket.status === 'Em Análise' ? <Clock size={12} /> : 
                                   ticket.status === 'Validação Pendente' ? <Clock size={12} /> :
                                   <CheckCircle2 size={12} />}
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-zinc-600">
                                {(ticket.responsible_name || ticket.gestao_users?.name) ? (
                                  <span className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold">
                                      {(ticket.responsible_name || ticket.gestao_users?.name).charAt(0)}
                                    </div>
                                    {ticket.responsible_name || ticket.gestao_users?.name}
                                  </span>
                                ) : (
                                  <span className="text-zinc-300 italic">Não assumido</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {!ticket.responsible_id && selectedPortal === 'Gestão' && (
                                    <button 
                                      onClick={() => assumeTicket(ticket.id)}
                                      title="Assumir chamado"
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                      <UserPlus size={18} />
                                    </button>
                                  )}
                                  {selectedPortal === 'Gestão' && (
                                    <button 
                                      onClick={() => {
                                        setTransferringTicket(ticket);
                                        setIsTransferModalOpen(true);
                                      }}
                                      title="Transferir chamado"
                                      className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                    >
                                      <Send size={18} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => setViewingTicket(ticket)}
                                    className="p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors"
                                  >
                                    <MessageSquare size={18} />
                                  </button>
                                </div>
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
                    {filteredTickets.length > 0 ? (
                      filteredTickets.slice(0, 20).map((ticket) => (
                        <div key={ticket.id} className="p-6 space-y-4" onClick={() => setViewingTicket(ticket)}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{ticket.id}</div>
                              <div className="font-bold text-zinc-900 leading-tight">{ticket.title}</div>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ticket.status === 'Aberto' ? 'bg-orange-50 text-orange-600' :
                              ticket.status === 'Em Análise' ? 'bg-blue-50 text-blue-600' :
                              ticket.status === 'Validação Pendente' ? 'bg-purple-50 text-purple-600' :
                              ticket.status === 'Encerrado' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <span className="font-bold uppercase tracking-widest">Usuário:</span> {ticket.user_name || ticket.portal_users?.name || 'Usuário'}
                            </div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                              <span className="font-bold uppercase tracking-widest">Responsável:</span> {ticket.responsible_name || ticket.gestao_users?.name || 'Não assumido'}
                            </div>
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
                {/* SLA Card - Only for Gestão portal */}
                {selectedPortal === 'Gestão' && (
                  <div className="bg-lubpar-blue p-8 rounded-[32px] text-white shadow-xl shadow-lubpar-blue/20">
                    <h4 className="text-lg font-bold mb-2">SLA de Atendimento</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-6">
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
                )}

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
        ) : activeTab === '2ª via de boleto' ? (
          <div className="space-y-8">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Globe size={32} className="text-[#004777]" />
                  <span className="text-2xl font-black text-[#004777] italic tracking-tighter">LUBPAR</span>
                </div>
                <h3 className="text-3xl font-bold text-[#004777] uppercase tracking-tighter ml-8">2ª VIA DE BOLETO</h3>
              </div>
            </header>

            <div className="bg-zinc-100/50 p-12 rounded-[40px] border border-zinc-200 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="w-full md:w-64">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">FILIAL:</span>
                    <input 
                      type="text" 
                      value={boletoFilial}
                      onChange={(e) => setBoletoFilial(e.target.value)}
                      placeholder="01"
                      className="w-full px-6 py-4 bg-zinc-100 border-2 border-zinc-200 text-zinc-600 font-bold uppercase tracking-widest rounded-xl outline-none focus:border-[#004777] transition-all text-center"
                    />
                  </div>
                </div>

                <div className="w-full md:w-96">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">PEDIDO:</span>
                    <input 
                      type="text" 
                      value={boletoPedido}
                      onChange={(e) => setBoletoPedido(e.target.value)}
                      placeholder="INSIRA O NÚMERO DO PEDIDO"
                      className="w-full px-8 py-4 bg-zinc-100 border-2 border-zinc-200 text-zinc-600 font-bold uppercase tracking-widest rounded-full outline-none focus:border-[#004777] transition-all text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-12">
                <button 
                  onClick={searchBoletos}
                  disabled={isSearchingBoletos}
                  className="px-16 py-4 bg-[#1a4b7c] text-white font-bold uppercase tracking-widest rounded-full hover:bg-[#153a61] transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isSearchingBoletos ? 'PESQUISANDO...' : 'PESQUISAR'}
                </button>
              </div>
            </div>

            <div className="bg-zinc-100/50 p-12 rounded-[40px] border border-zinc-200 shadow-sm">
              <h4 className="text-3xl font-bold text-zinc-600 mb-12">Boletos</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-transparent">
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Cliente</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Vendedor 1</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Vencimento</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Pagamento</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Valor</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Status</th>
                      <th className="px-4 py-6 text-sm font-bold text-zinc-600 text-center">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-transparent">
                    {boletosResults.length > 0 ? (
                      boletosResults.map((boleto) => (
                        <tr key={boleto.id} className="text-zinc-400 text-sm font-medium">
                          <td className="px-4 py-6 text-center">{boleto.cliente}</td>
                          <td className="px-4 py-6 text-center">{boleto.vendedor}</td>
                          <td className="px-4 py-6 text-center">{boleto.vencimento}</td>
                          <td className="px-4 py-6 text-center">{boleto.pagamento || '-'}</td>
                          <td className="px-4 py-6 text-center">{boleto.valor}</td>
                          <td className="px-4 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white ${
                              boleto.status === 'Pendente' ? 'bg-[#d63d4a]' : 'bg-emerald-500'
                            }`}>
                              {boleto.status}
                            </span>
                          </td>
                          <td className="px-4 py-6 text-center">
                            <button 
                              onClick={() => {
                                if (boleto.downloadUrl && boleto.downloadUrl !== '#') {
                                  window.open(boleto.downloadUrl, '_blank');
                                } else {
                                  showToast('Link de download não disponível.');
                                }
                              }}
                              className="text-[#2d29ff] hover:scale-110 transition-transform"
                            >
                              <Download size={24} strokeWidth={3} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-zinc-400 italic">
                          {isSearchingBoletos ? 'Buscando boletos...' : 'Nenhum boleto encontrado.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'Configurações' ? (
          <div className="space-y-8">
            <header>
              <h3 className="text-2xl font-bold text-zinc-900">Configurações do Sistema</h3>
              <p className="text-zinc-500">Gerencie usuários, permissões e configurações globais.</p>
            </header>

            <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                <h4 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <User size={20} className="text-lubpar-blue" />
                  Usuários Cadastrados
                </h4>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => openUserModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-lubpar-blue text-white rounded-xl hover:bg-lubpar-blue/90 transition-all font-bold text-xs shadow-sm"
                  >
                    <UserPlus size={16} />
                    Novo Usuário
                  </button>
                  <button 
                    onClick={() => fetchUsers()}
                    disabled={isUsersLoading}
                    className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-lubpar-blue transition-all disabled:opacity-50"
                    title="Atualizar lista"
                  >
                    <RefreshCw size={18} className={isUsersLoading ? 'animate-spin' : ''} />
                  </button>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {users.length} usuários ativos
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nome</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">E-mail</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Permissão</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {isUsersLoading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 italic text-sm">
                          Carregando usuários...
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((u) => (
                        <tr key={`${u.type}-${u.id}`} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                                {u.name?.charAt(0) || '?'}
                              </div>
                              <span className="font-bold text-sm text-zinc-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm text-zinc-600">{u.email}</td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              u.type === 'Gestão' ? 'bg-lubpar-blue/10 text-lubpar-blue' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {u.type}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openUserModal(u)}
                                className="p-2 text-zinc-300 hover:text-lubpar-blue transition-colors"
                                title="Editar usuário"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => deleteUser(u.id, u.type)}
                                className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                                title="Excluir usuário"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-zinc-400 italic text-sm">
                          Nenhum usuário encontrado.
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

        {/* Modal de Usuário */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUserModalOpen(false)}
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden m-4"
              >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={saveUser} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        placeholder="Ex: João Silva"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">E-mail</label>
                      <input 
                        type="email" 
                        required
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="exemplo@lubpar.com"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">
                        Senha {editingUser && <span className="text-[10px] text-zinc-400 font-normal lowercase">(deixe em branco para manter)</span>}
                      </label>
                      <input 
                        type="password" 
                        required={!editingUser}
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 rounded-xl outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2 uppercase tracking-wider">Permissão</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setUserFormData({ ...userFormData, type: 'Cliente' })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            userFormData.type === 'Cliente' 
                            ? 'border-lubpar-blue bg-lubpar-blue/5' 
                            : 'border-zinc-100 hover:border-zinc-200'
                          }`}
                        >
                          <div className={`font-bold text-sm mb-1 ${userFormData.type === 'Cliente' ? 'text-lubpar-blue' : 'text-zinc-900'}`}>Cliente</div>
                          <div className="text-[10px] text-zinc-500">Acesso ao portal de chamados e inventário pessoal.</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserFormData({ ...userFormData, type: 'Gestão' })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            userFormData.type === 'Gestão' 
                            ? 'border-lubpar-blue bg-lubpar-blue/5' 
                            : 'border-zinc-100 hover:border-zinc-200'
                          }`}
                        >
                          <div className={`font-bold text-sm mb-1 ${userFormData.type === 'Gestão' ? 'text-lubpar-blue' : 'text-zinc-900'}`}>Gestão</div>
                          <div className="text-[10px] text-zinc-500">Acesso total ao painel de controle e gerenciamento.</div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="flex-1 px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-all font-bold"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-lubpar-blue text-white rounded-xl hover:bg-lubpar-blue/90 transition-all font-bold shadow-lg shadow-lubpar-blue/20 disabled:opacity-50"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Usuário'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
                    onClick={() => updateTicketStatus(selectedTicket.id, 'Encerrado', resolutionText)}
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
                      #{viewingTicket.id} - {viewingTicket.title}
                    </h3>
                    <button onClick={() => setViewingTicket(null)} className="text-zinc-400 hover:text-zinc-900 shrink-0">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {[
                      { label: 'Aberto', color: 'bg-orange-400' },
                      { label: 'Em Análise', color: 'bg-blue-500' },
                      { label: 'Validação Pendente', color: 'bg-purple-400' },
                      { label: 'Encerrado', color: 'bg-emerald-500' }
                    ].filter((_, idx) => {
                      if (selectedPortal !== 'Colaborador') return true;
                      const statuses = ['Aberto', 'Em Análise', 'Validação Pendente', 'Encerrado'];
                      const currentIdx = statuses.indexOf(viewingTicket.status);
                      return idx <= currentIdx;
                    }).map((step, idx, filteredArray) => {
                      const statuses = ['Aberto', 'Em Análise', 'Validação Pendente', 'Encerrado'];
                      const currentIdx = statuses.indexOf(viewingTicket.status);
                      const isPast = currentIdx >= statuses.indexOf(step.label);
                      
                      return (
                        <div key={idx} className={`${selectedPortal === 'Colaborador' ? 'flex-none w-auto pr-4' : 'flex-1 min-w-[120px]'}`}>
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

                  {/* Admin Actions */}
                  {selectedPortal === 'Gestão' && viewingTicket.status !== 'Encerrado' && (
                    <div className="mt-6 space-y-4 pt-6 border-t border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Responsável</div>
                            <div className="text-sm font-bold text-zinc-900">
                              {viewingTicket.responsible_name || viewingTicket.gestao_users?.name || 'Não assumido'}
                            </div>
                          </div>
                        </div>
                        {!viewingTicket.responsible_id && (
                          <button
                            onClick={() => {
                              assumeTicket(viewingTicket.id);
                              setViewingTicket({ 
                                ...viewingTicket, 
                                responsible_id: user.id, 
                                responsible_name: user.name,
                                status: 'Em Análise'
                              });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                          >
                            <UserPlus size={14} />
                            Assumir Chamado
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest w-full mb-1">Atualizar Status:</span>
                        {['Aberto', 'Em Análise', 'Validação Pendente', 'Encerrado'].map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              if (status === 'Encerrado') {
                                setSelectedTicket(viewingTicket);
                                setIsResolutionModalOpen(true);
                              } else {
                                updateTicketStatus(viewingTicket.id, status);
                                setViewingTicket({ ...viewingTicket, status });
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                              viewingTicket.status === status
                                ? 'bg-lubpar-blue text-white border-lubpar-blue shadow-lg shadow-lubpar-blue/20'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-lubpar-blue hover:text-lubpar-blue'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Inventory Modal */}
        <AnimatePresence>
          {isInventoryModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100"
              >
                <div className="p-8 pb-0 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {editingInventory ? 'Editar Item' : 'Novo Item de Estoque'}
                  </h3>
                  <button onClick={() => setIsInventoryModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={saveInventory} className="p-8 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nome do Equipamento</label>
                    <input 
                      type="text" 
                      required
                      value={newInventory.name}
                      onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
                      placeholder="Ex: Mouse Logitech G203"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Categoria</label>
                    <input 
                      type="text" 
                      value={newInventory.category}
                      onChange={(e) => setNewInventory({ ...newInventory, category: e.target.value })}
                      placeholder="Ex: Periféricos"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Quantidade Atual</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={newInventory.quantity}
                        onChange={(e) => setNewInventory({ ...newInventory, quantity: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Mínimo Desejado</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={newInventory.min_quantity}
                        onChange={(e) => setNewInventory({ ...newInventory, min_quantity: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsInventoryModalOpen(false)}
                      className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-lubpar-blue text-white rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-xl shadow-lubpar-blue/20 disabled:opacity-50"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Item'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Transfer Ticket Modal */}
        <AnimatePresence>
          {isTransferModalOpen && transferringTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100"
              >
                <div className="p-8 pb-0 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-zinc-900">Transferir Chamado</h3>
                  <button onClick={() => setIsTransferModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <p className="text-sm text-zinc-500 mb-4">
                      Selecione o técnico para quem deseja transferir o chamado <strong>#{transferringTicket.id}</strong>:
                    </p>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {users.filter(u => u.type === 'Gestão').map((u) => (
                        <button
                          key={u.id}
                          onClick={() => transferTicket(transferringTicket.id, u)}
                          className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:border-lubpar-blue hover:bg-zinc-50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 group-hover:bg-lubpar-blue/10 group-hover:text-lubpar-blue transition-colors">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-sm text-zinc-900">{u.name}</div>
                              <div className="text-[10px] text-zinc-400">{u.email}</div>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-zinc-300 group-hover:text-lubpar-blue transition-colors" />
                        </button>
                      ))}
                      {users.filter(u => u.type === 'Gestão').length === 0 && (
                        <div className="text-center py-8 text-zinc-400 italic text-sm">
                          Nenhum técnico disponível encontrado.
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsTransferModalOpen(false)}
                    className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-zinc-100"
              >
                <div className="p-8 pb-0 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-zinc-900">Editar Perfil</h3>
                  <button onClick={() => setIsProfileModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-8 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Nova Senha (opcional)</label>
                    <input 
                      type="password" 
                      value={profileData.password}
                      onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      placeholder="Deixe em branco para manter a atual"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-lubpar-blue focus:ring-0 rounded-xl outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-4 bg-lubpar-blue text-white rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-all shadow-xl shadow-lubpar-blue/20 disabled:opacity-50"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
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
