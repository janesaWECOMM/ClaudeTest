// Image Prompt Optimizer - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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

    // Default negative prompts for different styles
    const defaultNegativePrompts = {
        photorealistic: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text',
        anime: 'realistic, photo, 3d render, ugly, deformed, noisy, blurry, low contrast, watermark',
        '3D render': 'blurry, low poly, bad textures, low quality, pixelated, watermark',
        'digital art': 'blurry, low quality, amateur, bad composition, watermark, signature',
        'oil painting': 'digital, photo, blurry, low quality, modern, watermark',
        default: 'blurry, low quality, distorted, ugly, bad composition, watermark, signature, text, amateur'
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

    // Generate the optimized prompt
    function generateOptimizedPrompt() {
        const base = basePrompt.value.trim();

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

        // Join all components
        const finalPrompt = components.join(', ');

        // Display the result
        outputPrompt.innerHTML = `<p class="generated-prompt">${escapeHtml(finalPrompt)}</p>`;
        copyBtn.disabled = false;

        // Handle negative prompt
        let negativeText = negativePrompt.value.trim();

        // Add default negatives based on style if no custom negative is provided
        if (!negativeText) {
            const styleKey = artStyle.value || 'default';
            negativeText = defaultNegativePrompts[styleKey] || defaultNegativePrompts.default;
        }

        negativeOutput.style.display = 'block';
        negativePromptOutput.innerHTML = `<p class="generated-prompt">${escapeHtml(negativeText)}</p>`;

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

    // Initialize - focus on base prompt
    basePrompt.focus();

    // Add some helpful console messages for developers
    console.log('%c Image Prompt Optimizer ', 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px;');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl/Cmd + Enter: Generate prompt');
    console.log('  Escape: Clear all fields');
});
