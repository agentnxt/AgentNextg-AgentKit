import { Text, type Workspace } from '@blocksuite/affine/store';
import { MarkdownTransformer } from '@blocksuite/affine/widgets/linked-doc';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

import type { InitFn } from './utils.js';

const museumInvitationMarkdown = `# 🎨 高雄市立美術館開幕邀請函

**Kaohsiung Museum of Fine Arts**

真正的多重嵌套multi-column橫向布局實現。

---

*歡迎蒞臨參觀*`;

export const museumInvitation: InitFn = async (
  collection: Workspace,
  id: string
) => {
  let doc = collection.getDoc(id);
  const hasDoc = !!doc;
  if (!doc) {
    doc = collection.createDoc(id);
  }

  const store = doc.getStore({ id });
  store.load();

  // Run only once on all clients.
  if (!hasDoc) {
    // Add root block and surface block at root level
    const rootId = store.addBlock('affine:page', {
      title: new Text('博物館開幕邀請函 - 圖片布局復刻'),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock(
      'affine:note',
      { xywh: '[0, 100, 800, 640]' },
      rootId
    );

    // 標題
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('🎨 高雄市立美術館開幕邀請函'),
        type: 'h1',
      },
      noteId
    );

    // === 主要布局：左右兩大列 ===
    const mainContainerId = store.addBlock(
      'affine:multi-column-container',
      {
        gap: 20,
      },
      noteId
    );

    // 左側大列 - 35%寬度
    const leftColumnId = store.addBlock(
      'affine:column',
      {
        widthPercentage: 35,
      },
      mainContainerId
    );

    // 左側內容：開幕茶會信息
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('OPENING & RECEPTION'),
        type: 'h2',
      },
      leftColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('開幕暨茶會'),
        type: 'text',
      },
      leftColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('2018.09.21 FRI'),
        type: 'h1',
      },
      leftColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('持本邀請函憑證入場或展覽期間免費參觀，敬請攜帶身分證件'),
        type: 'text',
      },
      leftColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('FREE admission for holders and a guest on the opening day or exhibition duration.'),
        type: 'text',
      },
      leftColumnId
    );

    // 右側大列 - 65%寬度
    const rightColumnId = store.addBlock(
      'affine:column',
      {
        widthPercentage: 65,
      },
      mainContainerId
    );

    // === 右側第一行：兩列布局 ===
    const row1ContainerId = store.addBlock(
      'affine:multi-column-container',
      {
        gap: 10,
      },
      rightColumnId
    );

    // 第一行第一列
    const row1Col1Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 50,
      },
      row1ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('14:00'),
        type: 'h2',
      },
      row1Col1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('入場'),
        type: 'text',
      },
      row1Col1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Admission'),
        type: 'text',
      },
      row1Col1Id
    );

    // 第一行第二列
    const row1Col2Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 50,
      },
      row1ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('14:30'),
        type: 'h2',
      },
      row1Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('開幕儀式'),
        type: 'text',
      },
      row1Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Opening Ceremony'),
        type: 'text',
      },
      row1Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('16:00'),
        type: 'h2',
      },
      row1Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('開幕茶會'),
        type: 'text',
      },
      row1Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Reception'),
        type: 'text',
      },
      row1Col2Id
    );

    // === 右側第二行：單個HTML塊 ===
    const htmlContent = `
<div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: #ecf0f1; padding: 20px; text-align: center; border-radius: 8px; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
  <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px;">高雄市立美術館</div>
  <div style="font-size: 14px; opacity: 0.9; letter-spacing: 1px;">Kaohsiung Museum of Fine Arts</div>
  <div style="margin: 15px 0; width: 40px; height: 40px; border: 2px solid #ecf0f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 15px auto;">🎨</div>
</div>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(htmlContent),
        language: 'html',
      },
      rightColumnId
    );

    // === 右側第三行：四列布局 ===
    const row3ContainerId = store.addBlock(
      'affine:multi-column-container',
      {
        gap: 8,
      },
      rightColumnId
    );

    // 第三行第一列：館長
    const row3Col1Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 25,
      },
      row3ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('館長'),
        type: 'h3',
      },
      row3Col1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Mr. Lin Yin'),
        type: 'text',
      },
      row3Col1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('高雄市立美術館館長'),
        type: 'text',
      },
      row3Col1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Director General of Kaohsiung Museum'),
        type: 'text',
      },
      row3Col1Id
    );

    // 第三行第二列：策展人
    const row3Col2Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 25,
      },
      row3ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('策展人'),
        type: 'h3',
      },
      row3Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Ms. Yuelin Lee'),
        type: 'text',
      },
      row3Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('高雄市立美術館策展人'),
        type: 'text',
      },
      row3Col2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Director of Kaohsiung Museum of Fine Arts'),
        type: 'text',
      },
      row3Col2Id
    );

    // 第三行第三列：貴賓接待
    const row3Col3Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 25,
      },
      row3ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('貴賓接待'),
        type: 'h3',
      },
      row3Col3Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('Dr. Huang Sun-Quan'),
        type: 'text',
      },
      row3Col3Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('高雄市政府文化局'),
        type: 'text',
      },
      row3Col3Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('The Representative of the Organising Team'),
        type: 'text',
      },
      row3Col3Id
    );

    // 第三行第四列：敬邀
    const row3Col4Id = store.addBlock(
      'affine:column',
      {
        widthPercentage: 25,
      },
      row3ContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('敬邀'),
        type: 'h2',
      },
      row3Col4Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('🎨'),
        type: 'text',
      },
      row3Col4Id
    );

    // 說明文字
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('💡 布局說明 - 完全按照圖片結構實現'),
        type: 'h3',
      },
      noteId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text('左側：一大列（35%寬度）包含開幕茶會信息和日期'),
      },
      noteId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text('右側第一行：兩列布局（14:00入場 | 14:30開幕儀式+16:00茶會）'),
      },
      noteId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text('右側第二行：一個HTML塊（美術館標題和圖標）'),
      },
      noteId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text('右側第三行：四列布局（館長 | 策展人 | 貴賓接待 | 敬邀）'),
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text('這個布局完全復刻了圖片中的結構：左邊一列，右邊三行，第一行兩列，第二行HTML，第三行四列！'),
        type: 'text',
      },
      noteId
    );
  }

  store.resetHistory();
};

// 設置函數屬性以便playground系統識別
museumInvitation.id = 'museum-invitation';
museumInvitation.displayName = '博物館開幕邀請函';
museumInvitation.description = '使用多重嵌套multi-column布局和HTML代碼塊實現的博物館開幕邀請函設計';