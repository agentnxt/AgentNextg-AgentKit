import { CodeBlockPreviewExtension } from '@blocksuite/affine/blocks/code';
import { ParagraphViewExtension } from '@blocksuite/affine/blocks/paragraph/view';
import {
  type ViewExtensionContext,
  ViewExtensionManager,
  ViewExtensionProvider,
} from '@blocksuite/affine/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/affine/extensions/view';
import { html } from 'lit';
class HtmlManager {
  htmlMap = new Map<string, HTMLElement>();
  renderHtml(html: string) {
    if (!this.htmlMap.has(html)) {
      const div = document.createElement('div');
      div.innerHTML = html;
      const scriptList = Array.from(div.querySelectorAll('script'));
      this.htmlMap.set(html, div);
      requestAnimationFrame(() => {
        scriptList.forEach(script => {
          const newScriptEl = document.createElement('script');
          Array.from(script.attributes).forEach(attr => {
            newScriptEl.setAttribute(attr.name, attr.value);
          });
          const scriptText = document.createTextNode(script.innerHTML);
          newScriptEl.appendChild(scriptText);
          script.parentNode?.replaceChild(newScriptEl, script);
        });
      });
    }
    return this.htmlMap.get(html);
  }
}
const htmlManager = new HtmlManager();
class ComposerViewExtensionProvider extends ViewExtensionProvider {
  override name = 'composer';

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    // Add HTML code block preview extension
    context.register(
      CodeBlockPreviewExtension('html', model => {
        const code = model.props.text.toString();
        if (!code.trim()) return null;

        return html`${htmlManager.renderHtml(code)}`;
      })
    );
  }
}

let manager: ViewExtensionManager | null = null;
export function getComposerViewManager() {
  if (!manager) {
    manager = new ViewExtensionManager([
      ...getInternalViewExtensions(),
      ComposerViewExtensionProvider,
    ]);

    manager.configure(ParagraphViewExtension, {
      getPlaceholder: () => {
        return ''; // placeholder?
      },
    });
  }
  return manager;
}
