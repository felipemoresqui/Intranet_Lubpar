import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Package, 
  Ticket as TicketIcon, 
  Plus, 
  Search, 
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings,
  LogOut,
  ChevronRight,
  Database,
  HardDrive,
  Laptop,
  Smartphone,
  Tablet,
  User,
  Cpu,
  Server,
  Trash2,
  GripVertical,
  CheckSquare,
  ClipboardList,
  UserMinus,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CategoryColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
  isSystem?: boolean;
}

export interface CategoryConfig {
  category: string;
  columns: CategoryColumn[];
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string;
  model: string;
  manufacturer: string;
  status: 'Active' | 'Maintenance' | 'Retired';
  purchase_date: string;
  location: string;
  notes: string;
  custom_fields: Record<string, any>;
}

export interface Software {
  id: number;
  name: string;
  version: string;
  license_key: string;
  vendor: string;
  expiry_date: string;
  total_licenses: number;
  used_licenses: number;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  requester: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface Checklist {
  id: number;
  title: string;
  template_type: string;
  items: ChecklistItem[];
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  completed_at?: string;
}

export interface DashboardStats {
  totals: {
    assets: number;
    openTickets: number;
    software: number;
  };
  assetsByType: { type: string; count: number }[];
  ticketsByStatus: { status: string; count: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'software' | 'tickets' | 'checklists'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formType, setFormType] = useState<string>('Computador');
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/software'),
        fetch('/api/tickets'),
        fetch('/api/checklists'),
        fetch('/api/stats'),
        fetch('/api/category-configs')
      ]);

      for (const res of responses) {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server returned ${res.status}: ${text.slice(0, 100)}`);
        }
      }

      const [assetsData, softwareData, ticketsData, checklistsData, statsData, configsData] = await Promise.all(
        responses.map(res => res.json())
      );

      setAssets(assetsData);
      setSoftware(softwareData);
      setTickets(ticketsData);
      setChecklists(checklistsData);
      setStats(statsData);
      setCategoryConfigs(configsData);
      setConfigError(null);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.message.includes('SUPABASE_URL')) {
        setConfigError('config');
      } else if (
        error.message.includes('public.assets') || 
        error.message.includes('relation "assets" does not exist') ||
        error.message.includes('function get_assets_by_type() does not exist')
      ) {
        setConfigError('database');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const categories = ['Todos', ...categoryConfigs.map(c => c.category)];

  const renameCategory = async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });
      if (!res.ok) throw new Error('Falha ao renomear categoria');
      fetchData();
      if (selectedCategory === oldName) setSelectedCategory(newName);
    } catch (error) {
      alert('Erro ao renomear categoria');
    }
  };

  const addCategory = async (name: string, shouldFetch = true) => {
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/category-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: name, 
          columns: [
            { id: 'name', label: 'Ativo', type: 'text', isSystem: true },
            { id: 'type', label: 'Tipo', type: 'text', isSystem: true },
            { id: 'serial_number', label: 'Serial', type: 'text', isSystem: true },
            { id: 'status', label: 'Status', type: 'text', isSystem: true }
          ]
        })
      });
      if (!res.ok) {
        const text = await res.text();
        let errorMessage = text || 'Falha ao adicionar categoria';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Not JSON, use the text we already have
        }
        throw new Error(errorMessage);
      }
      if (shouldFetch) fetchData();
    } catch (error: any) {
      if (shouldFetch) {
        alert(`Erro ao adicionar categoria: ${error.message}`);
      } else {
        throw error;
      }
    }
  };

  const deleteCategory = async (name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"? Ativos vinculados a ela não serão excluídos, mas perderão a categoria.`)) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Falha ao excluir categoria');
      }
      fetchData();
      if (selectedCategory === name) setSelectedCategory('Todos');
    } catch (error: any) {
      alert(`Erro ao excluir categoria: ${error.message}`);
    }
  };

  const checklistTemplates = {
    'notebook': {
      title: 'Notebook',
      items: [
        'Incluir máquina no sharepoint',
        'Incluir no dominio grupoipdv.net',
        'Alterar senha do usuário administrador',
        'Instalar Team viewer',
        'Instalar VPN',
        'Conectar na VPN',
        'Entrar no usuário do funcionário',
        'Baixar pacote office',
        'Instalar Teams',
        'Instalar Google Chrome',
        'Configurar Protheus Web',
        'Configurar pasta de rede H'
      ]
    },
    'tablet': {
      title: 'Tablet',
      items: [
        'Incluir tablet no sharepoint',
        'Configurar chip',
        'Instalar os aplicativos (Outlook, Teams, Word, Excel, etc)',
        'Etiquetar equipamento',
        'Preencher termo de responsabilidade'
      ]
    },
    'celular': {
      title: 'Celular',
      items: [
        'Incluir celular no sharepoint',
        'Incluir no MDM (se for vendedor externo)',
        'Alterar nome no MDM',
        'Configurar chip',
        'Configurar os aplicativos (Outlook, Teams, Word, Excel, etc)',
        'Etiquetar equipamento',
        'Preencher termo de responsabilidade'
      ]
    },
    'usuario': {
      title: 'Usuário',
      items: [
        'Criar usuário no AD',
        'Criar usuário no Protheus',
        'Liberar licença no Office 365',
        'Enviar acessos por email',
        'Criar acesso no ROTA',
        'Incluir informações no Sharepoint',
        'Incluir/Alterar nome no MDM',
        'Alterar nome na planilha de Linhas/VIVO'
      ]
    },
    'chip': {
      title: 'Chip',
      items: [
        'Ajustar informações no relatório de linhas',
        'Verificar se a linha já está sendo utilizada',
        'Transferir linha para o chip no vivo empresas',
        'Ajustar consumo no vivo gestão',
        'Tirar bloqueios de ligação e consumo no vivo gestão'
      ]
    }
  };

  const addChecklist = async (templateKey: keyof typeof checklistTemplates) => {
    const template = checklistTemplates[templateKey];
    const newChecklist = {
      title: template.title,
      template_type: templateKey,
      items: template.items.map((task, index) => ({
        id: `item-${Date.now()}-${index}`,
        task,
        completed: false
      })),
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChecklist)
      });
      if (!res.ok) throw new Error('Falha ao criar checklist');
      fetchData();
    } catch (error) {
      alert('Erro ao criar checklist');
    }
  };

  const updateChecklist = async (id: number, updates: Partial<Checklist>) => {
    try {
      const res = await fetch(`/api/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Falha ao atualizar checklist');
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar checklist');
    }
  };

  const deleteChecklist = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este checklist?')) return;
    try {
      const res = await fetch(`/api/checklists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir checklist');
      fetchData();
    } catch (error) {
      alert('Erro ao excluir checklist');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'Todos' || asset.type === selectedCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         asset.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderChecklists = () => {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-zinc-900">Checklists de TI</h3>
            <p className="text-sm text-zinc-500">Gerencie processos e configurações padrão</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {(Object.keys(checklistTemplates) as Array<keyof typeof checklistTemplates>).map((key) => {
            const template = checklistTemplates[key];
            const Icon = key === 'notebook' ? Laptop :
                        key === 'tablet' ? Tablet :
                        key === 'celular' ? Smartphone :
                        key === 'usuario' ? User : Cpu;
            
            return (
              <button
                key={key}
                onClick={() => addChecklist(key)}
                className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md hover:border-black/10 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-zinc-900 mb-1">{template.title}</h4>
                <p className="text-xs text-zinc-500">Criar novo checklist a partir deste modelo</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-zinc-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Checklists em Andamento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklists.map((checklist) => (
              <div key={checklist.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-zinc-900">{checklist.title}</h5>
                    <p className="text-xs text-zinc-500">Criado em {format(new Date(checklist.created_at), "d 'de' MMM, HH:mm", { locale: ptBR })}</p>
                  </div>
                  <button 
                    onClick={() => deleteChecklist(checklist.id)}
                    className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {checklist.items.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={item.completed}
                        onChange={(e) => {
                          const newItems = checklist.items.map(i => 
                            i.id === item.id ? { ...i, completed: e.target.checked } : i
                          );
                          const allCompleted = newItems.every(i => i.completed);
                          updateChecklist(checklist.id, { 
                            items: newItems,
                            status: allCompleted ? 'Completed' : 'In Progress',
                            completed_at: allCompleted ? new Date().toISOString() : undefined
                          });
                        }}
                        className="w-5 h-5 rounded-lg border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                      />
                      <span className={`text-sm ${item.completed ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden w-24">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(checklist.items.filter(i => i.completed).length / checklist.items.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {Math.round((checklist.items.filter(i => i.completed).length / checklist.items.length) * 100)}%
                    </span>
                  </div>
                  {checklist.status === 'Completed' && (
                    <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluído
                    </span>
                  )}
                </div>
              </div>
            ))}
            {checklists.length === 0 && (
              <div className="col-span-full py-12 bg-zinc-50 rounded-3xl border border-dashed border-black/10 flex flex-col items-center justify-center text-center">
                <ClipboardList className="w-12 h-12 text-zinc-200 mb-3" />
                <p className="text-sm text-zinc-400">Nenhum checklist em andamento.<br/>Selecione um modelo acima para começar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Monitor className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Total de Ativos</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.totals.assets}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TicketIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Ativos</span>
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Chamados Abertos</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.totals.openTickets}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Licenças</span>
            </div>
            <h3 className="text-sm font-medium text-zinc-500">Software & Licenças</h3>
            <p className="text-3xl font-bold text-zinc-900">{stats.totals.software}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <h3 className="text-lg font-semibold mb-6">Ativos por Tipo</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.assetsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="type"
                  >
                    {stats.assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
            <h3 className="text-lg font-semibold mb-6">Status de Chamados</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ticketsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-6 border-bottom border-black/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Chamados Recentes</h3>
            <button onClick={() => setActiveTab('tickets')} className="text-sm text-blue-600 hover:underline">Ver todos</button>
          </div>
          <div className="divide-y divide-black/5">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    ticket.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                    ticket.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900">{ticket.title}</h4>
                    <p className="text-xs text-zinc-500">Requisitado por {ticket.requester} • {format(new Date(ticket.created_at), 'dd MMM, HH:mm', { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === 'Open' ? 'bg-blue-50 text-blue-700' :
                    ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {ticket.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAssets = () => {
    if (selectedCategory === 'Todos') {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-zinc-900">Gestão de Ativos</h3>
              <p className="text-sm text-zinc-500">Selecione uma categoria para gerenciar o inventário</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-2 bg-white text-zinc-600 border border-black/10 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Gerenciar Categorias
              </button>
              <button 
                onClick={() => {
                  setEditingAsset(null);
                  setFormType(categories[1] || 'Computador');
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
              >
                <Plus className="w-4 h-4" />
                Novo Ativo
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.filter(c => c !== 'Todos').length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-black/10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-zinc-300" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 mb-2">Nenhuma categoria encontrada</h4>
                <p className="text-sm text-zinc-500 mb-6 max-w-xs">Você pode criar novas categorias ou restaurar os padrões do sistema para começar.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="bg-zinc-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Criar Categoria
                  </button>
                  <button 
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const originalText = btn.innerText;
                      btn.disabled = true;
                      btn.innerText = 'Restaurando...';
                      
                      try {
                        const defaults = ['Computador', 'Celular', 'Tablet', 'Linhas'];
                        for (const name of defaults) {
                          // We don't call fetchData inside the loop to avoid multiple refreshes
                          await addCategory(name, false);
                        }
                        await fetchData();
                        alert('Padrões restaurados com sucesso!');
                      } catch (error: any) {
                        alert(`Erro ao restaurar padrões: ${error.message}`);
                      } finally {
                        btn.disabled = false;
                        btn.innerText = originalText;
                      }
                    }}
                    className="bg-white text-zinc-900 border border-black/10 px-6 py-2 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
                  >
                    Restaurar Padrões
                  </button>
                </div>
              </div>
            ) : (
              categories.filter(c => c !== 'Todos').map((cat) => {
                const count = assets.filter(a => a.type === cat).length;
                const Icon = cat === 'Computador' ? Laptop :
                            cat === 'Celular' ? Smartphone :
                            cat === 'Tablet' ? Smartphone :
                            cat === 'Linhas' ? HardDrive : Monitor;
                
                return (
                  <motion.div
                    key={cat}
                    whileHover={{ y: -5 }}
                    className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-xl transition-all text-left group relative"
                  >
                    <button 
                      onClick={() => setSelectedCategory(cat)}
                      className="absolute inset-0 z-0"
                    />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt('Novo nome para a categoria:', cat);
                              if (newName) renameCategory(cat, newName);
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(cat);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-zinc-900 mb-1">{cat}</h4>
                      <p className="text-sm text-zinc-500">{count} ativos cadastrados</p>
                      <div className="mt-4 flex items-center text-xs font-bold text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Inventário
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      );
    }

    const config = categoryConfigs.find(c => c.category === selectedCategory);
    let columns = config?.columns ? [...config.columns] : [
      { id: 'name', label: 'Ativo', type: 'text', isSystem: true },
      { id: 'type', label: 'Tipo', type: 'text', isSystem: true },
      { id: 'serial_number', label: 'Serial', type: 'text', isSystem: true },
      { id: 'status', label: 'Status', type: 'text', isSystem: true }
    ];

    // Ensure system columns are always present even if config was created before they were added
    const systemIds = ['name', 'type', 'serial_number', 'status'];
    systemIds.forEach(id => {
      if (!columns.find(col => col.id === id)) {
        const defaultLabel = id === 'name' ? 'Ativo' : id === 'type' ? 'Tipo' : id === 'serial_number' ? 'Serial' : 'Status';
        columns.unshift({ id, label: defaultLabel, type: 'text', isSystem: true });
      }
    });

    const renderCell = (asset: Asset, col: CategoryColumn) => {
      switch (col.id) {
        case 'name':
          return (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg">
                {asset.type === 'Computador' ? <Laptop className="w-4 h-4 text-zinc-600" /> :
                 asset.type === 'Celular' ? <Smartphone className="w-4 h-4 text-zinc-600" /> :
                 asset.type === 'Tablet' ? <Smartphone className="w-4 h-4 text-zinc-600" /> :
                 asset.type === 'Linhas' ? <HardDrive className="w-4 h-4 text-zinc-600" /> :
                 <HardDrive className="w-4 h-4 text-zinc-600" />}
              </div>
              <div>
                <div className="font-medium text-zinc-900">{asset.name}</div>
                <div className="text-xs text-zinc-500">{asset.manufacturer} {asset.model}</div>
              </div>
            </div>
          );
        case 'type':
          return <span className="text-sm text-zinc-600">{asset.type}</span>;
        case 'serial_number':
          return <span className="text-sm font-mono text-zinc-500">{asset.serial_number}</span>;
        case 'status':
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
              asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700' :
              'bg-zinc-100 text-zinc-700'
            }`}>
              {asset.status === 'Active' ? 'Ativo' : asset.status === 'Maintenance' ? 'Manutenção' : 'Retirado'}
            </span>
          );
        default:
          return <span className="text-sm text-zinc-600">{asset.custom_fields?.[col.id] || '-'}</span>;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedCategory('Todos')}
              className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">{selectedCategory}</h3>
              <p className="text-xs text-zinc-500">{filteredAssets.length} itens encontrados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-zinc-600 border border-black/10 px-3 py-1.5 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap text-xs font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Configurar Colunas
            </button>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar ativos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setEditingAsset(null);
                setFormType(selectedCategory);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Novo Ativo
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-black/5">
                {columns.map(col => (
                  <th key={col.id} className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-zinc-50 transition-colors group">
                  {columns.map(col => (
                    <td key={col.id} className="px-6 py-4">
                      {renderCell(asset, col)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingAsset(asset);
                          setFormType(asset.type);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-zinc-200 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-zinc-600" />
                      </button>
                      <button onClick={() => deleteAsset(asset.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-zinc-400">
                    Nenhum ativo encontrado nesta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  if (configError) {
    const isDbError = configError === 'database';
    
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-black/5 space-y-6"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isDbError ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
            {isDbError ? <Database className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900">
              {isDbError ? 'Configuração do Banco de Dados' : 'Configuração Necessária'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {isDbError 
                ? 'As tabelas necessárias não foram encontradas no seu projeto Supabase.' 
                : 'Para conectar ao seu banco de dados Supabase, você precisa configurar as variáveis de ambiente no painel lateral.'}
            </p>
          </div>
          
          {isDbError ? (
            <div className="space-y-4">
              <div className="bg-zinc-900 rounded-2xl p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SQL para Executar no Supabase</span>
                  <button 
                    onClick={() => {
                      const sql = `
-- ==========================================
-- 1. CRIAÇÃO DAS TABELAS
-- ==========================================
CREATE TABLE IF NOT EXISTS assets (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, serial_number TEXT UNIQUE, model TEXT, manufacturer TEXT, status TEXT DEFAULT 'Active', purchase_date TEXT, location TEXT, notes TEXT, custom_fields JSONB DEFAULT '{}'::jsonb);
CREATE TABLE IF NOT EXISTS category_configs (category TEXT PRIMARY KEY, columns JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS software (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name TEXT NOT NULL, version TEXT, license_key TEXT, vendor TEXT, expiry_date TEXT, total_licenses BIGINT, used_licenses BIGINT DEFAULT 0);
CREATE TABLE IF NOT EXISTS tickets (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, description TEXT, priority TEXT DEFAULT 'Medium', status TEXT DEFAULT 'Open', requester TEXT, assigned_to TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS checklists (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, title TEXT NOT NULL, template_type TEXT NOT NULL, items JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT DEFAULT 'Pending', created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), assigned_to TEXT, completed_at TIMESTAMPTZ);

-- ==========================================
-- 2. SEGURANÇA (RLS)
-- ==========================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso simplificadas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON assets FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public Access" ON category_configs FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public Access" ON software FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public Access" ON tickets FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY "Public Access" ON checklists FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ==========================================
-- 3. FUNÇÕES (RPC) PARA O DASHBOARD
-- ==========================================
CREATE OR REPLACE FUNCTION get_assets_by_type() RETURNS TABLE (type TEXT, count BIGINT) AS $$ SELECT type, COUNT(*) as count FROM assets GROUP BY type; $$ LANGUAGE sql;
CREATE OR REPLACE FUNCTION get_tickets_by_status() RETURNS TABLE (status TEXT, count BIGINT) AS $$ SELECT status, COUNT(*) as count FROM tickets GROUP BY status; $$ LANGUAGE sql;

-- ==========================================
-- 4. CATEGORIAS PADRÃO
-- ==========================================
INSERT INTO category_configs (category, columns) VALUES 
('Computador', '[{"id": "name", "label": "Ativo", "type": "text", "isSystem": true}, {"id": "type", "label": "Tipo", "type": "text", "isSystem": true}, {"id": "serial_number", "label": "Serial", "type": "text", "isSystem": true}, {"id": "status", "label": "Status", "type": "text", "isSystem": true}]'::jsonb),
('Celular', '[{"id": "name", "label": "Ativo", "type": "text", "isSystem": true}, {"id": "type", "label": "Tipo", "type": "text", "isSystem": true}, {"id": "serial_number", "label": "Serial", "type": "text", "isSystem": true}, {"id": "status", "label": "Status", "type": "text", "isSystem": true}]'::jsonb),
('Tablet', '[{"id": "name", "label": "Ativo", "type": "text", "isSystem": true}, {"id": "type", "label": "Tipo", "type": "text", "isSystem": true}, {"id": "serial_number", "label": "Serial", "type": "text", "isSystem": true}, {"id": "status", "label": "Status", "type": "text", "isSystem": true}]'::jsonb),
('Linhas', '[{"id": "name", "label": "Ativo", "type": "text", "isSystem": true}, {"id": "type", "label": "Tipo", "type": "text", "isSystem": true}, {"id": "serial_number", "label": "Serial", "type": "text", "isSystem": true}, {"id": "status", "label": "Status", "type": "text", "isSystem": true}]'::jsonb)
ON CONFLICT (category) DO NOTHING;
`;
                      navigator.clipboard.writeText(sql.trim());
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Copiar SQL
                  </button>
                </div>
                <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto no-scrollbar max-h-48">
{`-- 1. Tabelas e Segurança
CREATE TABLE IF NOT EXISTS assets (...);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON assets FOR ALL USING (true);

-- (Clique no botão 'Copiar SQL' para o script completo)
-- O script inclui RLS, Políticas e Funções do Dashboard.`}
                </pre>
              </div>
              <div className="text-xs text-zinc-500 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="font-semibold text-blue-700 mb-1">Passo a passo:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600/80">
                  <li>Acesse o painel do Supabase e entre no seu projeto.</li>
                  <li>Clique em <b>SQL Editor</b> no menu lateral esquerdo.</li>
                  <li>Clique em <b>New Query</b>.</li>
                  <li>Cole o código acima e clique em <b>Run</b>.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-2xl p-4 text-left space-y-3 border border-black/5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Variáveis Necessárias:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 text-xs font-mono">SUPABASE_URL</code>
                    <span className="text-zinc-400 text-xs italic">Pendente</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-zinc-200 px-2 py-0.5 rounded text-zinc-700 text-xs font-mono">SUPABASE_ANON_KEY</code>
                    <span className="text-zinc-400 text-xs italic">Pendente</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-500 bg-blue-50 p-4 rounded-2xl border border-blue-100 text-left">
                <p className="font-semibold text-blue-700 mb-1">Como configurar:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600/80">
                  <li>Clique no ícone de engrenagem ou "Secrets" na barra lateral esquerda.</li>
                  <li>Adicione as duas variáveis acima com os valores do seu projeto Supabase.</li>
                  <li>A aplicação irá reiniciar automaticamente.</li>
                </ol>
              </div>
            </div>
          )}

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-900 text-white py-3 rounded-2xl font-semibold hover:bg-zinc-800 transition-colors"
          >
            Já executei, recarregar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-zinc-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">IT Manager</span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button 
              onClick={() => {
                setActiveTab('assets');
                setSelectedCategory('Todos');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'assets' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Inventário
            </button>
            <button 
              onClick={() => setActiveTab('software')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'software' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Package className="w-4 h-4" />
              Software
            </button>
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tickets' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <TicketIcon className="w-4 h-4" />
              Chamados
            </button>
            <button 
              onClick={() => setActiveTab('checklists')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'checklists' ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Checklists
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-black/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Admin TI</p>
              <p className="text-xs text-zinc-500 truncate">admin@empresa.com</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold capitalize">
            {activeTab === 'dashboard' ? 'Visão Geral' : 
             activeTab === 'assets' ? 'Gestão de Ativos' : 
             activeTab === 'software' ? 'Licenças de Software' : 
             activeTab === 'tickets' ? 'Central de Chamados' : 'Checklists de TI'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-black/5">
              <Clock className="w-4 h-4" />
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
            <button className="p-2 hover:bg-zinc-50 rounded-full transition-colors relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              <AlertCircle className="w-5 h-5 text-zinc-600" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'assets' && renderAssets()}
              {activeTab === 'software' && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <Package className="w-16 h-16 mb-4 opacity-20" />
                  <p>Módulo de Software em desenvolvimento...</p>
                </div>
              )}
              {activeTab === 'tickets' && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <TicketIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>Módulo de Chamados em desenvolvimento...</p>
                </div>
              )}
              {activeTab === 'checklists' && renderChecklists()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {/* Modal for Column Configuration */}
        {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Configurar Colunas: {selectedCategory}</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-zinc-500">Arraste para reordenar, altere os nomes ou adicione novos campos.</p>
              
              {(() => {
                const config = categoryConfigs.find(c => c.category === selectedCategory);
                let columns = config?.columns ? [...config.columns] : [];
                const systemIds = ['name', 'type', 'serial_number', 'status'];
                systemIds.forEach(id => {
                  if (!columns.find(col => col.id === id)) {
                    const defaultLabel = id === 'name' ? 'Ativo' : id === 'type' ? 'Tipo' : id === 'serial_number' ? 'Serial' : 'Status';
                    columns.unshift({ id, label: defaultLabel, type: 'text', isSystem: true });
                  }
                });

                return (
                  <Reorder.Group 
                    axis="y" 
                    values={columns} 
                    onReorder={async (newColumns) => {
                      await fetch('/api/category-configs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ category: selectedCategory, columns: newColumns })
                      });
                      fetchData();
                    }}
                    className="space-y-3"
                  >
                    {columns.map((col, idx) => (
                      <Reorder.Item 
                        key={col.id} 
                        value={col}
                        className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-black/5 cursor-default group/item"
                      >
                        <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Nome da Coluna</label>
                          <input 
                            defaultValue={col.label}
                            onBlur={async (e) => {
                              const newLabel = e.target.value;
                              if (newLabel === col.label) return;
                              const newColumns = [...columns];
                              newColumns[idx] = { ...col, label: newLabel };
                              await fetch('/api/category-configs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ category: selectedCategory, columns: newColumns })
                              });
                              fetchData();
                            }}
                            className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                          />
                          <p className="text-[10px] text-zinc-400 uppercase">{col.isSystem ? 'Sistema' : col.type}</p>
                        </div>
                        {!col.isSystem && (
                          <button 
                            onClick={async () => {
                              const newColumns = columns.filter((_, i) => i !== idx);
                              await fetch('/api/category-configs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ category: selectedCategory, columns: newColumns })
                              });
                              fetchData();
                            }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                );
              })()}

              <form className="pt-4 border-t border-black/5 space-y-3" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const label = formData.get('label') as string;
                const type = formData.get('type') as any;
                
                const config = categoryConfigs.find(c => c.category === selectedCategory);
                const newCol = { id: label.toLowerCase().replace(/\s+/g, '_'), label, type };
                const newColumns = [...(config?.columns || []), newCol];

                await fetch('/api/category-configs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ category: selectedCategory, columns: newColumns })
                });
                e.currentTarget.reset();
                fetchData();
              }}>
                <div className="grid grid-cols-2 gap-3">
                  <input name="label" placeholder="Novo Campo..." required className="px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <select name="type" className="px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                  </select>
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors font-medium">
                  <Plus className="w-4 h-4" />
                  Adicionar Novo Campo
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

        {/* Category Management Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Gerenciar Categorias</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                  <Plus className="w-5 h-5 rotate-45 text-zinc-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  {categoryConfigs.map((config) => (
                    <div key={config.category} className="flex items-center gap-2 group">
                      <input 
                        type="text"
                        defaultValue={config.category}
                        onBlur={(e) => renameCategory(config.category, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-zinc-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button 
                        onClick={() => deleteCategory(config.category)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-black/5">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Nova categoria..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addCategory((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button 
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement);
                        addCategory(input.value);
                        input.value = '';
                      }}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal for New/Edit Asset */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingAsset ? 'Editar Ativo' : 'Adicionar Novo Ativo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const assetType = formData.get('type') as string;
              
              const baseData: any = {};
              const customFields: any = {};
              
              formData.forEach((value, key) => {
                if (['name', 'type', 'manufacturer', 'model', 'serial_number', 'location', 'status'].includes(key)) {
                  baseData[key] = value;
                } else if (key.startsWith('custom_')) {
                  customFields[key.replace('custom_', '')] = value;
                }
              });

              const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets';
              const method = editingAsset ? 'PATCH' : 'POST';

              await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...baseData, custom_fields: customFields })
              });
              setIsModalOpen(false);
              fetchData();
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Nome</label>
                  <input name="name" defaultValue={editingAsset?.name} required className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Tipo</label>
                  <select 
                    name="type" 
                    defaultValue={editingAsset?.type || formType}
                    className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Fabricante</label>
                  <input name="manufacturer" defaultValue={editingAsset?.manufacturer} className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Modelo</label>
                  <input name="model" defaultValue={editingAsset?.model} className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Número de Série</label>
                <input name="serial_number" defaultValue={editingAsset?.serial_number} className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Localização</label>
                  <input name="location" defaultValue={editingAsset?.location} className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingAsset?.status || 'Active'}
                    className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Active">Ativo</option>
                    <option value="Maintenance">Manutenção</option>
                    <option value="Retired">Retirado</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Custom Fields in Form */}
              <div className="pt-2 space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Campos Personalizados</p>
                <div className="grid grid-cols-2 gap-4">
                  {(categoryConfigs.find(c => c.category === formType)?.columns || [])
                    .filter(col => !col.isSystem)
                    .map(col => (
                      <div key={col.id} className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">{col.label}</label>
                        <input 
                          name={`custom_${col.id}`} 
                          type={col.type}
                          defaultValue={editingAsset?.custom_fields?.[col.id]}
                          className="w-full px-4 py-2 bg-zinc-50 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-black/10 rounded-xl font-medium hover:bg-zinc-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors">
                  {editingAsset ? 'Atualizar' : 'Salvar Ativo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

    </div>
  );
}
