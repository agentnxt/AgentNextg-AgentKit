import type { BlockSnapshot } from '@blocksuite/store';
import { nanoid } from '@blocksuite/store';
import type {
  Code,
  Heading,
  Html,
  Image,
  Link,
  List,
  ListItem,
  Node,
  Paragraph,
  Root,
  Table,
} from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

interface LayoutState {
  containerMap: Map<string, BlockSnapshot>;
  currentColumnKey: string | null;
}

export class MarkdownToSnapshotConverter {
  private layoutState: LayoutState;

  constructor() {
    this.layoutState = {
      containerMap: new Map<string, BlockSnapshot>(),
      currentColumnKey: null,
    };
  }

  static async convert(markdown: string): Promise<BlockSnapshot> {
    const converter = new MarkdownToSnapshotConverter();
    return converter.convertMarkdownToSnapshot(markdown);
  }

  static async convertWithSplit(markdown: string): Promise<BlockSnapshot[]> {
    const converter = new MarkdownToSnapshotConverter();
    return converter.convertMarkdownToSnapshotsWithSplit(markdown);
  }

  async convertMarkdownToSnapshot(markdown: string): Promise<BlockSnapshot> {
    this.resetState();

    // Preprocess custom syntax
    const processedMarkdown = this.preprocessCustomSyntax(markdown);

    const processor = unified().use(remarkParse).use(remarkGfm);
    const ast = processor.parse(processedMarkdown) as Root;

    const children = await this.convertAstToBlocks(ast);

    const noteSnapshot: BlockSnapshot = {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:note',
      props: {
        xywh: '[0,0,800,95]',
        background: '--affine-note-background-blue',
        index: 'a0',
        hidden: false,
        displayMode: 'both',
      },
      children,
    };

    return noteSnapshot;
  }

  async convertMarkdownToSnapshotsWithSplit(
    markdown: string
  ): Promise<BlockSnapshot[]> {
    // Split markdown by split markers and extract configuration information
    const sectionsWithConfig =
      this.splitMarkdownBySeparatorWithConfig(markdown);
    const noteSnapshots: BlockSnapshot[] = [];

    for (let i = 0; i < sectionsWithConfig.length; i++) {
      const { content, config } = sectionsWithConfig[i];
      if (content.trim()) {
        this.resetState();

        // Preprocess custom syntax
        const processedMarkdown = this.preprocessCustomSyntax(content);

        const processor = unified().use(remarkParse).use(remarkGfm);
        const ast = processor.parse(processedMarkdown) as Root;

        const children = await this.convertAstToBlocks(ast);

        if (children.length > 0) {
          // Use background color from configuration, or default if not specified
          const background =
            config?.backgroundColor || this.getNoteBackground(i);

          const noteSnapshot: BlockSnapshot = {
            type: 'block',
            id: nanoid(),
            flavour: 'affine:note',
            props: {
              xywh: `[0,${i * 100},800,95]`,
              background: this.mapBackgroundColor(background),
              index: `a${i}`,
              hidden: false,
              displayMode: 'both',
              // If there's a title in configuration, add it to note properties
              ...(config?.title && { title: config.title }),
            },
            children,
          };

          noteSnapshots.push(noteSnapshot);
        }
      }
    }

    return noteSnapshots;
  }

  private splitMarkdownBySeparator(markdown: string): string[] {
    // Only support <!-- note:split --> split markers
    return markdown
      .split(/<!-- note:split([\s\S]*?)-->/g)
      .filter(section => section.trim().length > 0);
  }

  private splitMarkdownBySeparatorWithConfig(
    markdown: string
  ): Array<{ content: string; config?: any }> {
    // Support <!-- note:split --> and <!-- note:split{"title":"xxx","backgroundColor":"red"} --> formats
    const parts = markdown.split(/<!-- note:split([\s\S]*?)-->/g);
    const result: Array<{ content: string; config?: any }> = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i % 2 === 0) {
        // This is content part
        if (part.trim().length > 0) {
          result.push({ content: part, config: null });
        }
      } else {
        // This is configuration part in split marker
        let config = null;
        if (part.trim().length > 0) {
          try {
            // Try to parse JSON configuration
            config = JSON.parse(part.trim());
          } catch (e) {
            // If parsing fails, ignore configuration
            config = null;
          }
        }

        // Get next content part
        if (i + 1 < parts.length) {
          const nextContent = parts[i + 1];
          if (nextContent.trim().length > 0) {
            result.push({ content: nextContent, config });
          }
          i++; // Skip next content part as we've already processed it
        }
      }
    }

    return result;
  }

  private mapBackgroundColor(color: string): string {
    // Map user-specified colors to AFFiNE background color variables
    const colorMap: { [key: string]: string } = {
      red: '--affine-note-background-red',
      blue: '--affine-note-background-blue',
      green: '--affine-note-background-green',
      yellow: '--affine-note-background-yellow',
      pink: '--affine-note-background-pink',
      purple: '--affine-note-background-purple',
      orange: '--affine-note-background-orange',
      gray: '--affine-note-background-gray',
      grey: '--affine-note-background-gray',
    };

    // If it's a known color name, return corresponding CSS variable
    if (colorMap[color.toLowerCase()]) {
      return colorMap[color.toLowerCase()];
    }

    // If it's already in CSS variable format, return directly
    if (color.startsWith('--affine-note-background-')) {
      return color;
    }

    // If it's in other format (like hex color), return directly
    return color;
  }

  private getNoteBackground(index: number): string {
    const backgrounds = [
      '--affine-note-background-blue',
      '--affine-note-background-green',
      '--affine-note-background-yellow',
      '--affine-note-background-pink',
      '--affine-note-background-purple',
      '--affine-note-background-orange',
    ];
    return backgrounds[index % backgrounds.length];
  }

  private resetState(): void {
    this.layoutState = {
      containerMap: new Map<string, BlockSnapshot>(),
      currentColumnKey: null,
    };
  }

  private async convertAstToBlocks(ast: Root): Promise<BlockSnapshot[]> {
    const blocks: BlockSnapshot[] = [];

    for (const node of ast.children) {
      await this.processAstNode(node, blocks);
    }

    return blocks;
  }

  private async processAstNode(
    node: Node,
    blocks: BlockSnapshot[]
  ): Promise<void> {
    switch (node.type) {
      case 'html':
        await this.processHtmlNode(node as Html, blocks);
        break;

      case 'heading':
        const headingBlock = this.createHeadingBlock(node as Heading);
        this.insertBlock(headingBlock, blocks);
        break;

      case 'paragraph':
        const paragraphBlock = this.createParagraphBlock(node as Paragraph);
        this.insertBlock(paragraphBlock, blocks);
        break;

      case 'list':
        await this.processListNode(node as List, blocks);
        break;

      case 'code':
        const codeBlock = this.createCodeBlock(node as Code);
        this.insertBlock(codeBlock, blocks);
        break;

      case 'image':
        const imageBlock = this.createImageBlock(node as Image);
        this.insertBlock(imageBlock, blocks);
        break;

      case 'table':
        const tableBlock = this.createTableBlock(node as Table);
        this.insertBlock(tableBlock, blocks);
        break;
    }
  }

  private async processHtmlNode(
    node: Html,
    blocks: BlockSnapshot[]
  ): Promise<void> {
    const html = node.value;

    if (html.includes('layout:multi-column')) {
      const layoutMatch = html.match(/^<!-- layout:multi-column([\s\S]*?)-->$/);
      if (layoutMatch) {
        try {
          const config = JSON.parse(layoutMatch[1]);

          const container = this.createMultiColumnContainer(config);
          this.layoutState.containerMap.set(config.id, container);

          if (config.parent && config.insert) {
            const parentKey = `${config.parent}.${config.insert}`;
            const parentContainer =
              this.layoutState.containerMap.get(parentKey);
            if (parentContainer) {
              parentContainer.children.push(container);
            } else {
              blocks.push(container);
            }
          } else {
            blocks.push(container);
          }

          for (const columnConfig of config.columns) {
            const column = this.createColumnBlock(columnConfig);
            const columnKey = `${config.id}.${columnConfig.id}`;
            this.layoutState.containerMap.set(columnKey, column);
            container.children.push(column);
          }
        } catch (e) {}
      }
      return;
    } else if (html.includes('end:content:column')) {
      this.layoutState.currentColumnKey = null;
      return;
    } else if (html.includes('content:column')) {
      const columnMatch = html.match(/^<!-- content:column([\s\S]*?)-->$/);
      if (columnMatch) {
        try {
          const config = JSON.parse(columnMatch[1]);
          this.layoutState.currentColumnKey = `${config.parent}.${config.insert}`;
        } catch (e) {}
      }
      return;
    }
  }

  private createHeadingBlock(node: Heading): BlockSnapshot {
    const delta = this.extractDeltaFromMdastNode(node);
    const level = node.depth;

    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:paragraph',
      props: {
        text: {
          '$blocksuite:internal:text$': true,
          delta,
        },
        type: `h${Math.min(level, 6)}`,
      },
      children: [],
    };
  }

  private createParagraphBlock(node: Paragraph): BlockSnapshot {
    const delta = this.extractDeltaFromMdastNode(node);

    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:paragraph',
      props: {
        text: {
          '$blocksuite:internal:text$': true,
          delta,
        },
        type: 'text',
      },
      children: [],
    };
  }

  private insertBlock(block: BlockSnapshot, blocks: BlockSnapshot[]): void {
    if (this.layoutState.currentColumnKey) {
      const column = this.layoutState.containerMap.get(
        this.layoutState.currentColumnKey
      );
      if (column) {
        column.children.push(block);
      } else {
        blocks.push(block);
      }
    } else {
      blocks.push(block);
    }
  }

  private createMultiColumnContainer(config: {
    id: string;
    columns: Array<{ id: string; width: number }>;
  }): BlockSnapshot {
    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:multi-column-container',
      props: {},
      children: [],
    };
  }

  private createColumnBlock(columnConfig: {
    id: string;
    width: number;
  }): BlockSnapshot {
    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:column',
      props: {
        width: columnConfig.width,
      },
      children: [],
    };
  }

  private async processListNode(
    node: List,
    blocks: BlockSnapshot[]
  ): Promise<void> {
    for (const listItem of node.children) {
      const listBlock = this.createListBlock(
        listItem as ListItem,
        node.ordered || false
      );
      this.insertBlock(listBlock, blocks);

      if (listItem.children.length > 1) {
        for (let i = 1; i < listItem.children.length; i++) {
          const child = listItem.children[i];
          if (child.type === 'list') {
            await this.processListNode(child as List, blocks);
          }
        }
      }
    }
  }

  private createListBlock(node: ListItem, ordered: boolean): BlockSnapshot {
    let delta: any[] = [];
    if (node.children.length > 0 && node.children[0].type === 'paragraph') {
      delta = this.extractDeltaFromMdastNode(node.children[0]);
    }

    let listType: string;
    if (node.checked !== null && node.checked !== undefined) {
      listType = 'todo';
    } else if (ordered) {
      listType = 'numbered';
    } else {
      listType = 'bulleted';
    }

    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:list',
      props: {
        type: listType,
        text: {
          '$blocksuite:internal:text$': true,
          delta,
        },
        checked: node.checked ?? false,
        collapsed: false,
      },
      children: [],
    };
  }

  private createCodeBlock(node: Code): BlockSnapshot {
    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:code',
      props: {
        language: node.lang || 'plain text',
        text: {
          '$blocksuite:internal:text$': true,
          delta: [{ insert: node.value }],
        },
        wrap: false,
      },
      children: [],
    };
  }

  private createImageBlock(node: Image): BlockSnapshot {
    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:image',
      props: {
        sourceId: node.url,
        caption: node.alt || '',
        width: 0,
        height: 0,
        index: 'a0',
        xywh: '[0,0,0,0]',
        rotate: 0,
      },
      children: [],
    };
  }

  private createTableBlock(node: Table): BlockSnapshot {
    const tableProps = this.parseTableFromMarkdown(node);
    return {
      type: 'block',
      id: nanoid(),
      flavour: 'affine:table',
      props: tableProps,
      children: [],
    };
  }

  private parseTableFromMarkdown(node: Table): any {
    const rowTextLists: any[][] = [];
    node.children.forEach(row => {
      const rowText: any[] = [];
      row.children.forEach(cell => {
        rowText.push(this.extractDeltaFromMdastNode(cell));
      });
      rowTextLists.push(rowText);
    });
    return this.createTableProps(rowTextLists);
  }

  private createTableProps(deltasLists: any[][]): any {
    const createIdAndOrder = (count: number) => {
      const result: { id: string; order: string }[] = Array.from({
        length: count,
      });
      for (let i = 0; i < count; i++) {
        const id = nanoid();
        const order = this.generateFractionalIndexingKeyBetween(
          result[i - 1]?.order ?? null,
          null
        );
        result[i] = { id, order };
      }
      return result;
    };

    const columnCount = Math.max(...deltasLists.map(row => row.length));
    const rowCount = deltasLists.length;

    const columns = createIdAndOrder(columnCount).map(v => ({
      columnId: v.id,
      order: v.order,
    }));
    const rows = createIdAndOrder(rowCount).map(v => ({
      rowId: v.id,
      order: v.order,
    }));

    const cells: Record<string, any> = {};
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        const row = rows[i];
        const column = columns[j];
        if (!row || !column) {
          continue;
        }
        const cellId = `${row.rowId}:${column.columnId}`;
        const text = deltasLists[i]?.[j];
        cells[cellId] = {
          text: {
            '$blocksuite:internal:text$': true,
            delta: text ?? [],
          },
        };
      }
    }

    return {
      columns: Object.fromEntries(
        columns.map(column => [column.columnId, column])
      ),
      rows: Object.fromEntries(rows.map(row => [row.rowId, row])),
      cells,
    };
  }

  private generateFractionalIndexingKeyBetween(
    prev: string | null,
    next: string | null
  ): string {
    if (!prev && !next) {
      return 'a0';
    }
    if (!prev) {
      return 'a0';
    }
    if (!next) {
      const lastChar = prev.charCodeAt(prev.length - 1);
      if (lastChar < 122) {
        return prev.slice(0, -1) + String.fromCharCode(lastChar + 1);
      }
      return prev + 'a';
    }
    // Simple implementation for between two keys
    return prev + '5';
  }

  private extractTextFromMdastNode(node: any): string {
    if (node.type === 'text') {
      return node.value || '';
    }

    if (node.type === 'link') {
      const linkNode = node as Link;
      const text = linkNode.children
        .map((child: any) => this.extractTextFromMdastNode(child))
        .join('');
      return text;
    }

    if (node.type === 'image') {
      const imageNode = node as Image;
      return imageNode.alt || '';
    }

    if (node.children) {
      return node.children
        .map((child: any) => this.extractTextFromMdastNode(child))
        .join('');
    }

    return '';
  }

  private extractDeltaFromMdastNode(node: any): any[] {
    if (node.type === 'text') {
      // Process custom syntax
      return this.parseCustomSyntax(node.value || '');
    }

    // Support bold
    if (node.type === 'strong') {
      const childDeltas = node.children
        ? node.children.flatMap((child: any) =>
            this.extractDeltaFromMdastNode(child)
          )
        : [];
      return this.mergeAttributes(childDeltas, { bold: true });
    }

    // Support italic
    if (node.type === 'emphasis') {
      const childDeltas = node.children
        ? node.children.flatMap((child: any) =>
            this.extractDeltaFromMdastNode(child)
          )
        : [];
      return this.mergeAttributes(childDeltas, { italic: true });
    }

    // Support strikethrough
    if (node.type === 'delete') {
      const childDeltas = node.children
        ? node.children.flatMap((child: any) =>
            this.extractDeltaFromMdastNode(child)
          )
        : [];
      return this.mergeAttributes(childDeltas, { strike: true });
    }

    // Support inline code
    if (node.type === 'inlineCode') {
      return [{ insert: node.value, attributes: { code: true } }];
    }

    if (node.type === 'link') {
      const linkNode = node as Link;
      const childDeltas = linkNode.children
        ? linkNode.children.flatMap((child: any) =>
            this.extractDeltaFromMdastNode(child)
          )
        : [];
      return this.mergeAttributes(childDeltas, { link: linkNode.url });
    }

    if (node.type === 'image') {
      const imageNode = node as Image;
      return [{ insert: imageNode.alt || '' }];
    }

    if (node.children) {
      return node.children.flatMap((child: any) =>
        this.extractDeltaFromMdastNode(child)
      );
    }

    return [];
  }

  /**
   * Merge attributes into Delta array
   */
  private mergeAttributes(deltas: any[], newAttributes: any): any[] {
    return deltas.map(delta => ({
      ...delta,
      attributes: {
        ...delta.attributes,
        ...newAttributes,
      },
    }));
  }

  /**
   * Preprocess custom syntax and convert to standard markdown
   */
  private preprocessCustomSyntax(markdown: string): string {
    // Process highlight syntax ==text== -> <mark>text</mark>
    markdown = markdown.replace(/==(.*?)==/g, '<mark>$1</mark>');

    return markdown;
  }

  /**
   * Parse custom syntax [text]{attributes}
   */
  private parseCustomSyntax(text: string): any[] {
    const customSyntaxRegex = /\[([^\]]+)\](\{[^}]+\})/g;
    const result: any[] = [];
    let lastIndex = 0;
    let match;

    while ((match = customSyntaxRegex.exec(text)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          result.push({ insert: beforeText });
        }
      }

      const content = match[1];
      const attributesStr = match[2];
      const attributes = this.parseAttributes(attributesStr);

      result.push({
        insert: content,
        attributes,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        result.push({ insert: remainingText });
      }
    }

    // If no custom syntax found, return original text
    if (result.length === 0) {
      return [{ insert: text }];
    }

    return result;
  }

  /**
   * Parse attribute string
   */
  private parseAttributes(attributesStr: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(attributesStr);
    } catch (error) {
      // If JSON parsing fails, return empty object
      console.warn('Failed to parse attributes as JSON:', attributesStr, error);
      return {};
    }
  }
}
type Context = {
  container?: {
    id: string;
    col: string;
  };
};
export class SnapshotToMarkdownConverter {
  static async convert(snapshot: BlockSnapshot): Promise<string> {
    const converter = new SnapshotToMarkdownConverter();
    return converter.convertSnapshotToMarkdown(snapshot);
  }

  static async convertMultiple(snapshots: BlockSnapshot[]): Promise<string> {
    const converter = new SnapshotToMarkdownConverter();
    return converter.convertMultipleSnapshotsToMarkdown(snapshots);
  }

  async convertSnapshotToMarkdown(snapshot: BlockSnapshot): Promise<string> {
    const parts: string[] = [];

    for (const child of snapshot.children) {
      const markdown = await this.blockToMarkdown(child, {});
      if (markdown.trim()) {
        parts.push(markdown);
      }
    }

    const result = parts.join('\n\n');
    return result;
  }

  async convertMultipleSnapshotsToMarkdown(
    snapshots: BlockSnapshot[]
  ): Promise<string> {
    const sectionMarkdowns: string[] = [];

    for (const snapshot of snapshots) {
      const sectionMarkdown = await this.convertSnapshotToMarkdown(snapshot);
      if (sectionMarkdown.trim()) {
        sectionMarkdowns.push(sectionMarkdown);
      }
    }

    // Connect parts using split markers
    return sectionMarkdowns.join('\n\n<!-- note:split -->\n\n');
  }

  private async blockToMarkdown(
    block: BlockSnapshot,
    context: Context
  ): Promise<string> {
    switch (block.flavour) {
      case 'affine:paragraph':
        return this.paragraphToMarkdown(block);

      case 'affine:multi-column-container':
        return this.multiColumnToMarkdown(block, context);

      case 'affine:column':
        return '';

      case 'affine:list':
        return this.listToMarkdown(block);

      case 'affine:code':
        return this.codeToMarkdown(block);

      case 'affine:image':
        return this.imageToMarkdown(block);

      case 'affine:table':
        return this.tableToMarkdown(block);

      default:
        const text = this.extractTextFromBlock(block);
        return text || '';
    }
  }

  private paragraphToMarkdown(block: BlockSnapshot): string {
    const markdown = this.extractMarkdownFromBlock(block);
    const type = block.props?.type || 'text';

    switch (type) {
      case 'h1':
        return `# ${markdown}`;
      case 'h2':
        return `## ${markdown}`;
      case 'h3':
        return `### ${markdown}`;
      case 'h4':
        return `#### ${markdown}`;
      case 'h5':
        return `##### ${markdown}`;
      case 'h6':
        return `###### ${markdown}`;
      default:
        return markdown;
    }
  }
  count = 0;
  private async multiColumnToMarkdown(
    block: BlockSnapshot,
    context: Context
  ): Promise<string> {
    const parts: string[] = [];
    const containerId = `container-${this.count++}`;
    const containerDeclaration = `<!-- layout:multi-column ${JSON.stringify({
      id: containerId,
      columns: block.children.map((child, index) => ({
        id: `col-${index + 1}`,
        width: child.props?.width,
      })),
      ...(context.container
        ? { parent: context.container.id, insert: context.container.col }
        : {}),
    })} -->`;

    parts.push(containerDeclaration);

    for (let i = 0; i < block.children.length; i++) {
      const column = block.children[i];
      const columnId = `col-${i + 1}`;

      if (column.children.length > 0) {
        const contentStart = `<!-- content:column ${JSON.stringify({
          parent: containerId,
          insert: columnId,
        })} -->`;

        const contentParts: string[] = [];
        for (const contentChild of column.children) {
          const markdown = await this.blockToMarkdown(contentChild, {
            container: {
              id: containerId,
              col: columnId,
            },
          });
          if (markdown.trim()) {
            contentParts.push(markdown);
          }
        }

        const contentEnd = '<!-- end:content:column -->';

        parts.push(contentStart);
        if (contentParts.length > 0) {
          parts.push(contentParts.join('\n\n'));
        }
        parts.push(contentEnd);
      }
    }

    return parts.join('\n\n');
  }

  private listToMarkdown(block: BlockSnapshot): string {
    const markdown = this.extractMarkdownFromBlock(block);
    const type = block.props?.type || 'bulleted';
    const checked = block.props?.checked;

    switch (type) {
      case 'numbered':
        return `1. ${markdown}`;
      case 'todo':
        const checkmark = checked ? '[x]' : '[ ]';
        return `- ${checkmark} ${markdown}`;
      case 'bulleted':
      default:
        return `- ${markdown}`;
    }
  }

  private codeToMarkdown(block: BlockSnapshot): string {
    const text = this.extractTextFromBlock(block);
    const language = block.props?.language || '';

    return `\`\`\`${language}\n${text}\n\`\`\``;
  }

  private imageToMarkdown(block: BlockSnapshot): string {
    const sourceId = block.props?.sourceId || '';
    const caption = block.props?.caption || '';

    return `![${caption}](${sourceId})`;
  }

  private tableToMarkdown(block: BlockSnapshot): string {
    const { columns, rows, cells } = block.props || {};
    if (!columns || !rows || !cells) {
      return '';
    }

    const table = this.processTableForMarkdown(columns, rows, cells);
    return this.formatTableAsMarkdown(table.rows);
  }

  private processTableForMarkdown(columns: any, rows: any, cells: any): any {
    const sortedColumns = Object.values(columns).sort((a: any, b: any) =>
      a.order.localeCompare(b.order)
    );
    const sortedRows = Object.values(rows).sort((a: any, b: any) =>
      a.order.localeCompare(b.order)
    );

    const tableRows: any[] = [];
    sortedRows.forEach((r: any) => {
      const row: any[] = [];
      sortedColumns.forEach((col: any) => {
        const cell = cells[`${r.rowId}:${col.columnId}`];
        if (!cell) {
          row.push('');
          return;
        }
        const cellText = this.extractMarkdownFromCellText(cell.text);
        row.push(cellText);
      });
      tableRows.push(row);
    });

    return { rows: tableRows };
  }

  private extractMarkdownFromCellText(text: any): string {
    if (text && typeof text === 'object' && 'delta' in text) {
      return (text as any).delta
        .map((d: any) => {
          let insert = d.insert || '';

          if (d.attributes) {
            // Process links
            if (d.attributes.link) {
              insert = `[${insert}](${d.attributes.link})`;
            }
            // Process standard markdown format
            else if (
              d.attributes.bold &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `**${insert}**`;
            } else if (
              d.attributes.italic &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `*${insert}*`;
            } else if (
              d.attributes.strike &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `~~${insert}~~`;
            } else if (
              d.attributes.code &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `\`${insert}\``;
            }
            // Process custom syntax
            else {
              const customAttributes = this.buildCustomAttributes(d.attributes);
              if (customAttributes) {
                insert = `[${insert}]${customAttributes}`;
              }
            }
          }

          return insert;
        })
        .join('');
    }
    return '';
  }

  private formatTableAsMarkdown(rows: string[][]): string {
    if (rows.length === 0) {
      return '';
    }

    const columnWidths = this.calculateColumnWidths(rows);
    const formattedRows = rows.map((row, index) =>
      this.formatTableRow(row, columnWidths, index === 0)
    );
    return formattedRows.join('\n');
  }

  private calculateColumnWidths(rows: string[][]): number[] {
    return (
      rows[0]?.map((_, colIndex) =>
        Math.max(...rows.map(row => (row[colIndex] || '').length))
      ) ?? []
    );
  }

  private formatTableRow(
    row: string[],
    columnWidths: number[],
    isHeader: boolean
  ): string {
    const cells = row.map((cell, colIndex) =>
      cell?.padEnd(columnWidths[colIndex] ?? 0, ' ')
    );
    const rowString = `| ${cells.join(' | ')} |`;
    return isHeader
      ? `${rowString}\n${this.formatTableSeparator(columnWidths)}`
      : rowString;
  }

  private formatTableSeparator(columnWidths: number[]): string {
    const separator = columnWidths.map(width => '-'.repeat(width)).join(' | ');
    return `| ${separator} |`;
  }

  private extractTextFromBlock(block: BlockSnapshot): string {
    const text = block.props?.text;

    if (text && typeof text === 'object' && 'delta' in text) {
      return (text as any).delta.map((d: any) => d.insert || '').join('');
    }

    if (typeof text === 'string') {
      return text;
    }

    return '';
  }

  private extractMarkdownFromBlock(block: BlockSnapshot): string {
    const text = block.props?.text;

    if (text && typeof text === 'object' && 'delta' in text) {
      return (text as any).delta
        .map((d: any) => {
          let insert = d.insert || '';

          if (d.attributes) {
            // Process links
            if (d.attributes.link) {
              insert = `[${insert}](${d.attributes.link})`;
            }
            // Process standard markdown format
            else if (
              d.attributes.bold &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `**${insert}**`;
            } else if (
              d.attributes.italic &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `*${insert}*`;
            } else if (
              d.attributes.strike &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `~~${insert}~~`;
            } else if (
              d.attributes.code &&
              !d.attributes.color &&
              !d.attributes.background
            ) {
              insert = `\`${insert}\``;
            }
            // Process custom syntax
            else {
              const customAttributes = this.buildCustomAttributes(d.attributes);
              if (customAttributes) {
                insert = `[${insert}]${customAttributes}`;
              }
            }
          }

          return insert;
        })
        .join('');
    }

    if (typeof text === 'string') {
      return text;
    }

    return '';
  }

  /**
   * Build custom attribute string as JSON
   */
  private buildCustomAttributes(attributes: any): string {
    const jsonAttributes: any = {};

    // Copy all attributes except link (which is handled separately)
    Object.keys(attributes).forEach(key => {
      if (key !== 'link') {
        jsonAttributes[key] = attributes[key];
      }
    });

    // Return JSON string if there are any attributes
    if (Object.keys(jsonAttributes).length > 0) {
      return JSON.stringify(jsonAttributes);
    }

    return '';
  }
}

export class SimpleLayoutConverter {
  static async markdownToSnapshot(markdown: string): Promise<BlockSnapshot> {
    return MarkdownToSnapshotConverter.convert(markdown);
  }

  static async markdownToMultipleSnapshots(
    markdown: string
  ): Promise<BlockSnapshot[]> {
    return MarkdownToSnapshotConverter.convertWithSplit(markdown);
  }

  static async snapshotToMarkdown(snapshot: BlockSnapshot): Promise<string> {
    return SnapshotToMarkdownConverter.convert(snapshot);
  }

  static async multipleSnapshotsToMarkdown(
    snapshots: BlockSnapshot[]
  ): Promise<string> {
    return SnapshotToMarkdownConverter.convertMultiple(snapshots);
  }
}
