export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY
    });
}
