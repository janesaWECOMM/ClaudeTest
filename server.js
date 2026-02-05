import express from 'express';
import cors from 'cors';
import { enhancePrompt } from './prompt-enhancer.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API endpoint for prompt enhancement
app.post('/api/enhance', async (req, res) => {
    try {
        const {
            basePrompt,
            model,
            options
        } = req.body;

        if (!basePrompt || !basePrompt.trim()) {
            return res.status(400).json({
                error: 'Base prompt is required'
            });
        }

        if (!model) {
            return res.status(400).json({
                error: 'Target model is required'
            });
        }

        const result = await enhancePrompt(basePrompt, model, options);

        res.json(result);
    } catch (error) {
        console.error('Error enhancing prompt:', error);

        // Check if it's an API key error
        if (error.message?.includes('API key') || error.status === 401) {
            return res.status(401).json({
                error: 'Invalid or missing API key. Please set ANTHROPIC_API_KEY environment variable.'
            });
        }

        res.status(500).json({
            error: 'Failed to enhance prompt. Please try again.',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('Warning: ANTHROPIC_API_KEY not set. API enhancement will not work.');
    }
});
