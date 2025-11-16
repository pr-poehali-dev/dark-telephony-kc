import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import WebRTCCall from '@/components/WebRTCCall';

interface Operator {
  id: number;
  name: string;
  status: 'online' | 'busy' | 'offline';
  callsToday: number;
  avgDuration: string;
  currentCall?: string;
}

interface Call {
  id: number;
  client: string;
  phone: string;
  duration: string;
  status: 'active' | 'waiting' | 'completed' | 'missed';
  operator?: string;
  timestamp: string;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalCalls: number;
  lastCall: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [activeCall, setActiveCall] = useState<boolean>(false);
  const [callTimer, setCallTimer] = useState(0);

  const [operators] = useState<Operator[]>([
    { id: 1, name: 'Анна Иванова', status: 'online', callsToday: 24, avgDuration: '4:32', currentCall: '+7 (999) 123-45-67' },
    { id: 2, name: 'Петр Смирнов', status: 'busy', callsToday: 18, avgDuration: '5:12', currentCall: '+7 (999) 234-56-78' },
    { id: 3, name: 'Мария Козлова', status: 'online', callsToday: 31, avgDuration: '3:45' },
    { id: 4, name: 'Иван Петров', status: 'offline', callsToday: 0, avgDuration: '0:00' },
  ]);

  const [calls] = useState<Call[]>([
    { id: 1, client: 'ООО "Ромашка"', phone: '+7 (999) 123-45-67', duration: '00:45', status: 'active', operator: 'Анна Иванова', timestamp: '14:32' },
    { id: 2, client: 'Сергей Николаев', phone: '+7 (999) 234-56-78', duration: '02:15', status: 'active', operator: 'Петр Смирнов', timestamp: '14:28' },
    { id: 3, client: 'Елена Волкова', phone: '+7 (999) 345-67-89', duration: '00:00', status: 'waiting', timestamp: '14:35' },
    { id: 4, client: 'ИП Сидоров', phone: '+7 (999) 456-78-90', duration: '04:23', status: 'completed', operator: 'Мария Козлова', timestamp: '14:15' },
  ]);

  const [clients] = useState<Client[]>([
    { id: 1, name: 'ООО "Ромашка"', phone: '+7 (999) 123-45-67', email: 'info@romashka.ru', totalCalls: 15, lastCall: '15 мин назад' },
    { id: 2, name: 'Сергей Николаев', phone: '+7 (999) 234-56-78', email: 's.nikolaev@mail.ru', totalCalls: 8, lastCall: '20 мин назад' },
    { id: 3, name: 'Елена Волкова', phone: '+7 (999) 345-67-89', email: 'e.volkova@gmail.com', totalCalls: 3, lastCall: '5 мин назад' },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall) {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const handleLogin = () => {
    if (login === '123' && password === '123') {
      setIsAuthenticated(true);
      toast.success('Добро пожаловать, Администратор!');
    } else {
      toast.error('Неверный логин или пароль');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCall = () => {
    if (!activeCall) {
      setActiveCall(true);
      setCallTimer(0);
      toast.success('Звонок начат');
    } else {
      setActiveCall(false);
      toast.info(`Звонок завершён. Длительность: ${formatTime(callTimer)}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Icon name="Phone" size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CallCenter Pro</h1>
            <p className="text-slate-400">Панель управления телефонией</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="login" className="text-slate-300">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Войти
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            Тестовый доступ: 123 / 123
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 dark">
      <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="Phone" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CallCenter Pro</h1>
              <p className="text-xs text-slate-400">Администратор</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-green-500/50 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Онлайн
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsAuthenticated(false);
                toast.info('Вы вышли из системы');
              }}
              className="text-slate-400 hover:text-white"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Активные звонки</p>
                <p className="text-3xl font-bold text-white mt-1">2</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Icon name="Phone" size={24} className="text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">В очереди</p>
                <p className="text-3xl font-bold text-white mt-1">1</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Операторов онлайн</p>
                <p className="text-3xl font-bold text-white mt-1">3/4</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Icon name="Users" size={24} className="text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Звонков сегодня</p>
                <p className="text-3xl font-bold text-white mt-1">73</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="calls" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="calls" className="data-[state=active]:bg-primary">
              <Icon name="Phone" size={16} className="mr-2" />
              Звонки
            </TabsTrigger>
            <TabsTrigger value="operators" className="data-[state=active]:bg-primary">
              <Icon name="Users" size={16} className="mr-2" />
              Операторы
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-primary">
              <Icon name="UserCircle" size={16} className="mr-2" />
              Клиенты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="space-y-4">
            <WebRTCCall onCallEnd={(duration) => {
              toast.success(`Звонок завершён. Длительность: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
            }} />

            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">История звонков</h2>
              <div className="space-y-3">
                {calls.map((call) => (
                  <Card key={call.id} className="bg-slate-900/50 border-slate-700 p-4 hover:bg-slate-900/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10 bg-slate-700">
                          <AvatarFallback className="bg-slate-700 text-white">
                            {call.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{call.client}</p>
                          <p className="text-slate-400 text-sm">{call.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {call.operator && (
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">Оператор</p>
                            <p className="text-white text-sm">{call.operator}</p>
                          </div>
                        )}
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Длительность</p>
                          <p className="text-white text-sm font-mono">{call.duration}</p>
                        </div>
                        <Badge 
                          variant={call.status === 'active' ? 'default' : call.status === 'waiting' ? 'secondary' : 'outline'}
                          className={
                            call.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            call.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            'bg-slate-700 text-slate-300'
                          }
                        >
                          {call.status === 'active' ? 'Активен' : 
                           call.status === 'waiting' ? 'Ожидает' : 
                           'Завершён'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="operators" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operators.map((operator) => (
                <Card key={operator.id} className="bg-slate-800/50 border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 bg-slate-700">
                        <AvatarFallback className="bg-slate-700 text-white">
                          {operator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold">{operator.name}</p>
                        <p className="text-slate-400 text-sm">ID: {operator.id}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        operator.status === 'online' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                        operator.status === 'busy' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                        'bg-slate-700 text-slate-300'
                      }
                    >
                      {operator.status === 'online' ? 'Онлайн' : 
                       operator.status === 'busy' ? 'Занят' : 
                       'Офлайн'}
                    </Badge>
                  </div>

                  {operator.currentCall && (
                    <Card className="bg-slate-900/50 border-slate-600 p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Phone" size={16} className="text-green-400" />
                        <span className="text-white">{operator.currentCall}</span>
                      </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Звонков сегодня</p>
                      <p className="text-2xl font-bold text-white">{operator.callsToday}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Средняя длительность</p>
                      <p className="text-2xl font-bold text-white font-mono">{operator.avgDuration}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Эффективность</span>
                      <span>{Math.round((operator.callsToday / 35) * 100)}%</span>
                    </div>
                    <Progress value={(operator.callsToday / 35) * 100} className="h-2" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Статистика за сегодня</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Всего звонков</span>
                    <span className="text-2xl font-bold text-white">73</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Принято</span>
                    <span className="text-2xl font-bold text-green-400">68</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Пропущено</span>
                    <span className="text-2xl font-bold text-red-400">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Средняя длительность</span>
                    <span className="text-2xl font-bold text-blue-400 font-mono">4:23</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Производительность</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Процент ответов</span>
                      <span>93%</span>
                    </div>
                    <Progress value={93} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Загруженность операторов</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-3 bg-slate-700" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Качество обслуживания</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-3" />
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-white mb-4">Часы наибольшей активности</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                  {[12, 18, 25, 32, 28, 35, 42, 38, 30, 25, 15, 8].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/30 hover:bg-primary/50 transition-colors rounded-t cursor-pointer"
                        style={{ height: `${height * 4}px` }}
                      ></div>
                      <span className="text-xs text-slate-500">{i + 9}:00</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">База клиентов</h2>
                <Button className="bg-primary hover:bg-primary/90">
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Добавить клиента
                </Button>
              </div>

              <div className="space-y-3">
                {clients.map((client) => (
                  <Card key={client.id} className="bg-slate-900/50 border-slate-700 p-4 hover:bg-slate-900/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 bg-slate-700">
                          <AvatarFallback className="bg-slate-700 text-white">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Icon name="Phone" size={14} />
                              {client.phone}
                            </span>
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <Icon name="Mail" size={14} />
                              {client.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-xs">Всего звонков</p>
                          <p className="text-white text-lg font-bold">{client.totalCalls}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-xs">Последний звонок</p>
                          <p className="text-white text-sm">{client.lastCall}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Icon name="MoreVertical" size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}