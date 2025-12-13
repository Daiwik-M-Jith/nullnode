#!/usr/bin/env node
/**
 * NullSector Lab Server
 * Ephemeral Docker-based hacking lab environment
 * 
 * Features:
 * - One-time access code validation
 * - Docker container orchestration
 * - Automatic cleanup after 15 minutes
 * - Rate limiting (3 attempts per IP per minute)
 * - Zero persistence (in-memory only)
 * - Network isolation (--network none)
 */

const express = require('express');
const Docker = require('dockerode');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const crypto = require('crypto');

const app = express();
const docker = new Docker();

// Configuration
const PORT = process.env.LAB_PORT || 3001;
const LAB_IMAGE = 'nullsector/lab:latest'; // Will be built with Dockerfile
const SESSION_TTL = 15 * 60 * 1000; // 15 minutes
const CODE_TTL = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// In-memory storage (ephemeral)
const accessCodes = new Map(); // code -> { createdAt, used, claimedAt }
const activeSessions = new Map(); // sessionId -> { containerId, port, createdAt }

// Rate limiter: 3 attempts per IP per minute
const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60,
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// CORS for lab access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/**
 * Generate a unique access code
 * Format: xxxx-xxxx (8 chars, alphanumeric lowercase with hyphen)
 */
function generateAccessCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Find available port for ttyd
 */
async function findAvailablePort() {
  const min = 8000;
  const max = 9000;
  const usedPorts = new Set(
    Array.from(activeSessions.values()).map(s => s.port)
  );
  
  for (let i = 0; i < 100; i++) {
    const port = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!usedPorts.has(port)) {
      return port;
    }
  }
  throw new Error('No available ports');
}

/**
 * Spawn a Docker container with ttyd terminal server
 */
async function spawnLabContainer(sessionId, port) {
  try {
    console.log(`[Lab] Spawning container for session ${sessionId} on port ${port}`);
    
    const container = await docker.createContainer({
      Image: LAB_IMAGE,
      name: `nullsector-lab-${sessionId}`,
      Hostname: 'nullsector-lab',
      Env: [
        'TERM=xterm-256color',
        'LAB_SESSION=' + sessionId,
      ],
      ExposedPorts: {
        '7681/tcp': {}, // ttyd default port
      },
      HostConfig: {
        NetworkMode: 'none', // CRITICAL: No internet access
        PortBindings: {
          '7681/tcp': [{ HostPort: port.toString() }],
        },
        Memory: 512 * 1024 * 1024, // 512MB limit
        MemorySwap: 512 * 1024 * 1024,
        CpuShares: 512,
        AutoRemove: true, // Auto-cleanup on stop
      },
    });

    await container.start();
    console.log(`[Lab] Container ${container.id} started successfully`);
    
    return container.id;
  } catch (error) {
    console.error('[Lab] Failed to spawn container:', error.message);
    throw new Error('Failed to create lab environment');
  }
}

/**
 * Stop and remove a container
 */
async function cleanupContainer(containerId) {
  try {
    const container = docker.getContainer(containerId);
    await container.stop({ t: 5 });
    console.log(`[Lab] Container ${containerId} stopped and removed`);
  } catch (error) {
    console.error(`[Lab] Cleanup failed for ${containerId}:`, error.message);
  }
}

/**
 * Background cleanup task
 */
function startCleanupTask() {
  setInterval(() => {
    const now = Date.now();
    
    // Clean expired codes
    for (const [code, data] of accessCodes.entries()) {
      if (now - data.createdAt > CODE_TTL) {
        accessCodes.delete(code);
        console.log(`[Cleanup] Expired code: ${code}`);
      }
    }
    
    // Clean expired sessions
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now - session.createdAt > SESSION_TTL) {
        console.log(`[Cleanup] Terminating expired session: ${sessionId}`);
        cleanupContainer(session.containerId).then(() => {
          activeSessions.delete(sessionId);
        });
      }
    }
    
    console.log(`[Status] Active codes: ${accessCodes.size}, Active sessions: ${activeSessions.size}`);
  }, CLEANUP_INTERVAL);
}

// ===== API ENDPOINTS =====

/**
 * POST /api/lab/generate-code
 * Generate a new access code (called by Discord bot)
 * Requires secret key for authorization
 */
app.post('/api/lab/generate-code', (req, res) => {
  const { secret } = req.body;
  
  // Simple secret validation (set via environment variable)
  const expectedSecret = process.env.LAB_BOT_SECRET || 'change-me-in-production';
  if (secret !== expectedSecret) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const code = generateAccessCode();
  accessCodes.set(code, {
    createdAt: Date.now(),
    used: false,
    claimedAt: null,
  });
  
  console.log(`[Bot] Generated code: ${code}`);
  res.json({ code });
});

/**
 * POST /api/lab/claim
 * Validate access code and spawn lab container
 */
app.post('/api/lab/claim', async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  
  // Validate secret header
  const expectedSecret = process.env.LAB_BOT_SECRET || 'PY7iexIRYpmeLEK0lWS76eeEg7c22XcD';
  const providedSecret = req.headers['x-lab-bot-secret'];
  
  if (providedSecret !== expectedSecret) {
    console.log(`[Claim] Invalid secret from ${clientIp}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication',
    });
  }
  
  try {
    // Rate limiting
    await rateLimiter.consume(clientIp);
  } catch (error) {
    console.log(`[RateLimit] Blocked IP: ${clientIp}`);
    return res.status(429).json({
      error: 'Too many attempts',
      message: 'Rate limit exceeded. Please try again in 1 minute.',
    });
  }
  
  const { code } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Access code is required',
    });
  }
  
  const codeData = accessCodes.get(code.toLowerCase().trim());
  
  if (!codeData) {
    console.log(`[Claim] Invalid code attempted: ${code} from ${clientIp}`);
    return res.status(404).json({
      error: 'Invalid code',
      message: 'Access code not found or expired',
    });
  }
  
  if (codeData.used) {
    console.log(`[Claim] Already used code: ${code}`);
    return res.status(409).json({
      error: 'Code already used',
      message: 'This access code has already been claimed',
    });
  }
  
  const now = Date.now();
  if (now - codeData.createdAt > CODE_TTL) {
    accessCodes.delete(code);
    console.log(`[Claim] Expired code: ${code}`);
    return res.status(410).json({
      error: 'Code expired',
      message: 'Access code has expired (10 minute limit)',
    });
  }
  
  // Mark code as used
  codeData.used = true;
  codeData.claimedAt = now;
  
  try {
    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    const port = await findAvailablePort();
    
    // Spawn container
    const containerId = await spawnLabContainer(sessionId, port);
    
    // Store session
    activeSessions.set(sessionId, {
      containerId,
      port,
      createdAt: now,
    });
    
    console.log(`[Success] Lab created for code ${code}, session ${sessionId}`);
    
    // Return lab URL
    res.json({
      success: true,
      sessionId,
      url: `http://localhost:${port}`,
      expiresIn: SESSION_TTL / 1000, // seconds
      message: 'Lab environment ready! Session will expire in 15 minutes.',
    });
    
    // Schedule session cleanup
    setTimeout(() => {
      if (activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);
        cleanupContainer(session.containerId).then(() => {
          activeSessions.delete(sessionId);
        });
      }
    }, SESSION_TTL);
    
  } catch (error) {
    console.error('[Claim] Failed to spawn lab:', error);
    codeData.used = false; // Allow retry
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to create lab environment. Please try again.',
    });
  }
});

/**
 * GET /api/lab/status/:sessionId
 * Check if a session is still active
 */
app.get('/api/lab/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return res.json({ active: false, expired: true });
  }
  
  const remaining = SESSION_TTL - (Date.now() - session.createdAt);
  
  res.json({
    active: true,
    expired: false,
    remainingSeconds: Math.max(0, Math.floor(remaining / 1000)),
  });
});

/**
 * GET /api/lab/stats
 * System statistics (for monitoring)
 */
app.get('/api/lab/stats', (req, res) => {
  res.json({
    activeCodes: accessCodes.size,
    activeSessions: activeSessions.size,
    uptime: process.uptime(),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     NullSector Lab Server - ACTIVE               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🐳 Docker image: ${LAB_IMAGE}`);
  console.log(`⏱️  Session TTL: ${SESSION_TTL / 60000} minutes`);
  console.log(`⏱️  Code TTL: ${CODE_TTL / 60000} minutes`);
  console.log('');
  console.log('⚠️  Security features:');
  console.log('   ✓ Network isolation (--network none)');
  console.log('   ✓ Rate limiting (3 attempts/IP/min)');
  console.log('   ✓ In-memory storage only');
  console.log('   ✓ Auto-cleanup after 15 minutes');
  console.log('');
  
  // Start background cleanup
  startCleanupTask();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Shutdown] Cleaning up all active sessions...');
  
  const cleanupPromises = Array.from(activeSessions.values()).map(session =>
    cleanupContainer(session.containerId)
  );
  
  await Promise.all(cleanupPromises);
  console.log('[Shutdown] Cleanup complete. Goodbye!');
  process.exit(0);
});
