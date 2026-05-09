'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { recordEventOnChain, getSolanaExplorerUrl } from './lib/solana';

interface BusinessEvent {
  id: string;
  companyId: string;
  employeeName: string;
  eventType: string;
  description: string;
  riskLevel: number;
  status: 'pending' | 'blocked' | 'approved' | 'rejected';
  timestamp: Date;
  txHash?: string;
}

const RISK_COLORS = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const s = io('http://localhost:3001');
    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('new_event', (event: BusinessEvent) => {
      setEvents((prev) => [event, ...prev]);
    });

    s.on('alert', (data: { message: string }) => {
      setAlerts((prev) => [data.message, ...prev].slice(0, 5));
    });

    s.on('event_updated', (updated: BusinessEvent) => {
      setEvents((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
    });

    s.emit('get_events', {}, (data: BusinessEvent[]) => {
      setEvents(data || []);
    });

    return () => { s.disconnect(); };
  }, []);

  const simulateEvent = async (eventType: string, description: string, amount?: number) => {
    if (!socket) return;
    
    const txHash = await recordEventOnChain(eventType, 75, description);
    
    socket.emit('create_event', {
      companyId: 'ACME-CORP',
      employeeName: ['Carlos R.', 'María L.', 'Juan P.'][Math.floor(Math.random() * 3)],
      eventType,
      description,
      amount,
      txHash,
    });
  };

  const handleApprove = (eventId: string, approved: boolean) => {
    if (!socket) return;
    socket.emit('approve_event', { eventId, approved });
  };

  const getRiskColor = (level: number) => {
    if (level < 50) return RISK_COLORS.low;
    if (level < 80) return RISK_COLORS.medium;
    return RISK_COLORS.high;
  };
  
  const connectWallet = useCallback(async () => {
    try {
      const { solana } = window as any;
      if (!solana) {
        alert('Instala Phantom Wallet');
        return;
      }
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6 text-white">
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--glow-cyan)]">
            Enterprise Decision Firewall
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-[0.08em] text-white">
            Security Operations
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[rgba(59,130,246,0.14)] bg-[rgba(17,24,39,0.72)] px-3 py-2 font-mono text-xs text-[var(--text-secondary)]">
            <span className={`size-2 rounded-full ${connected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.85)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.85)]'}`} />
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <button
            onClick={connectWallet}
            className="rounded-full border border-[rgba(139,92,246,0.32)] bg-[rgba(139,92,246,0.12)] px-4 py-2 font-body text-xs font-semibold text-[var(--glow-violet)] transition hover:bg-[rgba(139,92,246,0.2)]"
          >
            {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Conectar Wallet'}
          </button>
        </div>
      </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="col-span-12">
            {alerts.map((alert, i) => (
              <div key={i} className="mb-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {alert}
              </div>
            ))}
          </div>
        )}

        {/* Simulate Events */}
        <div className="bb-card col-span-12 p-4">
          <p className="mb-3 font-body text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Simular Eventos</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => simulateEvent('FINANCIAL_CHANGE', 'Aumento de límite financiero', 15000)}
              className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-3 py-1.5 text-xs text-yellow-400 transition hover:bg-yellow-500/30">
              Cambio Financiero
            </button>
            <button onClick={() => simulateEvent('DATA_EXPORT', 'Exportar base de datos clientes')}
              className="rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/30">
              Exportar Datos
            </button>
            <button onClick={() => simulateEvent('PERMISSION_CHANGE', 'Modificar permisos de usuario admin')}
              className="rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-1.5 text-xs text-orange-400 transition hover:bg-orange-500/30">
              Cambio Permisos
            </button>
            <button onClick={() => simulateEvent('CONFIG_CHANGE', 'Modificar configuración del sistema')}
              className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs text-blue-400 transition hover:bg-blue-500/30">
              Config Sistema
            </button>
            <button onClick={() => simulateEvent('ACCESS_AFTER_HOURS', 'Acceso fuera de horario laboral')}
              className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-3 py-1.5 text-xs text-purple-400 transition hover:bg-purple-500/30">
              Acceso Nocturno
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-12 grid grid-cols-4 gap-4">
          {[
            { label: 'Total Eventos', value: events.length, color: 'text-white' },
            { label: 'Bloqueados', value: events.filter(e => e.status === 'blocked').length, color: 'text-red-400' },
            { label: 'Pendientes', value: events.filter(e => e.status === 'pending').length, color: 'text-yellow-400' },
            { label: 'Aprobados', value: events.filter(e => e.status === 'approved').length, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bb-card p-4">
              <p className="font-body text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{stat.label}</p>
              <p className={`mt-1 font-mono text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Event Timeline */}
        <div className="bb-card col-span-12 p-4">
          <p className="mb-4 font-body text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Timeline de Eventos</p>
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">Simula un evento para comenzar</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-4 rounded-xl border border-[rgba(59,130,246,0.1)] bg-[rgba(2,6,23,0.38)] p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{event.employeeName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[event.status]}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className={`text-xs font-bold ${getRiskColor(event.riskLevel)}`}>
                        RIESGO: {event.riskLevel}%
                      </span>
                    </div>
                    <p className="text-xs text-white/60">{event.description}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{new Date(event.timestamp).toLocaleTimeString()}</p>
                    {event.txHash && (
                      <a
                        href={getSolanaExplorerUrl(event.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block font-mono text-xs text-purple-400 hover:text-purple-300"
                      >
                        Ver en Solana Explorer
                      </a>
                    )}
                  </div>
                  {(event.status === 'blocked' || event.status === 'pending') && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(event.id, true)}
                        className="rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1 text-xs text-green-400 transition hover:bg-green-500/30">
                        Aprobar
                      </button>
                      <button onClick={() => handleApprove(event.id, false)}
                        className="rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/30">
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
