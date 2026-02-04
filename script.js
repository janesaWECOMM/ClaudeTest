// Image Prompt Optimizer - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const modelSelect = document.getElementById('modelSelect');
    const modelInfo = document.getElementById('modelInfo');
    const basePrompt = document.getElementById('basePrompt');
    const artStyle = document.getElementById('artStyle');
    const lighting = document.getElementById('lighting');
    const mood = document.getElementById('mood');
    const camera = document.getElementById('camera');
    const colorPalette = document.getElementById('colorPalette');
    const detail = document.getElementById('detail');
    const artist = document.getElementById('artist');
    const quality = document.getElementById('quality');
    const customAdditions = document.getElementById('customAdditions');
    const negativePrompt = document.getElementById('negativePrompt');

    const generateBtn = document.getElementById('generateBtn');
    const randomBtn = document.getElementById('randomBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyNegativeBtn = document.getElementById('copyNegativeBtn');

    const outputPrompt = document.getElementById('outputPrompt');
    const negativeOutput = document.getElementById('negativeOutput');
    const negativePromptOutput = document.getElementById('negativePromptOutput');
    const toast = document.getElementById('toast');

    // Model configurations with specific optimizations
    const modelConfigs = {
        general: {
            name: 'General',
            badge: '',
            description: 'Standard prompt format compatible with most image generators.',
            supportsNegative: true,
            promptFormat: 'standard',
            qualityBoosts: [],
            tips: 'Works with most AI image generators. Add specific details for better results.'
        },
        midjourney: {
            name: 'Midjourney',
            badge: 'midjourney',
            description: 'Optimized for Midjourney with parameters like --ar, --v, --stylize. Best for artistic and creative images.',
            supportsNegative: false,
            promptFormat: 'midjourney',
            qualityBoosts: ['--v 6.1', '--q 1'],
            defaultParams: {
                ar: '16:9',
                stylize: '100'
            },
            tips: 'Midjourney excels at artistic interpretation. Use :: for multi-prompts and --no for exclusions.'
        },
        chatgpt: {
            name: 'ChatGPT Images',
            badge: 'chatgpt',
            description: 'Optimized for DALL-E 3 via ChatGPT. Uses natural language descriptions with clear, detailed prompts.',
            supportsNegative: false,
            promptFormat: 'natural',
            qualityBoosts: ['high quality', 'detailed'],
            tips: 'ChatGPT Images works best with natural, conversational descriptions. Be specific about composition and style.'
        },
        ideogram: {
            name: 'Ideogram',
            badge: 'ideogram',
            description: 'Optimized for Ideogram with excellent text rendering support. Great for logos, typography, and designs with text.',
            supportsNegative: true,
            promptFormat: 'ideogram',
            qualityBoosts: ['high quality', 'professional'],
            tips: 'Ideogram excels at rendering text in images. Put important text in "quotes" for best results.'
        },
        veo: {
            name: 'Veo',
            badge: 'veo',
            description: 'Optimized for Google Veo video generation. Focus on motion, scenes, and cinematic descriptions.',
            supportsNegative: false,
            promptFormat: 'cinematic',
            qualityBoosts: ['cinematic', 'smooth motion', '4K'],
            tips: 'Veo is for video generation. Describe movement, camera motion, and scene transitions.'
        },
        nanobananapro: {
            name: 'Nano Banana Pro',
            badge: 'nanobananapro',
            description: 'Optimized for Nano Banana Pro. Supports detailed artistic prompts with style mixing and creative parameters.',
            supportsNegative: true,
            promptFormat: 'detailed',
            qualityBoosts: ['masterpiece', 'best quality', 'ultra detailed'],
            tips: 'Nano Banana Pro responds well to detailed style descriptions and artistic references.'
        }
    };

    // Default negative prompts for different models and styles
    const defaultNegativePrompts = {
        general: {
            photorealistic: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text',
            anime: 'realistic, photo, 3d render, ugly, deformed, noisy, blurry, low contrast, watermark',
            '3D render': 'blurry, low poly, bad textures, low quality, pixelated, watermark',
            'digital art': 'blurry, low quality, amateur, bad composition, watermark, signature',
            'oil painting': 'digital, photo, blurry, low quality, modern, watermark',
            default: 'blurry, low quality, distorted, ugly, bad composition, watermark, signature, text, amateur'
        },
        ideogram: {
            default: 'blurry, low quality, distorted text, misspelled words, bad typography, watermark, amateur'
        },
        nanobananapro: {
            default: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry'
        }
    };

    // Random options for "Surprise Me" feature
    const randomOptions = {
        subjects: [
            'a mystical forest with glowing mushrooms',
            'a futuristic city floating in the clouds',
            'an ancient library with magical books',
            'a dragon sleeping on a pile of treasure',
            'a cozy cottage in a snowy landscape',
            'an underwater kingdom with mermaids',
            'a steampunk airship flying through storms',
            'a peaceful zen garden with cherry blossoms',
            'a haunted Victorian mansion',
            'a space station orbiting a distant planet',
            'a magical potion shop with bubbling cauldrons',
            'a robot tending to a garden',
            'a phoenix rising from flames',
            'a hidden waterfall in a tropical jungle',
            'a cosmic whale swimming through galaxies'
        ]
    };

    // Update model info display
    function updateModelInfo() {
        const selectedModel = modelSelect.value;
        const config = modelConfigs[selectedModel];

        const badgeClass = config.badge ? ` ${config.badge}` : '';
        modelInfo.innerHTML = `
            <span class="model-badge${badgeClass}">${config.name}</span>
            <p>${config.description}</p>
        `;

        // Show/hide negative prompt section based on model support
        const negativeSection = negativePrompt.closest('.form-group');
        if (config.supportsNegative) {
            negativeSection.style.display = 'block';
        } else {
            negativeSection.style.display = 'none';
        }
    }

    // Format prompt for Midjourney
    function formatMidjourneyPrompt(components, config) {
        let prompt = components.join(', ');

        // Add Midjourney-specific parameters
        const params = [];

        // Add quality boosters as parameters
        if (config.qualityBoosts) {
            params.push(...config.qualityBoosts);
        }

        // Add aspect ratio if camera suggests one
        const cameraVal = camera.value;
        if (cameraVal.includes('panoramic') || cameraVal.includes('wide')) {
            params.push('--ar 21:9');
        } else if (cameraVal.includes('portrait')) {
            params.push('--ar 2:3');
        } else {
            params.push('--ar 16:9');
        }

        return prompt + ' ' + params.join(' ');
    }

    // Format prompt for ChatGPT/DALL-E (natural language)
    function formatNaturalPrompt(components) {
        // Convert comma-separated keywords into more natural sentence
        const base = components[0];
        const modifiers = components.slice(1);

        if (modifiers.length === 0) {
            return `Create a detailed image of ${base}.`;
        }

        let description = base;

        // Group modifiers by type for more natural flow
        const styleModifiers = [];
        const technicalModifiers = [];

        modifiers.forEach(mod => {
            if (mod.includes('style') || mod.includes('art') || mod.includes('painting') ||
                mod.includes('render') || mod.includes('anime') || mod.includes('photo')) {
                styleModifiers.push(mod);
            } else {
                technicalModifiers.push(mod);
            }
        });

        let prompt = `Create a detailed image of ${description}`;

        if (styleModifiers.length > 0) {
            prompt += ` in ${styleModifiers.join(' and ')} style`;
        }

        if (technicalModifiers.length > 0) {
            prompt += `. The image should feature ${technicalModifiers.join(', ')}`;
        }

        prompt += '.';

        return prompt;
    }

    // Format prompt for Ideogram (good with text)
    function formatIdeogramPrompt(components, config) {
        let prompt = components.join(', ');

        // Add quality boosters
        if (config.qualityBoosts) {
            prompt += ', ' + config.qualityBoosts.join(', ');
        }

        return prompt;
    }

    // Format prompt for Veo (video/cinematic)
    function formatCinematicPrompt(components, config) {
        const base = components[0];
        const modifiers = components.slice(1);

        let prompt = base;

        // Add cinematic descriptors
        const cinematicTerms = ['cinematic shot', 'smooth camera movement', 'professional cinematography'];
        const addedTerms = [];

        modifiers.forEach(mod => {
            if (!cinematicTerms.some(term => mod.toLowerCase().includes(term.split(' ')[0]))) {
                addedTerms.push(mod);
            }
        });

        if (addedTerms.length > 0) {
            prompt += ', ' + addedTerms.join(', ');
        }

        // Add Veo-specific quality terms
        prompt += ', ' + config.qualityBoosts.join(', ');

        return prompt;
    }

    // Format prompt for Nano Banana Pro (detailed artistic)
    function formatDetailedPrompt(components, config) {
        let prompt = components.join(', ');

        // Add quality boosters at the beginning for emphasis
        if (config.qualityBoosts) {
            prompt = config.qualityBoosts.join(', ') + ', ' + prompt;
        }

        return prompt;
    }

    // Generate the optimized prompt
    function generateOptimizedPrompt() {
        const base = basePrompt.value.trim();
        const selectedModel = modelSelect.value;
        const config = modelConfigs[selectedModel];

        if (!base) {
            showToast('Please enter your idea first!');
            basePrompt.focus();
            return;
        }

        const components = [];

        // Start with the base prompt
        components.push(base);

        // Add selected options in a logical order
        if (artStyle.value) components.push(artStyle.value);
        if (camera.value) components.push(camera.value);
        if (lighting.value) components.push(lighting.value);
        if (mood.value) components.push(mood.value);
        if (colorPalette.value) components.push(colorPalette.value);
        if (detail.value) components.push(detail.value);
        if (artist.value) components.push(artist.value);
        if (quality.value) components.push(quality.value);
        if (customAdditions.value.trim()) components.push(customAdditions.value.trim());

        // Format prompt based on selected model
        let finalPrompt;

        switch (config.promptFormat) {
            case 'midjourney':
                finalPrompt = formatMidjourneyPrompt(components, config);
                break;
            case 'natural':
                finalPrompt = formatNaturalPrompt(components);
                break;
            case 'ideogram':
                finalPrompt = formatIdeogramPrompt(components, config);
                break;
            case 'cinematic':
                finalPrompt = formatCinematicPrompt(components, config);
                break;
            case 'detailed':
                finalPrompt = formatDetailedPrompt(components, config);
                break;
            default:
                finalPrompt = components.join(', ');
        }

        // Display the result with model indicator
        outputPrompt.innerHTML = `
            <div class="model-indicator">
                <span class="model-badge${config.badge ? ' ' + config.badge : ''}">${config.name}</span>
            </div>
            <p class="generated-prompt">${escapeHtml(finalPrompt)}</p>
        `;
        copyBtn.disabled = false;

        // Handle negative prompt
        if (config.supportsNegative) {
            let negativeText = negativePrompt.value.trim();

            // Add default negatives based on model and style if no custom negative is provided
            if (!negativeText) {
                const modelNegatives = defaultNegativePrompts[selectedModel] || defaultNegativePrompts.general;
                const styleKey = artStyle.value || 'default';
                negativeText = modelNegatives[styleKey] || modelNegatives.default;
            }

            negativeOutput.style.display = 'block';
            negativePromptOutput.innerHTML = `<p class="generated-prompt">${escapeHtml(negativeText)}</p>`;
        } else {
            negativeOutput.style.display = 'none';

            // Show tip for models without negative prompt support
            if (selectedModel === 'midjourney') {
                const tip = document.createElement('div');
                tip.className = 'model-tip';
                tip.innerHTML = `<p><strong>Tip:</strong> Use --no [term] to exclude elements in Midjourney. Example: --no watermark --no text</p>`;

                const existingTip = outputPrompt.querySelector('.model-tip');
                if (existingTip) existingTip.remove();
                outputPrompt.appendChild(tip);
            }
        }

        // Scroll to output
        outputPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Random prompt generator
    function generateRandomPrompt() {
        // Select random subject
        const randomSubject = randomOptions.subjects[Math.floor(Math.random() * randomOptions.subjects.length)];
        basePrompt.value = randomSubject;

        // Randomly select options from dropdowns
        randomizeSelect(artStyle);
        randomizeSelect(lighting);
        randomizeSelect(mood);
        randomizeSelect(camera);
        randomizeSelect(colorPalette);
        randomizeSelect(detail);
        randomizeSelect(artist);
        randomizeSelect(quality);

        // Generate the prompt
        generateOptimizedPrompt();
    }

    // Helper function to randomly select an option
    function randomizeSelect(selectElement) {
        const options = selectElement.options;
        // Skip the first option (placeholder) and randomly select from the rest
        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        selectElement.selectedIndex = randomIndex;
    }

    // Clear all fields
    function clearAll() {
        basePrompt.value = '';
        artStyle.selectedIndex = 0;
        lighting.selectedIndex = 0;
        mood.selectedIndex = 0;
        camera.selectedIndex = 0;
        colorPalette.selectedIndex = 0;
        detail.selectedIndex = 0;
        artist.selectedIndex = 0;
        quality.selectedIndex = 0;
        customAdditions.value = '';
        negativePrompt.value = '';

        outputPrompt.innerHTML = '<p class="placeholder-text">Your optimized prompt will appear here...</p>';
        negativeOutput.style.display = 'none';
        copyBtn.disabled = true;

        basePrompt.focus();
    }

    // Copy to clipboard functionality
    async function copyToClipboard(text, buttonElement) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard!');

            // Visual feedback on button
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            buttonElement.style.background = 'var(--success-color)';
            buttonElement.style.borderColor = 'var(--success-color)';
            buttonElement.style.color = 'white';

            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
                buttonElement.style.borderColor = '';
                buttonElement.style.color = '';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!');
            } catch (e) {
                showToast('Failed to copy. Please select and copy manually.');
            }

            document.body.removeChild(textarea);
        }
    }

    // Show toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners
    modelSelect.addEventListener('change', updateModelInfo);

    generateBtn.addEventListener('click', generateOptimizedPrompt);

    randomBtn.addEventListener('click', generateRandomPrompt);

    clearBtn.addEventListener('click', clearAll);

    copyBtn.addEventListener('click', () => {
        const promptText = outputPrompt.querySelector('.generated-prompt');
        if (promptText) {
            copyToClipboard(promptText.textContent, copyBtn);
        }
    });

    copyNegativeBtn.addEventListener('click', () => {
        const negativeText = negativePromptOutput.querySelector('.generated-prompt');
        if (negativeText) {
            copyToClipboard(negativeText.textContent, copyNegativeBtn);
        }
    });

    // Generate on Enter key in base prompt
    basePrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateOptimizedPrompt();
        }
    });

    // Example prompts - Use button functionality
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        const useButton = card.querySelector('.btn-use');
        useButton.addEventListener('click', () => {
            const promptData = card.dataset.prompt;

            // Parse the example prompt and fill in the form
            basePrompt.value = promptData;

            // Clear other selections since the example is a complete prompt
            artStyle.selectedIndex = 0;
            lighting.selectedIndex = 0;
            mood.selectedIndex = 0;
            camera.selectedIndex = 0;
            colorPalette.selectedIndex = 0;
            detail.selectedIndex = 0;
            artist.selectedIndex = 0;
            quality.selectedIndex = 0;
            customAdditions.value = '';

            // Generate the prompt
            generateOptimizedPrompt();

            // Scroll to top
            basePrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // Auto-resize textarea
    basePrompt.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateOptimizedPrompt();
        }

        // Escape to clear
        if (e.key === 'Escape') {
            clearAll();
        }
    });

    // Add hover effect data to example cards
    exampleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 10px 30px -10px rgba(139, 92, 246, 0.3)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });

    // Initialize
    updateModelInfo();
    basePrompt.focus();

    // Add some helpful console messages for developers
    console.log('%c Image Prompt Optimizer ', 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px;');
    console.log('Supported models: Midjourney, ChatGPT Images, Ideogram, Veo, Nano Banana Pro');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl/Cmd + Enter: Generate prompt');
    console.log('  Escape: Clear all fields');
});
