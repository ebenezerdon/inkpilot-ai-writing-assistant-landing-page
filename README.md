# InkPilot — AI Writing Assistant (Landing Page)

This repository contains a beautiful, conversion-focused landing page for InkPilot, an AI writing assistant built with modern web practices. The page highlights interactive demos, a template library, a pricing toggle for monthly versus annual billing, and an accessible FAQ. The project was built by [Teda.dev](https://teda.dev), the simplest AI app builder for regular people, and designed to be clean, responsive, and easy to extend.

Quick start

1. Open index.html in your browser. The project uses Tailwind via the CDN and jQuery 3.7.1.
2. The page is fully client-side. Demo results and saved templates are persisted in your browser using localStorage.

Files included

- index.html - Marketing-first landing page with hero, demos, templates, pricing, FAQ, and a modal.
- styles/main.css - Custom CSS for interactive behaviors and accessibility.
- scripts/helpers.js - Utility helpers and localStorage wrapper exposed under window.App.Helpers and window.App.Storage.
- scripts/ui.js - Main UI wiring. Exposes window.App.init and window.App.render.
- scripts/main.js - Entry point that initializes the app after verifying the contract.

Accessibility and UX

- Semantic HTML and ARIA attributes are used for the FAQ accordion and pricing toggle.
- Focus outlines and keyboard interactions are supported for key controls.
- Animations respect prefers-reduced-motion.
- All interactive actions (template saves, billing selection, last demo) persist in localStorage.

Customization pointers

- Templates are defined in scripts/ui.js under the templates object and can be expanded.
- Demos use simple canned responses for the landing page; replace demoResponses with real AI calls for production.

License

This demo is provided for demonstration and learning purposes.
