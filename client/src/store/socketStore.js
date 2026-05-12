import { create } from 'zustand';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  liveThreats: [],
  liveAlerts: [],
  networkActivity: [],
  systemStats: null,

  connect: (token) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      socket.emit('subscribe:threats');
      socket.emit('subscribe:alerts');
      socket.emit('subscribe:network');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('threat:detected', (threat) => {
      set((state) => ({
        liveThreats: [threat, ...state.liveThreats].slice(0, 100),
      }));

      // Show toast for critical/high threats
      if (threat.severity === 'critical') {
        toast.error(`🚨 CRITICAL: ${threat.type?.replace(/_/g, ' ')} from ${threat.sourceIp}`, {
          duration: 6000,
        });
      } else if (threat.severity === 'high') {
        toast(`⚠️ HIGH: ${threat.type?.replace(/_/g, ' ')} from ${threat.sourceIp}`, {
          duration: 4000,
          icon: '⚠️',
        });
      }
    });

    socket.on('alert:created', (alert) => {
      set((state) => ({
        liveAlerts: [alert, ...state.liveAlerts].slice(0, 50),
      }));
    });

    socket.on('network:activity', (activity) => {
      set((state) => ({
        networkActivity: [activity, ...state.networkActivity].slice(0, 200),
      }));
    });

    socket.on('system:stats', (stats) => {
      set({ systemStats: stats });
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  clearLiveThreats: () => set({ liveThreats: [] }),
  clearLiveAlerts: () => set({ liveAlerts: [] }),
}));
