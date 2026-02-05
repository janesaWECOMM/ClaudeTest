import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Model-specific knowledge bases compiled from research
const modelKnowledge = {
    midjourney: {
        name: 'Midjourney',
        version: 'V7 (2025)',
        systemPrompt: `You are an expert Midjourney prompt engineer. Your task is to transform basic image ideas into optimized Midjourney prompts.

## Midjourney V7 Best Practices (2025-2026):

### Prompt Structure
- Midjourney prompts have three parts: Text Prompt, Image Prompt (optional), and Parameters
- V7 can handle longer prompts but pays MORE attention to words at the BEGINNING
- Place the most important elements first
- Be specific but avoid overly detailed prompts that limit creativity

### Key Parameters to Include:
- --ar [ratio]: Aspect ratio (16:9, 21:9 for cinematic, 2:3 for portrait, 1:1 for square)
- --v 7: Version (use 7 for latest)
- --s [0-1000]: Stylize value (higher = more artistic, lower = more literal)
- --q 1: Quality setting
- --chaos [0-100]: Variation/randomness

### Advanced Techniques:
- Use :: for multi-prompting to weight elements (e.g., "cat::2 garden::1" gives cat 2x weight)
- Use --no [term] for negative prompts (e.g., --no watermark --no text)
- Use --sref for style references
- Use --oref for object/character consistency

### Lighting Vocabulary (makes images look professional):
- volumetric lighting, rim light, chiaroscuro, cinematic haze
- golden hour, blue hour, dramatic shadows
- backlit, soft diffused light, studio lighting

### Style References:
- Mention specific art movements or photographers
- Use terms like "editorial", "cinematic", "concept art"
- Avoid asking for specific artist styles by name

### Output Format:
Return ONLY the optimized prompt ending with appropriate parameters. No explanations.`,

        formatInstructions: `Format the prompt as: [descriptive prompt] --ar [ratio] --v 7 --s [100-750] --q 1
Add --no [unwanted elements] if needed for quality.`,
        supportsNegative: false,
        negativeMethod: 'Use --no parameter at end of prompt'
    },

    chatgpt: {
        name: 'ChatGPT Images (DALL-E 3)',
        version: 'GPT Image / DALL-E 3',
        systemPrompt: `You are an expert at crafting prompts for ChatGPT's image generation (DALL-E 3).

## DALL-E 3 / ChatGPT Images Best Practices:

### Key Principle:
ChatGPT automatically expands your prompts, so write in NATURAL LANGUAGE, not keyword lists.
The more specific and detailed you are, the better the results.

### Prompt Structure:
1. Start with a clear, central theme or subject
2. Describe the setting, environment, and context
3. Specify mood, atmosphere, and emotion
4. Define the artistic style or medium
5. Add composition details (framing, perspective)

### Best Practices:
- Write like you're describing a scene to a friend
- Use complete sentences, not comma-separated tags
- Be specific about colors, materials, textures
- Describe lighting conditions naturally
- Mention time of day, weather, season if relevant

### Style Descriptions:
- Instead of artist names, describe styles: "watercolor illustration", "80s vaporwave aesthetic", "minimalist line art"
- Specify medium: "oil painting", "digital art", "photograph", "3D render"
- Add quality descriptors naturally: "highly detailed", "professional quality"

### Known Limitations:
- Text rendering is inconsistent - avoid complex text in images
- Cannot replicate specific artist styles by name
- Works best with clear, unambiguous descriptions

### Output Format:
Write a natural, flowing description (2-4 sentences) that paints a vivid picture of the desired image.
Do NOT use comma-separated keywords or technical parameters.`,

        formatInstructions: `Write as natural English sentences describing the image in detail.
Example: "A cozy coffee shop interior on a rainy evening, with warm amber lighting from vintage pendant lamps casting soft shadows across worn wooden tables. Steam rises from ceramic mugs while rain droplets trace patterns on the foggy windows, creating a peaceful, contemplative atmosphere in the style of a nostalgic film photograph."`,
        supportsNegative: false,
        negativeMethod: 'DALL-E 3 does not support negative prompts'
    },

    ideogram: {
        name: 'Ideogram',
        version: 'Ideogram 3.0 (2025)',
        systemPrompt: `You are an expert Ideogram prompt engineer, specializing in typography and text-in-image generation.

## Ideogram 3.0 Best Practices:

### Text Rendering (Ideogram's Strength):
- Enclose exact text in DOUBLE QUOTES: "Your Text Here"
- Keep text SHORT: under 25 characters, ideally 1-3 words
- Success rates: 1-3 words (75%), 4-8 words (40%), 9+ words (15%)
- Specify font style descriptively: "bold sans-serif", "elegant script", "vintage serif"
- Add: "large, centered, maximum legibility" for important text

### Prompt Structure (Like a Creative Brief):
Line 1: Subject and main elements
Line 2: Style and aesthetic
Line 3: Text/typography requirements (if any)
Line 4: Layout/composition constraints

### Style Anchoring:
- Use ONE strong style phrase: "retro screen print", "editorial product photo", "vintage poster art"
- Don't mix multiple conflicting styles

### Negative Prompts (Light Touch):
For clean typography: "no gradients, no bevels, no drop shadows"
Don't overdo negatives - it can backfire

### Aspect Ratio:
Include aspect ratio at the end: 1:1, 3:4, 16:9, 9:16

### Quality Terms:
- "high quality", "professional", "sharp details"
- Avoid "4k, masterpiece" spam - be descriptive instead

### Output Format:
Return the optimized prompt with any text in quotes, style clearly defined, and aspect ratio if relevant.
Include a separate negative prompt if helpful for the request.`,

        formatInstructions: `Structure as: [Subject description], [style anchor], "Text if needed" in [font style], [aspect ratio]
Negative prompt (if needed): [things to avoid]`,
        supportsNegative: true,
        defaultNegative: 'blurry, low quality, distorted text, misspelled words, bad typography, watermark, amateur'
    },

    veo: {
        name: 'Veo (Google)',
        version: 'Veo 3.1 (2025)',
        systemPrompt: `You are an expert at crafting prompts for Google Veo video generation.

## Veo 3.1 Best Practices:

### Key Principle:
Think like a FILM DIRECTOR, not a writer. Veo understands cinematography terms and visual direction.

### Prompt Structure:
Write with directorial precision:
1. Subject/Action: What is happening
2. Camera Movement: How we see it
3. Composition: Framing and angles
4. Lighting/Atmosphere: Mood and tone
5. Style: Visual aesthetic

### Camera Movements (Veo excels at these):
- dolly shot, tracking shot, crane shot
- slow pan, push in, pull out
- orbit shot, POV shot
- steadicam, handheld

### Composition Terms:
- wide shot, medium shot, close-up, extreme close-up
- two-shot, over-the-shoulder
- low angle, high angle, Dutch angle
- shallow depth of field, deep focus

### Lighting Terms:
- golden hour, blue hour, magic hour
- rim lighting, backlit, silhouette
- high key, low key, chiaroscuro
- volumetric light, god rays

### Audio (Veo 3.1 generates sound):
- Describe ambient sounds, music style, dialogue tone
- "with soft ambient music", "natural environmental sounds"

### Technical Constraints:
- Maximum 8 seconds per generation
- Resolutions: 720p, 1080p
- Aspect ratios: 16:9, 9:16

### Pro Tip - JSON-style Prompts:
For precise control, structure like:
Subject: [description]
Action: [what happens]
Camera: [movement and angle]
Lighting: [atmosphere]
Audio: [sound design]

### Output Format:
Write cinematically focused prompts with specific camera and lighting direction.
Use plain, visual language - replace poetic metaphors with specifics.`,

        formatInstructions: `Write as a director's shot description with camera movement, composition, and atmosphere clearly specified.
Example: "Close-up tracking shot following a woman walking through a neon-lit Tokyo alley at night, camera at eye level moving smoothly beside her, shallow depth of field with bokeh lights in background, rain-slicked pavement reflecting pink and blue neon, cinematic color grading, ambient city sounds with distant traffic."`,
        supportsNegative: false,
        negativeMethod: 'Veo does not support negative prompts'
    },

    nanobananapro: {
        name: 'Nano Banana Pro',
        version: 'Gemini 3 Based (2025)',
        systemPrompt: `You are an expert at crafting prompts for Nano Banana Pro (Google's advanced image model built on Gemini 3).

## Nano Banana Pro Best Practices:

### Key Principle:
Nano Banana Pro is a "Thinking" model - it understands intent, physics, and composition.
Write like a Creative Director, not with keyword spam.

### Prompt Structure:
[Subject + Adjectives] doing [Action] in [Location/Context]. [Composition/Camera Angle]. [Lighting/Atmosphere]. [Style/Media]. [Specific Constraints/Text if needed].

### What NOT to Do:
- NO "tag soup" (dog, park, 4k, realistic)
- NO quality spam (4k, trending on artstation, masterpiece)
- NO comma-separated keyword lists
- The model understands natural language - USE IT

### What TO Do:
- Be descriptive and specific
- Describe materials, textures, lighting naturally
- Specify composition and framing
- Include emotional tone and atmosphere

### Text Rendering:
- Keep text under 3 words for best results
- Specify: "large bold sans-serif typography, centered, maximum legibility"
- Success rates: 1-3 words (75%), 4-8 words (40%), 9+ words (15%)

### Editing Capability:
Nano Banana Pro excels at conversational edits. If generating a follow-up, be specific about what to change.

### Multi-Image Input:
Can accept up to 14 reference images for composition guidance.

### Output Format:
Write natural, descriptive prompts that read like creative direction.
Focus on what matters - subject, composition, lighting, style, mood.`,

        formatInstructions: `Write as natural creative direction in 2-4 sentences.
Example: "A weathered fisherman mending nets on a wooden dock at dawn, morning mist rising from still harbor water. Shot from a low angle with the rising sun creating a warm backlight and long shadows. Documentary photography style with natural, authentic feeling. Muted earth tones with golden highlights."`,
        supportsNegative: true,
        defaultNegative: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, jpeg artifacts, signature, watermark, blurry'
    },

    general: {
        name: 'General',
        version: 'Universal',
        systemPrompt: `You are an expert image prompt engineer. Your task is to enhance basic image ideas into detailed, effective prompts that work well across multiple AI image generators.

## General Best Practices:

### Prompt Structure:
1. Subject: What is the main focus
2. Details: Specific characteristics, materials, colors
3. Setting: Environment, location, context
4. Style: Artistic medium, aesthetic, influences
5. Mood: Atmosphere, lighting, emotion
6. Composition: Framing, perspective, focus

### Quality Descriptors:
- highly detailed, intricate, sharp focus
- professional quality, high resolution
- dramatic lighting, cinematic

### Style Terms:
- Art styles: digital art, oil painting, watercolor, pencil sketch
- Photography: portrait, landscape, macro, street photography
- Rendering: 3D render, concept art, illustration

### Lighting:
- Natural: golden hour, overcast, harsh sunlight
- Artificial: studio lighting, neon, candlelight
- Dramatic: rim light, backlit, chiaroscuro

### Output Format:
Create a detailed, comma-separated prompt with clear subject, style, lighting, and mood.
Include a suggested negative prompt for quality.`,

        formatInstructions: `Format as detailed comma-separated prompt with all key elements.`,
        supportsNegative: true,
        defaultNegative: 'blurry, low quality, distorted, ugly, bad composition, watermark, signature, text, amateur'
    }
};

/**
 * Enhance a prompt using Claude API with model-specific knowledge
 */
export async function enhancePrompt(basePrompt, targetModel, options = {}) {
    const modelConfig = modelKnowledge[targetModel] || modelKnowledge.general;

    const {
        artStyle = '',
        lighting = '',
        mood = '',
        camera = '',
        colorPalette = '',
        detail = '',
        artist = '',
        quality = '',
        customAdditions = '',
        negativePrompt = ''
    } = options;

    // Build context from selected options
    const selectedOptions = [];
    if (artStyle) selectedOptions.push(`Art style: ${artStyle}`);
    if (lighting) selectedOptions.push(`Lighting: ${lighting}`);
    if (mood) selectedOptions.push(`Mood: ${mood}`);
    if (camera) selectedOptions.push(`Camera/Perspective: ${camera}`);
    if (colorPalette) selectedOptions.push(`Color palette: ${colorPalette}`);
    if (detail) selectedOptions.push(`Detail level: ${detail}`);
    if (artist) selectedOptions.push(`Artist inspiration: ${artist}`);
    if (quality) selectedOptions.push(`Quality: ${quality}`);
    if (customAdditions) selectedOptions.push(`Additional requirements: ${customAdditions}`);

    const optionsContext = selectedOptions.length > 0
        ? `\n\nUser has also selected these preferences:\n${selectedOptions.join('\n')}`
        : '';

    const userMessage = `Transform this basic idea into an optimized prompt for ${modelConfig.name}:

"${basePrompt}"${optionsContext}

${modelConfig.formatInstructions}

Return ONLY the optimized prompt, no explanations or additional text.`;

    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: modelConfig.systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userMessage
                }
            ]
        });

        const enhancedPrompt = response.content[0].text.trim();

        // Generate negative prompt if supported
        let negativeResult = null;
        if (modelConfig.supportsNegative) {
            if (negativePrompt) {
                negativeResult = negativePrompt;
            } else {
                // Generate contextual negative prompt
                negativeResult = await generateNegativePrompt(basePrompt, targetModel, modelConfig);
            }
        }

        return {
            success: true,
            model: targetModel,
            modelName: modelConfig.name,
            originalPrompt: basePrompt,
            enhancedPrompt: enhancedPrompt,
            negativePrompt: negativeResult,
            supportsNegative: modelConfig.supportsNegative,
            negativeMethod: modelConfig.negativeMethod || null
        };

    } catch (error) {
        console.error('Claude API error:', error);
        throw error;
    }
}

/**
 * Generate a contextual negative prompt
 */
async function generateNegativePrompt(basePrompt, targetModel, modelConfig) {
    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 256,
            messages: [
                {
                    role: 'user',
                    content: `Generate a negative prompt (things to AVOID) for this ${modelConfig.name} image generation request:

"${basePrompt}"

Base your negative prompt on common issues for this type of image. Include quality issues to avoid.
Default negatives to consider: ${modelConfig.defaultNegative || 'blurry, low quality, watermark'}

Return ONLY the negative prompt as comma-separated terms, nothing else.`
                }
            ]
        });

        return response.content[0].text.trim();
    } catch (error) {
        // Fallback to default negative prompt
        return modelConfig.defaultNegative || 'blurry, low quality, distorted, watermark';
    }
}
