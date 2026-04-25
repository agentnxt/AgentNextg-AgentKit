import type { Element, Root } from 'hast';
import { marked } from 'marked';
import {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

import { cn } from '@/lib/utils';

import { CodeBlock } from './code-block';
import * as styles from './markdown.css';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

function remarkStripFootnoteRefs() {
  return (tree: Root) => {
    visit(tree, 'text', node => {
      node.value = node.value.replaceAll(/\[\^[^\]]*\]/g, '');
    });
  };
}

/* ────────────────────────────────────────── */
/* helper: pull first external <a> from each <li> */
function extractLinks(footnoteSection: Element) {
  const links: { href: string; text: string; footnoteRef: string }[] = [];

  // <ol> is child #1 of the <section>
  const ol = footnoteSection.children.find(
    n => n.type === 'element' && n.tagName === 'ol'
  ) as Element | undefined;
  if (!ol) return links;

  for (const li of ol.children) {
    if (li.type !== 'element' || li.tagName !== 'li') continue;

    const p = li.children.find(
      n => n.type === 'element' && n.tagName === 'p'
    ) as Element | undefined;

    if (!p) continue;

    const [_, a, __, aref] = p.children as [
      any,
      {
        type: 'element';
        tagName: 'a';
        properties: { href: string };
        children: any[];
      },
      any,
      {
        type: 'element';
        tagName: 'a';
        properties: { href: string };
        children: any[];
      },
    ];

    if (!a || !aref || !a.properties?.href || !aref.properties?.href) continue;
    const textNode = a.children.find(c => c.type === 'text') as any;
    links.push({
      href: a.properties?.href as string,
      text: textNode?.value?.slice(0, -2) ?? a.properties?.href,
      footnoteRef: aref.properties.href,
    });
  }

  return links;
}

const InPreContext = createContext<boolean>(false);

const CustomCodeBlock = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const inPre = useContext(InPreContext);
  // code block
  if (inPre) {
    const lang = className?.match(/language-(\w+)/)?.[1] ?? 'text';
    return <CodeBlock language={lang}>{children}</CodeBlock>;
  }

  return <code>{children}</code>;
};

const footnoteComponents: Components = {
  /* colour the in-text superscript */
  sup({ node, children, ...rest }) {
    const id = (node?.properties?.id as string) ?? '';
    return id.startsWith('fnref-') ? (
      <sup {...rest} className="text-blue-600">
        {children}
      </sup>
    ) : (
      <sup {...rest}>{children}</sup>
    );
  },

  a({ node, children, ...rest }) {
    if (node?.properties?.dataFootnoteRef) {
      // handle clicking footnote ref correctly
      const href = node?.properties?.href as string;
      const scrollToRef = (e: React.MouseEvent) => {
        e.preventDefault();
        const markdownContainer = (e.target as HTMLElement).closest(
          '[data-markdown-text]'
        );
        const selector = `a[data-footnote-ref="#${node.properties.id}"]`;
        const ref = markdownContainer?.querySelector(
          selector
        ) as HTMLElement | null;
        if (ref) {
          ref.scrollIntoView({
            behavior: 'smooth',
          });
          // highlight the reference briefly so it is easier to spot
          ref.classList.add('bg-yellow-200', 'transition-colors');
          setTimeout(() => {
            ref.classList.remove('bg-yellow-200');
          }, 1500);
        }
      };
      return (
        <a href={href} onClick={scrollToRef}>
          {children}
        </a>
      );
    }
    return <a {...rest}>{children}</a>;
  },

  /* replace the whole footnote block */
  section({ node, ...rest }) {
    if (node?.properties?.dataFootnotes) {
      const links = extractLinks(node);

      return (
        <ol className="mt-4">
          {links.map(({ href, text, footnoteRef }) => (
            <li key={footnoteRef} className="break-all">
              <a
                href={href}
                data-footnote-ref={footnoteRef}
                target="_blank"
                rel="noopener noreferrer"
              >
                {text}
              </a>
            </li>
          ))}
        </ol>
      );
    }

    /* fall back to normal rendering if it’s *not* a footnote block */
    return <section {...rest} />;
  },

  pre({ children }) {
    return (
      <InPreContext.Provider value={true}>
        <pre>{children}</pre>
      </InPreContext.Provider>
    );
  },

  code({ className, children }) {
    return <CustomCodeBlock className={className}>{children}</CustomCodeBlock>;
  },
};

const MemoizedMarkdownBlock = memo(
  ({ content, split }: { content: string; split?: boolean }) => {
    return (
      <ReactMarkdown
        remarkPlugins={
          split ? [remarkGfm, remarkStripFootnoteRefs] : [remarkGfm]
        }
        components={footnoteComponents}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

const MemoizedMarkdown = memo(
  ({ content, split }: { content: string; split?: boolean }) => {
    const blocks = useMemo(
      () => (split ? parseMarkdownIntoBlocks(content) : [content]),
      [content, split]
    );

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock
        content={block}
        key={`block_${index}`}
        split={split}
      />
    ));
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';

// Typewriter text with markdown support
export function MarkdownText({
  text,
  loading = false,
  className,
  style,
}: {
  text: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      data-markdown-text
      className={cn(
        className,
        styles.markdownBlock,
        'prose',
        loading && 'with-cursor'
      )}
      style={style}
    >
      <MemoizedMarkdown content={text} split={loading} />
    </span>
  );
}

export const TypeMarkdownText = ({
  text,
  loading = false,
  className,
  style,
  speed = 10,
}: {
  text: string;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  speed?: number | number[];
}) => {
  const [initialStreaming] = useState(loading);
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!initialStreaming) {
      setDisplayedContent(text);
      return;
    }

    if (currentIndex < text.length) {
      const delay = Array.isArray(speed)
        ? Math.random() * (speed[1] - speed[0]) + speed[0]
        : speed;
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
    return () => {};
  }, [currentIndex, initialStreaming, speed, text]);

  return (
    <MarkdownText
      text={displayedContent}
      loading={loading}
      className={className}
      style={style}
    />
  );
};
