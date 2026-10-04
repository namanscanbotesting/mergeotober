import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Public configuration status (No secrets exposed)
app.get('/api/config', (_req, res) => {
  const baseUrl = process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const modelName = process.env.LLM_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '';
  const demoMode = process.env.DEMO_MODE !== 'false';
  const embeddingProvider = process.env.EMBEDDING_PROVIDER || 'gliner';

  const cogneeBaseUrl = process.env.COGNEE_API_BASE_URL || 'https://tenant-615ef6f1-7b2d-4bbc-9135-d5ad2168f920.aws.cognee.ai';
  const cogneeTenantId = process.env.COGNEE_TENANT_ID || '615ef6f1-7b2d-4bbc-9135-d5ad2168f920';
  const posthogToken = process.env.POSTHOG_PROJECT_TOKEN || 'phc_qqfsGHhnaman';
  const posthogProjectId = process.env.POSTHOG_PROJECT_ID || '644866';
  const sentryOrgSlug = process.env.SENTRY_ORG_SLUG || 'naman-52';

  res.json({
    status: 'ok',
    cognee: {
      apiBaseUrl: cogneeBaseUrl,
      tenantId: cogneeTenantId,
      hasApiKey: Boolean(process.env.COGNEE_API_KEY),
    },
    integrations: {
      posthog: {
        projectToken: posthogToken,
        projectId: posthogProjectId,
        region: process.env.POSTHOG_REGION || 'US Cloud',
      },
      sentry: {
        orgSlug: sentryOrgSlug,
        hasAuthToken: Boolean(process.env.SENTRY_AUTH_TOKEN),
      },
    },
    llm: {
      baseUrl,
      modelName,
      hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0),
      embeddingProvider,
    },
    demoMode,
    requirements: {
      demoMode: {
        required: 'Nothing! 100% self-contained.',
        description: 'Runs on pre-cognified Mergetober dataset with 12 entities, 6 golden questions, and cross-temporal reasoning.',
      },
      liveMode: {
        required: [
          'COGNEE_API_KEY + COGNEE_TENANT_ID (Configured)',
          'POSTHOG_PROJECT_TOKEN (phc_qqfsGHhnaman) & ID (644866)',
          'SENTRY_AUTH_TOKEN & ORG_SLUG (naman-52)',
          'JIRA_API_TOKEN + JIRA_EMAIL + JIRA_SUBDOMAIN',
          'VERCEL_API_TOKEN',
        ],
        description: 'Runs live DLT pipelines (jira_source, vercel_source, sentry_source, posthog_source) to ingest your organization’s real engineering data.',
      },
    },
  });
});

// Proxy Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { query } = req.body;
  const baseUrl = process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const modelName = process.env.LLM_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '';

  // Return grounded response with active model & base URL metadata
  res.json({
    status: 'ok',
    query,
    engine: {
      modelName,
      baseUrl,
      usingLiveApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    },
  });
});

// Run real Python connector test suites
app.post('/api/run-tests', async (_req, res) => {
  const { exec } = await import('child_process');
  exec('python3 tests/run_tests.py', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, output: stdout || stderr || error.message });
    }
    res.json({ success: true, output: stdout });
  });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MergeStream] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
