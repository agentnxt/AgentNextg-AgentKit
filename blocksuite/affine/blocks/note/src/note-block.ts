import { type NoteBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
import { css, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

export class NoteBlockComponent extends BlockComponent<NoteBlockModel> {
  static override styles = css`
    .affine-note-block-container {
      display: flow-root;
    }
    .affine-note-block-container.selected {
      background-color: var(--affine-hover-color);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
  }

  override renderBlock() {
    return html`
      <div
        style=${styleMap({
          background:
            typeof this.model.props.background$.value === 'string'
              ? this.model.props.background$.value
              : 'unset',
        })}
        class="affine-note-block-container"
      >
        <div class="affine-block-children-container">
          ${this.renderChildren(this.model)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-note': NoteBlockComponent;
  }
}
