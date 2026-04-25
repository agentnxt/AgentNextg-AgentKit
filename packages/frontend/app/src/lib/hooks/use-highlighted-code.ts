import { useEffect, useState, startTransition } from 'react';
import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';
import { LRUCache } from '../lru-cache';

// Singleton highlighter instance (wrapped in a Promise to deduplicate concurrent requests)
let highlighterPromise: Promise<Highlighter> | null = null;

// LRU cache to keep track of loaded languages (value is just boolean placeholder)
const languageCache = new LRUCache<string, true>(20);

async function getHighlighter(theme: string, lang: string): Promise<Highlighter> {
  // Initialize highlighter once (with a default language)
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({ themes: [theme], langs: ['plaintext'] });
  }

  let highlighter = await highlighterPromise;

  // If requested language not loaded, load it and manage LRU
  if (!highlighter.getLoadedLanguages().includes(lang as any)) {
    await highlighter.loadLanguage(lang as any);

    languageCache.set(lang, true);

    if (languageCache.size() > 20) {
      const keepLangs = languageCache.keys();
      highlighterPromise = createHighlighter({ themes: [theme], langs: keepLangs });
      highlighter = await highlighterPromise;
    }
  } else {
    // Update recency
    languageCache.set(lang, true);
  }

  return highlighter;
}

/**
 * Returns highlighted HTML of given code string using Shiki.
 * The highlighter instance is memoized inside the hook instance to avoid expensive re-creation.
 */
export function useHighlightedCode(
  code: string,
  language: string,
  theme: string = 'min-light'
): string {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      const highlighter = await getHighlighter(theme, language);

      if (cancelled || !code) return;

      const htmlResult = highlighter.codeToHtml(code, {
        theme,
        lang: language,
      });

      if (cancelled) return;

      startTransition(() => setHtml(htmlResult));
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, language, theme]);

  return html;
}
