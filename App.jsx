import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { 
  User, 
  LogOut, 
  Plus, 
  Search, 
  Download, 
  Wrench, 
  Shield, 
  Truck, 
  FileText,
  Calendar,
  Building,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://j6zd6737m4a2sibh.manus.space/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Estados para login
  const [loginData, setLoginData] = useState({ username: '', password: '' })

  // Estados para aba 1 - Ferramentas e EPIs
  const [eletricistas, setEletricistas] = useState([])
  const [ferramentasEpis, setFerramentasEpis] = useState([])
  const [atribuicoes, setAtribuicoes] = useState([])
  const [novoEletricista, setNovoEletricista] = useState('')
  const [novaFerramentaEpi, setNovaFerramentaEpi] = useState({ nome: '', tipo: 'Ferramenta' })
  const [novaAtribuicao, setNovaAtribuicao] = useState({ eletricista_id: '', ferramenta_epi_id: '', observacao: '' })

  // Estados para aba 2 - Veículos e Materiais
  const [veiculos, setVeiculos] = useState([])
  const [servicosExternos, setServicosExternos] = useState([])
  const [novoVeiculo, setNovoVeiculo] = useState('')
  const [novoServico, setNovoServico] = useState({
    veiculo_id: '',
    destino: '',
    empresa_atendida: '',
    materiais: [],
    checklist_cinto: {
      cinto_seguranca_status: 'B',
      talabarte_status: 'B',
      mosquetao_status: 'B',
      observacoes: ''
    },
    checklist_escada: {
      escada_simples_status: 'B',
      escada_extensivel_status: 'B',
      degraus_status: 'B',
      travas_status: 'B',
      observacoes: ''
    }
  })

  // Estados para busca
  const [filtroAtribuicoes, setFiltroAtribuicoes] = useState('')
  const [filtroServicos, setFiltroServicos] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        loadData()
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setSuccess('Login realizado com sucesso!')
        loadData()
      } else {
        setError(data.error || 'Erro ao fazer login')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setSuccess('Logout realizado com sucesso!')
    } catch (err) {
      setError('Erro ao fazer logout')
    }
  }

  const loadData = async () => {
    try {
      // Carregar eletricistas
      const eletricistasRes = await fetch(`${API_BASE_URL}/eletricistas`, { credentials: 'include' })
      if (eletricistasRes.ok) {
        const eletricistasData = await eletricistasRes.json()
        setEletricistas(eletricistasData)
      }

      // Carregar ferramentas e EPIs
      const ferramentasRes = await fetch(`${API_BASE_URL}/ferramentas-epis`, { credentials: 'include' })
      if (ferramentasRes.ok) {
        const ferramentasData = await ferramentasRes.json()
        setFerramentasEpis(ferramentasData)
      }

      // Carregar atribuições
      const atribuicoesRes = await fetch(`${API_BASE_URL}/atribuicoes`, { credentials: 'include' })
      if (atribuicoesRes.ok) {
        const atribuicoesData = await atribuicoesRes.json()
        setAtribuicoes(atribuicoesData)
      }

      // Carregar veículos
      const veiculosRes = await fetch(`${API_BASE_URL}/veiculos`, { credentials: 'include' })
      if (veiculosRes.ok) {
        const veiculosData = await veiculosRes.json()
        setVeiculos(veiculosData)
      }

      // Carregar serviços externos
      const servicosRes = await fetch(`${API_BASE_URL}/servicos-externos`, { credentials: 'include' })
      if (servicosRes.ok) {
        const servicosData = await servicosRes.json()
        setServicosExternos(servicosData)
      }
    } catch (err) {
      setError('Erro ao carregar dados')
    }
  }

  const criarEletricista = async (e) => {
    e.preventDefault()
    if (!novoEletricista.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}/eletricistas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome: novoEletricista })
      })

      if (response.ok) {
        setNovoEletricista('')
        setSuccess('Eletricista criado com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar eletricista')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const criarFerramentaEpi = async (e) => {
    e.preventDefault()
    if (!novaFerramentaEpi.nome.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}/ferramentas-epis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(novaFerramentaEpi)
      })

      if (response.ok) {
        setNovaFerramentaEpi({ nome: '', tipo: 'Ferramenta' })
        setSuccess('Item criado com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar item')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const criarAtribuicao = async (e) => {
    e.preventDefault()
    if (!novaAtribuicao.eletricista_id || !novaAtribuicao.ferramenta_epi_id) return

    try {
      const response = await fetch(`${API_BASE_URL}/atribuicoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(novaAtribuicao)
      })

      if (response.ok) {
        setNovaAtribuicao({ eletricista_id: '', ferramenta_epi_id: '', observacao: '' })
        setSuccess('Atribuição criada com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar atribuição')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const devolverItem = async (atribuicaoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/atribuicoes/${atribuicaoId}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      })

      if (response.ok) {
        setSuccess('Item devolvido com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao devolver item')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const criarVeiculo = async (e) => {
    e.preventDefault()
    if (!novoVeiculo.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}/veiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identificacao: novoVeiculo })
      })

      if (response.ok) {
        setNovoVeiculo('')
        setSuccess('Veículo criado com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar veículo')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const criarServicoExterno = async (e) => {
    e.preventDefault()
    if (!novoServico.veiculo_id || !novoServico.destino || !novoServico.empresa_atendida) return

    try {
      const response = await fetch(`${API_BASE_URL}/servicos-externos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(novoServico)
      })

      if (response.ok) {
        setNovoServico({
          veiculo_id: '',
          destino: '',
          empresa_atendida: '',
          materiais: [],
          checklist_cinto: {
            cinto_seguranca_status: 'B',
            talabarte_status: 'B',
            mosquetao_status: 'B',
            observacoes: ''
          },
          checklist_escada: {
            escada_simples_status: 'B',
            escada_extensivel_status: 'B',
            degraus_status: 'B',
            travas_status: 'B',
            observacoes: ''
          }
        })
        setSuccess('Serviço externo criado com sucesso!')
        loadData()
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar serviço externo')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const exportarPDF = async (tipo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/${tipo}/pdf`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tipo}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
        setSuccess('PDF exportado com sucesso!')
      } else {
        setError('Erro ao exportar PDF')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const exportarExcel = async (tipo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/${tipo}/excel`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tipo}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
        setSuccess('Excel exportado com sucesso!')
      } else {
        setError('Erro ao exportar Excel')
      }
    } catch (err) {
      setError('Erro de conexão')
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'B': { label: 'Bom', variant: 'default' },
      'I': { label: 'Irregular', variant: 'secondary' },
      'N': { label: 'Não Conforme', variant: 'destructive' },
      'A': { label: 'Ausente', variant: 'outline' }
    }
    const statusInfo = statusMap[status] || { label: status, variant: 'default' }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Gerenciamento</CardTitle>
            <CardDescription>Ferramentas, EPIs e Veículos para Eletricistas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={login} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Usuário"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Usuário padrão: admin</p>
              <p>Senha padrão: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Gerenciamento
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm text-gray-700">{user.username}</span>
                <Badge variant={user.permissao === 'admin' ? 'default' : 'secondary'}>
                  {user.permissao}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="ferramentas-epis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ferramentas-epis" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Ferramentas e EPIs</span>
            </TabsTrigger>
            <TabsTrigger value="veiculos-materiais" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Veículos e Materiais</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba 1 - Ferramentas e EPIs */}
          <TabsContent value="ferramentas-epis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cadastro de Eletricistas */}
              {user.permissao === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Cadastro de Eletricistas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={criarEletricista} className="space-y-4">
                      <Input
                        placeholder="Nome do eletricista"
                        value={novoEletricista}
                        onChange={(e) => setNovoEletricista(e.target.value)}
                        required
                      />
                      <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Eletricista
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Cadastro de Ferramentas/EPIs */}
              {user.permissao === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5" />
                      <span>Cadastro de Ferramentas/EPIs</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={criarFerramentaEpi} className="space-y-4">
                      <Input
                        placeholder="Nome da ferramenta/EPI"
                        value={novaFerramentaEpi.nome}
                        onChange={(e) => setNovaFerramentaEpi({ ...novaFerramentaEpi, nome: e.target.value })}
                        required
                      />
                      <Select
                        value={novaFerramentaEpi.tipo}
                        onValueChange={(value) => setNovaFerramentaEpi({ ...novaFerramentaEpi, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                          <SelectItem value="EPI">EPI</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sistema de Atribuições */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Sistema de Atribuições</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => exportarPDF('atribuicoes')}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportarExcel('atribuicoes')}>
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Nova Atribuição */}
                <form onSubmit={criarAtribuicao} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    value={novaAtribuicao.eletricista_id}
                    onValueChange={(value) => setNovaAtribuicao({ ...novaAtribuicao, eletricista_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar eletricista" />
                    </SelectTrigger>
                    <SelectContent>
                      {eletricistas.map((eletricista) => (
                        <SelectItem key={eletricista.id} value={eletricista.id.toString()}>
                          {eletricista.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={novaAtribuicao.ferramenta_epi_id}
                    onValueChange={(value) => setNovaAtribuicao({ ...novaAtribuicao, ferramenta_epi_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar item" />
                    </SelectTrigger>
                    <SelectContent>
                      {ferramentasEpis.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nome} ({item.tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Observação (opcional)"
                    value={novaAtribuicao.observacao}
                    onChange={(e) => setNovaAtribuicao({ ...novaAtribuicao, observacao: e.target.value })}
                  />
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Atribuir
                  </Button>
                </form>

                {/* Lista de Atribuições */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Buscar por eletricista, item ou observação..."
                      value={filtroAtribuicoes}
                      onChange={(e) => setFiltroAtribuicoes(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="grid gap-4">
                    {atribuicoes
                      .filter(atribuicao => 
                        !filtroAtribuicoes || 
                        atribuicao.eletricista_nome?.toLowerCase().includes(filtroAtribuicoes.toLowerCase()) ||
                        atribuicao.ferramenta_epi_nome?.toLowerCase().includes(filtroAtribuicoes.toLowerCase()) ||
                        atribuicao.observacao?.toLowerCase().includes(filtroAtribuicoes.toLowerCase())
                      )
                      .map((atribuicao) => (
                        <Card key={atribuicao.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline">{atribuicao.ferramenta_epi_tipo}</Badge>
                                <span className="font-medium">{atribuicao.ferramenta_epi_nome}</span>
                                <span className="text-gray-600">→ {atribuicao.eletricista_nome}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Retirada: {new Date(atribuicao.data_retirada).toLocaleString('pt-BR')}</span>
                                </div>
                                {atribuicao.data_devolucao && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Devolução: {new Date(atribuicao.data_devolucao).toLocaleString('pt-BR')}</span>
                                  </div>
                                )}
                              </div>
                              {atribuicao.observacao && (
                                <p className="text-sm text-gray-600">{atribuicao.observacao}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {atribuicao.data_devolucao ? (
                                <Badge variant="secondary">Devolvido</Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => devolverItem(atribuicao.id)}
                                >
                                  Devolver
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 2 - Veículos e Materiais */}
          <TabsContent value="veiculos-materiais" className="space-y-6">
            {/* Cadastro de Veículos */}
            {user.permissao === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Cadastro de Veículos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={criarVeiculo} className="flex space-x-4">
                    <Input
                      placeholder="Identificação do veículo (ex: VAN-003)"
                      value={novoVeiculo}
                      onChange={(e) => setNovoVeiculo(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Veículo
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Registro de Serviços Externos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Serviços Externos</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => exportarPDF('servicos-externos')}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportarExcel('servicos-externos')}>
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Novo Serviço */}
                <form onSubmit={criarServicoExterno} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      value={novoServico.veiculo_id}
                      onValueChange={(value) => setNovoServico({ ...novoServico, veiculo_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos.map((veiculo) => (
                          <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                            {veiculo.identificacao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Destino"
                      value={novoServico.destino}
                      onChange={(e) => setNovoServico({ ...novoServico, destino: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Empresa atendida"
                      value={novoServico.empresa_atendida}
                      onChange={(e) => setNovoServico({ ...novoServico, empresa_atendida: e.target.value })}
                      required
                    />
                  </div>

                  {/* Checklist Cinto de Segurança */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Checklist - Cinto de Segurança</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Cinto de Segurança</label>
                          <Select
                            value={novoServico.checklist_cinto.cinto_seguranca_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_cinto: { ...novoServico.checklist_cinto, cinto_seguranca_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Talabarte</label>
                          <Select
                            value={novoServico.checklist_cinto.talabarte_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_cinto: { ...novoServico.checklist_cinto, talabarte_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Mosquetão</label>
                          <Select
                            value={novoServico.checklist_cinto.mosquetao_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_cinto: { ...novoServico.checklist_cinto, mosquetao_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Observações</label>
                        <Textarea
                          placeholder="Observações sobre o cinto de segurança..."
                          value={novoServico.checklist_cinto.observacoes}
                          onChange={(e) => setNovoServico({
                            ...novoServico,
                            checklist_cinto: { ...novoServico.checklist_cinto, observacoes: e.target.value }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Checklist Escadas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Checklist - Escadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Escada Simples</label>
                          <Select
                            value={novoServico.checklist_escada.escada_simples_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_escada: { ...novoServico.checklist_escada, escada_simples_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Escada Extensível</label>
                          <Select
                            value={novoServico.checklist_escada.escada_extensivel_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_escada: { ...novoServico.checklist_escada, escada_extensivel_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Degraus</label>
                          <Select
                            value={novoServico.checklist_escada.degraus_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_escada: { ...novoServico.checklist_escada, degraus_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Travas</label>
                          <Select
                            value={novoServico.checklist_escada.travas_status}
                            onValueChange={(value) => setNovoServico({
                              ...novoServico,
                              checklist_escada: { ...novoServico.checklist_escada, travas_status: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B">Bom</SelectItem>
                              <SelectItem value="I">Irregular</SelectItem>
                              <SelectItem value="N">Não Conforme</SelectItem>
                              <SelectItem value="A">Ausente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Observações</label>
                        <Textarea
                          placeholder="Observações sobre as escadas..."
                          value={novoServico.checklist_escada.observacoes}
                          onChange={(e) => setNovoServico({
                            ...novoServico,
                            checklist_escada: { ...novoServico.checklist_escada, observacoes: e.target.value }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Serviço Externo
                  </Button>
                </form>

                {/* Lista de Serviços Externos */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Buscar por destino, empresa ou colaborador..."
                      value={filtroServicos}
                      onChange={(e) => setFiltroServicos(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="grid gap-4">
                    {servicosExternos
                      .filter(servico => 
                        !filtroServicos || 
                        servico.destino?.toLowerCase().includes(filtroServicos.toLowerCase()) ||
                        servico.empresa_atendida?.toLowerCase().includes(filtroServicos.toLowerCase()) ||
                        servico.colaborador_nome?.toLowerCase().includes(filtroServicos.toLowerCase())
                      )
                      .map((servico) => (
                        <Card key={servico.id} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                  <Badge variant="outline">{servico.veiculo_identificacao}</Badge>
                                  <span className="font-medium">{servico.destino}</span>
                                  <span className="text-gray-600">→ {servico.empresa_atendida}</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{servico.colaborador_nome}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(servico.data_hora_saida).toLocaleString('pt-BR')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Checklists */}
                            {servico.checklist_cinto && (
                              <div>
                                <h4 className="font-medium mb-2">Cinto de Segurança</h4>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Cinto:</span>
                                    {getStatusBadge(servico.checklist_cinto.cinto_seguranca_status)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Talabarte:</span>
                                    {getStatusBadge(servico.checklist_cinto.talabarte_status)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Mosquetão:</span>
                                    {getStatusBadge(servico.checklist_cinto.mosquetao_status)}
                                  </div>
                                </div>
                                {servico.checklist_cinto.observacoes && (
                                  <p className="text-sm text-gray-600 mt-2">{servico.checklist_cinto.observacoes}</p>
                                )}
                              </div>
                            )}
                            
                            {servico.checklist_escada && (
                              <div>
                                <h4 className="font-medium mb-2">Escadas</h4>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Simples:</span>
                                    {getStatusBadge(servico.checklist_escada.escada_simples_status)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Extensível:</span>
                                    {getStatusBadge(servico.checklist_escada.escada_extensivel_status)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Degraus:</span>
                                    {getStatusBadge(servico.checklist_escada.degraus_status)}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm">Travas:</span>
                                    {getStatusBadge(servico.checklist_escada.travas_status)}
                                  </div>
                                </div>
                                {servico.checklist_escada.observacoes && (
                                  <p className="text-sm text-gray-600 mt-2">{servico.checklist_escada.observacoes}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

