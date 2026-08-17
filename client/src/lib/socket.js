import { io as SocketIO } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create the singleton — not yet connected
const socket = SocketIO(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true, // sends the HttpOnly auth_token cookie automatically
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
