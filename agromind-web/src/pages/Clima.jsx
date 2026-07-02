import { useMemo, useState } from 'react'
import { CloudRain, CloudSun, Droplets, RefreshCw, Thermometer, Wind } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { agromindService } from '../services/agromind'
import { useAsync } from '../hooks/useAsync'
import { weatherSeries } from '../data/operations'
import { Button, Card, CardHeader, EmptyState, Select, Skeleton, Toast } from '../components/ui/Primitives'

export default function Clima() {
  const farms = useAsync(() => agromindService.farms(), [])
  const [farmId, setFarmId] = useState('')
  const [toast, setToast] = useState('')

  const selectedFarmId = farmId || farms.data?.[0]?.id
  const weather = useAsync(
    () => selectedFarmId ? agromindService.weather(selectedFarmId) : Promise.resolve(null),
    [selectedFarmId],
  )

  const current = weather.data ?? {
    temperature: 24.6,
    humidity: 65,
    windSpeed: 12,
    rainProbability: 40,
    measuredAt: new Date().toISOString(),
  }

  const refresh = async () => {
    await Promise.all([farms.refresh(), weather.refresh()])
    setToast('Dados climáticos atualizados.')
  }

  const selectedFarm = useMemo(() => farms.data?.find(farm => farm.id === selectedFarmId), [farms.data, selectedFarmId])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Monitoramento meteorológico</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Clima</h1>
          <p className="mt-1 text-sm text-muted">Condições atuais, chuva prevista e tendências para planejamento operacional.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedFarmId ?? ''} onChange={event => setFarmId(event.target.value)} disabled={farms.loading || !farms.data?.length}>
            {(farms.data ?? []).map(farm => <option key={farm.id} value={farm.id}>{farm.nome}</option>)}
          </Select>
          <Button variant="secondary" onClick={refresh}><RefreshCw size={16} /> Atualizar</Button>
        </div>
      </div>

      {!farms.loading && !farms.data?.length ? (
        <EmptyState icon={CloudSun} title="Nenhuma fazenda cadastrada" text="Cadastre uma fazenda para consultar o clima pela API." />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            {weather.loading ? Array.from({ length: 4 }).map((_, index) => <Card key={index} className="p-4"><Skeleton className="h-24" /></Card>) : (
              <>
                <Card className="p-4"><Thermometer className="text-warning" /><p className="mt-3 text-sm text-muted">Temperatura</p><p className="text-3xl font-extrabold">{current.temperature?.toFixed?.(1) ?? current.temperature} C</p></Card>
                <Card className="p-4"><Droplets className="text-info" /><p className="mt-3 text-sm text-muted">Umidade</p><p className="text-3xl font-extrabold">{current.humidity}%</p></Card>
                <Card className="p-4"><Wind className="text-muted" /><p className="mt-3 text-sm text-muted">Vento</p><p className="text-3xl font-extrabold">{current.windSpeed} km/h</p></Card>
                <Card className="p-4"><CloudRain className="text-info" /><p className="mt-3 text-sm text-muted">Prob. chuva</p><p className="text-3xl font-extrabold">{current.rainProbability}%</p></Card>
              </>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader title="Previsão operacional" eyebrow={selectedFarm ? `${selectedFarm.nome} - ${selectedFarm.cidade}` : 'Fazenda selecionada'} />
              <div className="h-80 p-4">
                <ResponsiveContainer>
                  <BarChart data={weatherSeries}>
                    <CartesianGrid stroke="#e6ece3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="rain" name="Chuva (mm)" fill="#256d8f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="humidity" name="Umidade (%)" fill="#256f49" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader title="Janela de manejo" eyebrow="Recomendações climáticas" />
              <div className="space-y-3 p-4">
                <div className="rounded-md bg-primary-soft p-3"><p className="font-bold text-primary">Aplicação</p><p className="mt-1 text-sm text-muted">Vento moderado. Validar rajadas antes da pulverização.</p></div>
                <div className="rounded-md bg-info-soft p-3"><p className="font-bold text-info">Irrigação</p><p className="mt-1 text-sm text-muted">Umidade dentro da faixa aceitável para a maioria das áreas.</p></div>
                <div className="rounded-md bg-warning-soft p-3"><p className="font-bold text-warning">Chuva</p><p className="mt-1 text-sm text-muted">Se a probabilidade ultrapassar 60%, reagendar operações de campo.</p></div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Tendência de temperatura" eyebrow="Série de apoio" />
            <div className="h-72 p-4">
              <ResponsiveContainer>
                <LineChart data={weatherSeries}>
                  <CartesianGrid stroke="#e6ece3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#647266' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" name="Temperatura" stroke="#a66812" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" name="Umidade" stroke="#256d8f" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
