const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : [])
].filter(Boolean).map(origin => origin.trim()).filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const parsed = new URL(origin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return true;
    return ['.render.com', '.onrender.com', '.vercel.app', '.netlify.app'].some((suffix) => parsed.hostname.endsWith(suffix));
  } catch {
    return false;
  }
};

const initSocket = (httpServer) => {
  const ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Socket CORS policy violation for origin: ${origin}`));
        }
      },
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true
    }
  });

  ioInstance.use(async (socket, next) => {
    // 1. Allow ICCC operator passcode
    const passcode = socket.handshake.auth?.passcode || socket.handshake.headers?.['x-iccc-passcode'];
    const validPasscodes = ['COMMAND112', 'OPERATOR2026', 'SAFEERA2026', process.env.ICCC_PASSCODE].filter(Boolean);
    if (passcode && validPasscodes.includes(passcode.trim())) {
      socket.isIcccOperator = true;
      socket.userId = 'operator_' + socket.id;
      socket.user = { name: 'ICCC Control Room Operator', role: 'operator' };
      return next();
    }

    // 2. Citizen token authentication
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('name phone email');
        if (user) {
          socket.userId = decoded.userId;
          socket.user = user;
          return next();
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          const decoded = jwt.decode(token);
          if (decoded && decoded.userId) {
            socket.userId = decoded.userId;
            socket.user = { name: 'Citizen', role: 'user' };
            return next();
          }
        }
      }
    }

    // 3. Fallback for guest or development
    if (process.env.NODE_ENV !== 'production') {
      socket.userId = 'guest_' + socket.id;
      socket.user = { name: 'Guest User', role: 'user' };
      return next();
    }

    return next(new Error('Authentication required'));
  });

  ioInstance.on('connection', (socket) => {
    // Auto-join operator to iccc_room
    if (socket.isIcccOperator) {
      socket.join("iccc_room");
      socket.emit('iccc-joined', { success: true, message: 'Connected to ICCC Command Stream' });
      console.log(`[SOCKET] Operator ${socket.id} joined iccc_room`);
    }

    // Auto-join user's own room
    if (socket.userId) {
      socket.join("sos_" + socket.userId);
      console.log(`User ${socket.user?.name || socket.userId} connected and joined sos_${socket.userId}`);
    }
    
    // Explicit user room subscription
    socket.on('join-sos-room', (userId) => {
      if (userId) {
        socket.join("sos_" + userId);
        console.log(`[SOCKET] Socket ${socket.id} joined sos_${userId}`);
      }
    });

    // Guardians joining to watch a user's SOS
    socket.on('watchSOS', (watchUserId) => {
      if (watchUserId) {
        socket.join("sos_" + watchUserId);
        console.log(`[SOCKET] Guardian socket ${socket.id} watching sos_${watchUserId}`);
      }
    });

    // ICCC Control Room Operator joining global command room
    socket.on('joinICCC', (payload) => {
      const passcode = payload?.passcode;
      const validPasscodes = ['COMMAND112', 'OPERATOR2026', process.env.ICCC_PASSCODE].filter(Boolean);
      const allowedEmails = (process.env.ICCC_OPERATOR_EMAILS || 'admin@safeera.org,operator@safeera.org,command@safeera.org')
        .split(',')
        .map(e => e.trim().toLowerCase());

      const isAuthorized = (passcode && validPasscodes.includes(passcode.trim())) ||
                           (socket.user?.email && allowedEmails.includes(socket.user.email.toLowerCase())) ||
                           (socket.user?.role === 'admin' || socket.user?.role === 'operator') ||
                           (process.env.NODE_ENV !== 'production');

      if (isAuthorized) {
        socket.join('iccc_room');
        socket.emit('iccc-joined', { success: true, message: 'Connected to ICCC Command Stream' });
        console.log(`Operator ${socket.user?.name || socket.id} joined iccc_room`);
      } else {
        socket.emit('iccc-error', { success: false, message: 'Unauthorized operator access' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.name || socket.id} disconnected`);
    });
  });

  io = ioInstance;
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
};

module.exports = initSocket;
module.exports.getIO = getIO;
