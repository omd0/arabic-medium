/*
All rights reserved to Muktar SayedSaleh @ 2023
Improved and refacored in 2024.
*/

(function() {
    'use strict';

    // --- CONFIGURATION ---

    const ARABIC_REGEX = /[\u0600-\u06FF]/;
    const CONTENT_SELECTORS = '.postArticle-content, section.eh, p, h1, h2, h3, header, ol, ul, li, blockquote';
    const TOOLBAR_SELECTOR = '[aria-describedby="postFooterSocialMenu"]';

    // State management for three modes: 0 = Off, 1 = Right Align, 2 = Justify
    let fixerState = 1; // Start with Right Align enabled by default


    // --- STYLES INJECTION ---

    /**
     * Injects the necessary CSS styles and the Google Font into the document's head.
     */
    const injectStyles = () => {
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        const style = document.createElement('style');
        style.textContent = `
            /* Base class for common typography and transition */
            .rtl-fixed-text {
                font-family: 'Tajawal', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                transition: all 680ms ease-in-out;
            }

            /* Specific classes for each alignment mode */
            .rtl-align-right {
                text-align: right;
            }
            .rtl-align-justify {
                text-align: justify;
            }
            
            /* General typography styles for Arabic text blocks */
            .rtl-fixed-text p,
            .rtl-fixed-text li,
            .rtl-fixed-text blockquote {
                letter-spacing: normal;
                font-size: 1.05em;
                word-spacing: 0.5px;
                padding: 0.1em;
            }

            /* MODIFIED: Specific rule to apply text-indent ONLY when in justify mode. */
            .rtl-align-justify.pw-post-body-paragraph {
                text-indent: 1em;
            }

            /* Styles for the button inside the Medium toolbar */
            .rtl-fixer-toolbar-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                margin: 0 16px 0 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                color: rgba(117, 117, 117, 1);
                font-family: 'Tajawal', sans-serif;
                font-size: 18px;
                font-weight: bold;
                transition: background-color 680ms ease, color 680ms ease, font-size 680ms ease;
                position: relative;
                overflow: hidden;
            }
            
            /* Increase font size specifically for the justify icon */
            .rtl-fixer-toolbar-button.justify-icon {
                font-size: 24px;
            }

            .rtl-fixer-toolbar-button:hover {
                background-color: rgba(242, 242, 242, 1);
            }

            .rtl-fixer-toolbar-button.active {
                color: rgba(8, 8, 8, 1);
                background-color: rgba(230, 230, 230, 1);
            }

            /* Glitter animation styles */
            @keyframes glitter-animation {
                0% { transform: translateX(-100%) skewX(-20deg); }
                100% { transform: translateX(200%) skewX(-20deg); }
            }

            .rtl-fixer-toolbar-button.glitter::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 50%;
                height: 100%;
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
                animation: glitter-animation 680ms ease-in-out;
            }
        `;
        document.head.appendChild(style);
    };


    // --- CORE STYLE MANAGEMENT ---

    /**
     * Applies or removes styles based on the current fixerState.
     */
    const updateAllStyles = () => {
        // First, clean up all elements to reset their state
        document.querySelectorAll(CONTENT_SELECTORS).forEach(element => {
            element.removeAttribute('dir');
            element.classList.remove('rtl-fixed-text', 'rtl-align-right', 'rtl-align-justify');
        });

        // If the fixer is off, we're done.
        if (fixerState === 0) {
            return;
        }

        // Determine which alignment class to use
        const alignmentClass = fixerState === 1 ? 'rtl-align-right' : 'rtl-align-justify';

        // Apply new styles to elements containing Arabic
        document.querySelectorAll(CONTENT_SELECTORS).forEach(element => {
            const hasArabic = Array.from(element.childNodes).some(node =>
                node.nodeType === Node.TEXT_NODE && ARABIC_REGEX.test(node.textContent)
            );

            if (hasArabic) {
                element.setAttribute('dir', 'auto');
                element.classList.add('rtl-fixed-text', alignmentClass);
            }
        });
    };


    // --- UI & INJECTION ---

    /**
     * Finds the target toolbar and injects the toggle switch.
     */
    const injectToggleSwitch = () => {
        const toolbar = document.querySelector(TOOLBAR_SELECTOR);
        if (!toolbar) return;

        const injectionTarget = toolbar.parentElement;
        if (!injectionTarget || injectionTarget.querySelector('.rtl-fixer-toolbar-button')) {
            return;
        }

        const switchButton = document.createElement('button');
        switchButton.className = 'rtl-fixer-toolbar-button';
        switchButton.title = 'Toggle Arabic Style (Off / Right / Justify)';

        // Function to update the button's appearance based on state
        const updateButtonUI = () => {
            switch (fixerState) {
                case 0: // Off
                    switchButton.classList.remove('active', 'justify-icon');
                    switchButton.textContent = 'ع';
                    break;
                case 1: // Right Align
                    switchButton.classList.add('active');
                    switchButton.classList.remove('justify-icon');
                    switchButton.textContent = 'ع';
                    break;
                case 2: // Justify
                    switchButton.classList.add('active', 'justify-icon');
                    switchButton.textContent = '≡'; // Justify icon
                    break;
            }
        };

        // Set initial state
        updateButtonUI();

        switchButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // Cycle through the three states: 0, 1, 2
            fixerState = (fixerState + 1) % 3;
            
            updateButtonUI();
            updateAllStyles();

            // Trigger glitter animation only when turning on or switching modes
            if (fixerState !== 0) {
                switchButton.classList.add('glitter');
                setTimeout(() => {
                    switchButton.classList.remove('glitter');
                }, 700);
            }
        });

        injectionTarget.prepend(switchButton);
    };


    // --- INITIALIZATION ---

    injectStyles();

    setTimeout(() => {
        updateAllStyles();
        injectToggleSwitch();
    }, 500);

    const observer = new MutationObserver(() => {
        updateAllStyles();
        injectToggleSwitch();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
