import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Model-specific knowledge bases
const modelKnowledge = {
    midjourney: {
        name: 'Midjourney',
        systemPrompt: `You are an expert Midjourney prompt engineer. Transform basic ideas into optimized Midjourney V7 prompts.

## Midjourney V7 Best Practices:
- Place most important elements FIRST (beginning words weighted more)
- Use parameters: --ar (aspect ratio), --v 7, --s (stylize 0-1000), --q 1
- Use :: for multi-prompting weights (e.g., "cat::2 garden::1")
- Use --no for exclusions (e.g., --no watermark)
- Lighting terms: volumetric lighting, rim light, golden hour, cinematic haze
- Be specific but don't over-constrain

Output format: [descriptive prompt] --ar [ratio] --v 7 --s [100-750] --q 1
Return ONLY the prompt, no explanations.`,
        supportsNegative: false,
        negativeMethod: 'Use --no [term] at end of prompt'
    },
    chatgpt: {
        name: 'ChatGPT Images',
        systemPrompt: `You are an expert at crafting prompts for ChatGPT's image generation (DALL-E 3).

## DALL-E 3 Best Practices:
- Write in NATURAL LANGUAGE, not keyword lists
- ChatGPT auto-expands prompts, so be descriptive
- Use complete sentences describing the scene
- Specify style as descriptions: "watercolor illustration", "80s vaporwave aesthetic"
- Include mood, lighting, composition naturally
- Cannot replicate specific artist styles by name

Output: Write a natural, flowing description (2-4 sentences).
Return ONLY the prompt, no explanations.`,
        supportsNegative: false,
        negativeMethod: 'DALL-E 3 does not support negative prompts'
    },
    ideogram: {
        name: 'Ideogram',
        systemPrompt: `You are an expert Ideogram prompt engineer, specializing in typography.

## Ideogram 3.0 Best Practices:
- Text in DOUBLE QUOTES: "Your Text Here"
- Keep text SHORT: 1-3 words (75% success), 4-8 words (40%)
- Specify typography: "bold sans-serif", "elegant script"
- Add: "large, centered, maximum legibility" for important text
- Use ONE strong style anchor
- Light negative prompts only

Output: [Subject], [style], "Text" in [font style]
Include negative prompt if helpful.
Return ONLY the prompt, no explanations.`,
        supportsNegative: true,
        defaultNegative: 'blurry, low quality, distorted text, misspelled words, bad typography, watermark'
    },
    veo: {
        name: 'Veo',
        systemPrompt: `You are an expert at crafting prompts for Google Veo video generation.

## Veo 3.1 Best Practices:
- Think like a FILM DIRECTOR
- Camera movements: dolly, tracking, crane, orbit, POV
- Composition: wide shot, close-up, low angle, Dutch angle
- Lighting: golden hour, rim lighting, volumetric light
- Describe motion and scene transitions
- Include audio/ambient sounds for Veo 3.1

Output: Cinematographic description with camera, lighting, movement.
Return ONLY the prompt, no explanations.`,
        supportsNegative: false,
        negativeMethod: 'Veo does not support negative prompts'
    },
    nanobananapro: {
        name: 'Nano Banana Pro',
        systemPrompt: `You are an expert at Nano Banana Pro prompts (Google's Gemini 3 image model).

## Nano Banana Pro Best Practices:
- It's a "Thinking" model - understands intent and composition
- Write like a Creative Director, NOT keyword spam
- NO "4k, masterpiece, trending on artstation" - it understands natural language
- Structure: [Subject] doing [Action] in [Location]. [Composition]. [Lighting]. [Style].
- Text: under 3 words, specify "bold sans-serif, centered, maximum legibility"

Output: Natural creative direction (2-4 sentences).
Return ONLY the prompt, no explanations.`,
        supportsNegative: true,
        defaultNegative: 'lowres, bad anatomy, bad hands, error, missing fingers, cropped, worst quality, low quality, jpeg artifacts, watermark, blurry'
    },
    general: {
        name: 'General',
        systemPrompt: `You are an expert image prompt engineer. Enhance basic ideas into detailed prompts.

## Best Practices:
- Subject, details, setting, style, mood, composition
- Quality terms: highly detailed, sharp focus, professional
- Lighting: golden hour, studio lighting, dramatic
- Be specific and descriptive

Output: Detailed comma-separated prompt.
Return ONLY the prompt, no explanations.`,
        supportsNegative: true,
        defaultNegative: 'blurry, low quality, distorted, ugly, watermark, signature, text, amateur'
    }
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { basePrompt, model, options = {} } = req.body;

        if (!basePrompt?.trim()) {
            return res.status(400).json({ error: 'Base prompt is required' });
        }

        const modelConfig = modelKnowledge[model] || modelKnowledge.general;

        // Build context from options
        const selectedOptions = [];
        if (options.artStyle) selectedOptions.push(`Art style: ${options.artStyle}`);
        if (options.lighting) selectedOptions.push(`Lighting: ${options.lighting}`);
        if (options.mood) selectedOptions.push(`Mood: ${options.mood}`);
        if (options.camera) selectedOptions.push(`Camera: ${options.camera}`);
        if (options.colorPalette) selectedOptions.push(`Colors: ${options.colorPalette}`);
        if (options.detail) selectedOptions.push(`Detail: ${options.detail}`);
        if (options.artist) selectedOptions.push(`Artist: ${options.artist}`);
        if (options.quality) selectedOptions.push(`Quality: ${options.quality}`);
        if (options.customAdditions) selectedOptions.push(`Additional: ${options.customAdditions}`);

        const optionsContext = selectedOptions.length > 0
            ? `\n\nUser preferences:\n${selectedOptions.join('\n')}`
            : '';

        const userMessage = `Transform this into an optimized ${modelConfig.name} prompt:\n\n"${basePrompt}"${optionsContext}`;

        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: modelConfig.systemPrompt,
            messages: [{ role: 'user', content: userMessage }]
        });

        const enhancedPrompt = response.content[0].text.trim();

        // Handle negative prompt
        let negativePrompt = null;
        if (modelConfig.supportsNegative) {
            negativePrompt = options.negativePrompt?.trim() || modelConfig.defaultNegative;
        }

        return res.status(200).json({
            success: true,
            model,
            modelName: modelConfig.name,
            originalPrompt: basePrompt,
            enhancedPrompt,
            negativePrompt,
            supportsNegative: modelConfig.supportsNegative,
            negativeMethod: modelConfig.negativeMethod || null
        });

    } catch (error) {
        console.error('API Error:', error);

        if (error.status === 401) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        return res.status(500).json({
            error: 'Failed to enhance prompt',
            details: error.message
        });
    }
}
