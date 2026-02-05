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

    // API Configuration
    const API_BASE = '/api';
    let isEnhancing = false;

    // Model configurations for UI display
    const modelConfigs = {
        general: {
            name: 'General',
            badge: '',
            description: 'Standard prompt format compatible with most image generators.',
            supportsNegative: true
        },
        midjourney: {
            name: 'Midjourney',
            badge: 'midjourney',
            description: 'Optimized for Midjourney V7 with parameters like --ar, --v, --stylize. Best for artistic and creative images.',
            supportsNegative: false
        },
        chatgpt: {
            name: 'ChatGPT Images',
            badge: 'chatgpt',
            description: 'Optimized for DALL-E 3 via ChatGPT. Uses natural language descriptions with clear, detailed prompts.',
            supportsNegative: false
        },
        ideogram: {
            name: 'Ideogram',
            badge: 'ideogram',
            description: 'Optimized for Ideogram 3.0 with excellent text rendering support. Great for logos, typography, and designs with text.',
            supportsNegative: true
        },
        veo: {
            name: 'Veo',
            badge: 'veo',
            description: 'Optimized for Google Veo video generation. Focus on motion, camera movements, and cinematic descriptions.',
            supportsNegative: false
        },
        nanobananapro: {
            name: 'Nano Banana Pro',
            badge: 'nanobananapro',
            description: 'Optimized for Nano Banana Pro (Gemini 3). Uses natural language with creative direction style prompts.',
            supportsNegative: true
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

    // Check API health
    async function checkApiHealth() {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            return data.status === 'ok' && data.apiKeyConfigured;
        } catch {
            return false;
        }
    }

    // Show loading state
    function setLoadingState(loading) {
        isEnhancing = loading;
        generateBtn.disabled = loading;

        if (loading) {
            generateBtn.innerHTML = `
                <span class="spinner"></span>
                Enhancing with AI...
            `;
            outputPrompt.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Claude is crafting your optimized prompt...</p>
                </div>
            `;
        } else {
            generateBtn.innerHTML = 'Generate Optimized Prompt';
        }
    }

    // Generate the optimized prompt using Claude API
    async function generateOptimizedPrompt() {
        const base = basePrompt.value.trim();
        const selectedModel = modelSelect.value;
        const config = modelConfigs[selectedModel];

        if (!base) {
            showToast('Please enter your idea first!');
            basePrompt.focus();
            return;
        }

        if (isEnhancing) return;

        // Collect all options
        const options = {
            artStyle: artStyle.value,
            lighting: lighting.value,
            mood: mood.value,
            camera: camera.value,
            colorPalette: colorPalette.value,
            detail: detail.value,
            artist: artist.value,
            quality: quality.value,
            customAdditions: customAdditions.value.trim(),
            negativePrompt: negativePrompt.value.trim()
        };

        setLoadingState(true);

        try {
            const response = await fetch(`${API_BASE}/enhance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    basePrompt: base,
                    model: selectedModel,
                    options
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to enhance prompt');
            }

            // Display the AI-enhanced result
            outputPrompt.innerHTML = `
                <div class="model-indicator">
                    <span class="model-badge${config.badge ? ' ' + config.badge : ''}">${config.name}</span>
                    <span class="ai-badge">AI Enhanced</span>
                </div>
                <p class="generated-prompt">${escapeHtml(data.enhancedPrompt)}</p>
                ${data.negativeMethod && !data.supportsNegative ?
                    `<div class="model-tip"><p><strong>Tip:</strong> ${data.negativeMethod}</p></div>` : ''}
            `;
            copyBtn.disabled = false;

            // Handle negative prompt
            if (data.supportsNegative && data.negativePrompt) {
                negativeOutput.style.display = 'block';
                negativePromptOutput.innerHTML = `<p class="generated-prompt">${escapeHtml(data.negativePrompt)}</p>`;
            } else {
                negativeOutput.style.display = 'none';
            }

            // Scroll to output
            outputPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error('Enhancement error:', error);

            // Show error but offer fallback
            outputPrompt.innerHTML = `
                <div class="error-state">
                    <p class="error-message">${escapeHtml(error.message)}</p>
                    <p class="error-hint">The AI enhancement service may be unavailable. Make sure the server is running with a valid ANTHROPIC_API_KEY.</p>
                    <button id="fallbackBtn" class="btn-secondary">Use Basic Enhancement</button>
                </div>
            `;

            // Add fallback button handler
            document.getElementById('fallbackBtn')?.addEventListener('click', generateBasicPrompt);

        } finally {
            setLoadingState(false);
        }
    }

    // Basic prompt generation (fallback when API unavailable)
    function generateBasicPrompt() {
        const base = basePrompt.value.trim();
        const selectedModel = modelSelect.value;
        const config = modelConfigs[selectedModel];

        if (!base) {
            showToast('Please enter your idea first!');
            basePrompt.focus();
            return;
        }

        const components = [base];

        if (artStyle.value) components.push(artStyle.value);
        if (camera.value) components.push(camera.value);
        if (lighting.value) components.push(lighting.value);
        if (mood.value) components.push(mood.value);
        if (colorPalette.value) components.push(colorPalette.value);
        if (detail.value) components.push(detail.value);
        if (artist.value) components.push(artist.value);
        if (quality.value) components.push(quality.value);
        if (customAdditions.value.trim()) components.push(customAdditions.value.trim());

        const finalPrompt = components.join(', ');

        outputPrompt.innerHTML = `
            <div class="model-indicator">
                <span class="model-badge${config.badge ? ' ' + config.badge : ''}">${config.name}</span>
                <span class="basic-badge">Basic</span>
            </div>
            <p class="generated-prompt">${escapeHtml(finalPrompt)}</p>
        `;
        copyBtn.disabled = false;

        // Basic negative prompt
        if (config.supportsNegative) {
            const defaultNegative = 'blurry, low quality, distorted, ugly, bad composition, watermark, signature, text, amateur';
            negativeOutput.style.display = 'block';
            negativePromptOutput.innerHTML = `<p class="generated-prompt">${escapeHtml(negativePrompt.value.trim() || defaultNegative)}</p>`;
        } else {
            negativeOutput.style.display = 'none';
        }

        outputPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Random prompt generator
    function generateRandomPrompt() {
        const randomSubject = randomOptions.subjects[Math.floor(Math.random() * randomOptions.subjects.length)];
        basePrompt.value = randomSubject;

        randomizeSelect(artStyle);
        randomizeSelect(lighting);
        randomizeSelect(mood);
        randomizeSelect(camera);
        randomizeSelect(colorPalette);
        randomizeSelect(detail);
        randomizeSelect(artist);
        randomizeSelect(quality);

        generateOptimizedPrompt();
    }

    // Helper function to randomly select an option
    function randomizeSelect(selectElement) {
        const options = selectElement.options;
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
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                showToast('Copied to clipboard!');
            } catch {
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

    basePrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            generateOptimizedPrompt();
        }
    });

    // Example prompts
    const exampleCards = document.querySelectorAll('.example-card');
    exampleCards.forEach(card => {
        const useButton = card.querySelector('.btn-use');
        useButton.addEventListener('click', () => {
            const promptData = card.dataset.prompt;
            basePrompt.value = promptData;

            artStyle.selectedIndex = 0;
            lighting.selectedIndex = 0;
            mood.selectedIndex = 0;
            camera.selectedIndex = 0;
            colorPalette.selectedIndex = 0;
            detail.selectedIndex = 0;
            artist.selectedIndex = 0;
            quality.selectedIndex = 0;
            customAdditions.value = '';

            generateOptimizedPrompt();
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
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateOptimizedPrompt();
        }

        if (e.key === 'Escape') {
            clearAll();
        }
    });

    // Hover effects for example cards
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

    // Check API availability on load
    checkApiHealth().then(available => {
        if (available) {
            console.log('%c AI Enhancement Ready ', 'background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 5px 10px; border-radius: 5px;');
        } else {
            console.log('%c AI Enhancement Unavailable ', 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 5px 10px; border-radius: 5px;');
            console.log('Start the server with ANTHROPIC_API_KEY set to enable AI-powered prompt enhancement.');
        }
    });

    console.log('%c Image Prompt Optimizer ', 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px;');
    console.log('Supported models: Midjourney, ChatGPT Images, Ideogram, Veo, Nano Banana Pro');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl/Cmd + Enter: Generate prompt');
    console.log('  Escape: Clear all fields');
});
