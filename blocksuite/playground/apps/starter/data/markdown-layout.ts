import { AffineSchemas } from '@blocksuite/affine/schemas';
import {
  Schema,
  Text,
  Transformer,
  type Workspace,
} from '@blocksuite/affine/store';
import { SimpleLayoutConverter } from '@blocksuite/affine-shared/adapters';

import type { InitFn } from './utils.js';

export const markdownLayout: InitFn = async (
  collection: Workspace,
  id: string
) => {
  const doc = collection.getDoc(id) ?? collection.createDoc(id);
  const store = doc.getStore();
  doc.clear();

  // 创建紧凑的混合测试内容，包含所有功能的精简示例
  const compactMixedContent = `[August 2025]{"color":"oklch(38.2% 0.18 250)","bg":"oklch(98% 0.02 250)"}  

<!-- layout:multi-column{"id": "mc-hero","columns": [{ "id": "col-hero-1", "width": 60 },{ "id": "col-hero-2", "width": 40 }]}-->
<!-- content:column{"parent": "mc-hero","insert": "col-hero-1"} -->

[Your essential, premium guide to Japan’s Golden Route in the vibrant summer.]{".italic","color":"oklch(45% 0.13 250)"}

- [7 days, 3 cities, endless memories]{".bold","color":"oklch(38.2% 0.18 250)"}
- [Tokyo → Kyoto → Osaka]{".bold","color":"oklch(38.2% 0.18 250)"}
- [Curated tips, etiquette, and pro travel hacks]{".italic","color":"oklch(45% 0.13 250)"}

<!-- end:content:column -->
<!-- content:column{"parent": "mc-hero","insert": "col-hero-2"} -->
\`\`\`html
<div class="flex flex-col items-center justify-center h-full">
  <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" alt="Japan" class="rounded-xl shadow-lg w-48 h-32 object-cover mb-2">
  <div class="text-xs text-gray-500 mt-1">Photo: Tokyo, Unsplash</div>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"🌡️ August Weather & Packing","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-weather","columns": [{ "id": "col-weather-1", "width": 50 },{ "id": "col-weather-2", "width": 50 }]}-->
<!-- content:column{"parent": "mc-weather","insert": "col-weather-1"} -->

## [🌡️ August Weather Snapshot]{"color":"oklch(32% 0.18 250)"}

|  |  |
|--|--|
| [Temperature]{"color":"oklch(38% 0.18 250)"} | 25–35°C (77–95°F) |
| [Humidity]{"color":"oklch(38% 0.18 250)"} | 70–80% (very high) |
| [Rainfall]{"color":"oklch(38% 0.18 250)"} | Occasional showers |
| [Conditions]{"color":"oklch(38% 0.18 250)"} | Hot, humid, sunny |

\`\`\`html
<div class="flex gap-2 mt-2">
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#f7e7e1] text-[#b85c38] text-xs font-semibold mr-2">☀️ Hot</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#e1f0f7] text-[#387ab8] text-xs font-semibold mr-2">💧 Humid</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#e1f7e4] text-[#38b87a] text-xs font-semibold">🌦️ Showers</span>
</div>
\`\`\`
<!-- end:content:column -->
<!-- content:column{"parent": "mc-weather","insert": "col-weather-2"} -->

## [🎒 What to Pack]{"color":"oklch(32% 0.18 250)"}

- [Light, breathable clothing (cotton/linen)]{"color":"oklch(45% 0.13 250)"}
- [Moisture-wicking shirts]{"color":"oklch(45% 0.13 250)"}
- [Portable umbrella, sunscreen (SPF 30+), hat]{"color":"oklch(45% 0.13 250)"}
- [Comfortable walking shoes]{"color":"oklch(45% 0.13 250)"}
- [Portable fan, cooling towels, insect repellent]{"color":"oklch(45% 0.13 250)"}

\`\`\`html
<div class="flex flex-wrap gap-2 mt-2">
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#e1f7e4] text-[#38b87a] text-xs font-semibold">🧢</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#f7e7e1] text-[#b85c38] text-xs font-semibold">🩳</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#e1f0f7] text-[#387ab8] text-xs font-semibold">🧴</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#f7f1e1] text-[#b89a38] text-xs font-semibold">👟</span>
  <span class="inline-flex items-center px-2 py-1 rounded bg-[#e1e7f7] text-[#385cb8] text-xs font-semibold">🌂</span>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"🗾 The Golden Route Overview","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-route","columns": [{ "id": "col-route-1", "width": 60 },{ "id": "col-route-2", "width": 40 }]}-->
<!-- content:column{"parent": "mc-route","insert": "col-route-1"} -->

## [🗾 Golden Route]{"color":"oklch(32% 0.18 250)"}

[Tokyo (3 days) → Kyoto (2 days) → Osaka (2 days)]{"color":"oklch(38% 0.18 250)"}

[The classic first-timer’s route, blending tradition, modernity, and culinary adventure.]{".italic","color":"oklch(45% 0.13 250)"}

<!-- end:content:column -->
<!-- content:column{"parent": "mc-route","insert": "col-route-2"} -->
\`\`\`html
<div class="flex flex-col items-center">
  <div class="flex items-center gap-2 text-lg font-bold">
    <span class="text-[#387ab8]">🗼</span>
    <span class="text-gray-700">Tokyo</span>
    <span class="text-gray-400">→</span>
    <span class="text-[#b89a38]">⛩️</span>
    <span class="text-gray-700">Kyoto</span>
    <span class="text-gray-400">→</span>
    <span class="text-[#38b87a]">🍜</span>
    <span class="text-gray-700">Osaka</span>
  </div>
  <div class="text-xs text-gray-500 mt-1">3 Cities, 7 Days, 1 Unforgettable Journey</div>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"📅 7-Day Itinerary","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-itinerary","columns": [{ "id": "col-itin-1", "width": 50 },{ "id": "col-itin-2", "width": 50 }]}-->
<!-- content:column{"parent": "mc-itinerary","insert": "col-itin-1"} -->

### [Day 1: Tokyo Arrival & Shinjuku]{"color":"oklch(32% 0.18 250)"}
- Arrive at Narita/Haneda Airport
- Check into hotel in Shinjuku
- Explore Omoide Yokocho, Kabukicho
- Dinner: Izakaya

### [Day 2: Traditional & Modern Tokyo]{"color":"oklch(32% 0.18 250)"}
- Senso-ji Temple, Nakamise Street
- Ginza shopping, Tsukiji sushi
- Tokyo Skytree/Tower

### [Day 3: Tokyo → Kyoto]{"color":"oklch(32% 0.18 250)"}
- Harajuku, Meiji Shrine, Shibuya
- Shinkansen to Kyoto
- Gion district stroll

### [Day 4: Kyoto Temples & Bamboo]{"color":"oklch(32% 0.18 250)"}
- Kinkaku-ji, Ryoan-ji
- Arashiyama Bamboo Grove
- Tenryu-ji, Kaiseki dinner

<!-- end:content:column -->
<!-- content:column{"parent": "mc-itinerary","insert": "col-itin-2"} -->

### [Day 5: Kyoto → Osaka]{"color":"oklch(32% 0.18 250)"}
- Fushimi Inari Shrine
- Nishiki Market food tour
- Travel to Osaka, Dotonbori

### [Day 6: Osaka Castle & Food]{"color":"oklch(32% 0.18 250)"}
- Osaka Castle, Kuromon Market
- Dotonbori food crawl: takoyaki, okonomiyaki, kushikatsu

### [Day 7: Departure]{"color":"oklch(32% 0.18 250)"}
- Last-minute shopping (Namba/Umeda)
- Depart from Kansai Airport

\`\`\`html
<div class="mt-4 p-3 rounded-lg bg-[#e1f0f7] text-[#387ab8] text-sm flex items-center gap-2">
  <span>💡</span>
  <span>Tip: Start sightseeing early or late to avoid the midday heat!</span>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"🚄 Transportation Guide","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-transport","columns": [{ "id": "col-trans-1", "width": 50 },{ "id": "col-trans-2", "width": 50 }]}-->
<!-- content:column{"parent": "mc-transport","insert": "col-trans-1"} -->

### [🚄 JR Pass (7-Day)]{"color":"oklch(32% 0.18 250)"}
- [Cost:]{"color":"oklch(38% 0.18 250)"} ¥30,000–35,000 (~$200–240)
- [Coverage:]{"color":"oklch(38% 0.18 250)"} All JR trains, Shinkansen
- [Activation:]{"color":"oklch(38% 0.18 250)"} Within 3 months of purchase

### [🚇 Local Transport]{"color":"oklch(32% 0.18 250)"}
- [IC Cards:]{"color":"oklch(38% 0.18 250)"} Suica (Tokyo), ICOCA (Osaka/Kyoto)
- [Cost:]{"color":"oklch(38% 0.18 250)"} ¥1,000–2,000/day
- [Apps:]{"color":"oklch(38% 0.18 250)"} Google Maps, Hyperdia

<!-- end:content:column -->
<!-- content:column{"parent": "mc-transport","insert": "col-trans-2"} -->
\`\`\`html
<div class="flex flex-col gap-2">
  <div class="flex items-center gap-2 bg-[#e1f7e4] rounded px-2 py-1 text-[#38b87a] text-sm font-semibold">
    <span>🚄</span> <span>JR Pass</span>
  </div>
  <div class="flex items-center gap-2 bg-[#e1f0f7] rounded px-2 py-1 text-[#387ab8] text-sm font-semibold">
    <span>🚇</span> <span>IC Cards</span>
  </div>
  <div class="flex items-center gap-2 bg-[#f7e7e1] rounded px-2 py-1 text-[#b85c38] text-sm font-semibold">
    <span>📱</span> <span>Apps</span>
  </div>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"🏨 Accommodation","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-accom","columns": [{ "id": "col-accom-1", "width": 33 },{ "id": "col-accom-2", "width": 34 },{ "id": "col-accom-3", "width": 33 }]}-->
<!-- content:column{"parent": "mc-accom","insert": "col-accom-1"} -->

### [Tokyo]{"color":"oklch(32% 0.18 250)"}
- [Budget:]{"color":"oklch(38% 0.18 250)"} Capsule/hostel ¥3,000–6,000
- [Mid-range:]{"color":"oklch(38% 0.18 250)"} Shinjuku/Shibuya ¥8,000–15,000
- [Luxury:]{"color":"oklch(38% 0.18 250)"} Ginza/Roppongi ¥20,000+

<!-- end:content:column -->
<!-- content:column{"parent": "mc-accom","insert": "col-accom-2"} -->

### [Kyoto]{"color":"oklch(32% 0.18 250)"}
- [Traditional:]{"color":"oklch(38% 0.18 250)"} Ryokan ¥15,000–30,000
- [Modern:]{"color":"oklch(38% 0.18 250)"} Near Kyoto Stn ¥8,000–18,000
- [Budget:]{"color":"oklch(38% 0.18 250)"} Gion guesthouse ¥4,000–8,000

<!-- end:content:column -->
<!-- content:column{"parent": "mc-accom","insert": "col-accom-3"} -->

### [Osaka]{"color":"oklch(32% 0.18 250)"}
- [Areas:]{"color":"oklch(38% 0.18 250)"} Namba, Umeda, Dotonbori
- [Range:]{"color":"oklch(38% 0.18 250)"} ¥6,000–20,000
- [Features:]{"color":"oklch(38% 0.18 250)"} Food & transport access

<!-- end:content:column -->

<!-- note:split{"title":"🍜 Food & Dining","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-food","columns": [{ "id": "col-food-1", "width": 60 },{ "id": "col-food-2", "width": 40 }]}-->
<!-- content:column{"parent": "mc-food","insert": "col-food-1"} -->

### [Must-Try Dishes by City]{"color":"oklch(32% 0.18 250)"}

| [Tokyo]{"color":"oklch(38% 0.18 250)"} | [Kyoto]{"color":"oklch(38% 0.18 250)"} | [Osaka]{"color":"oklch(38% 0.18 250)"} |
|-----------|-----------|-----------|
| Fresh sushi at Tsukiji | Kaiseki (multi-course) | Takoyaki (octopus balls) |
| Ramen in Shibuya | Tofu cuisine | Okonomiyaki (savory pancake) |
| Tempura | Matcha & wagashi | Kushikatsu (fried skewers) |
| Yakitori in izakaya | Yudofu (hot tofu) | Kansai-style sushi |

<!-- end:content:column -->
<!-- content:column{"parent": "mc-food","insert": "col-food-2"} -->

### [Dining Etiquette]{"color":"oklch(32% 0.18 250)"}

- [Chopsticks:]{"color":"oklch(38% 0.18 250)"} Never upright in rice
- [Slurping:]{"color":"oklch(38% 0.18 250)"} Encouraged for noodles
- [Tipping:]{"color":"oklch(38% 0.18 250)"} Not customary
- [Payment:]{"color":"oklch(38% 0.18 250)"} Often cash-only

\`\`\`html
<div class="mt-2 p-2 rounded-lg bg-[#f7e7e1] text-[#b85c38] text-xs flex items-center gap-2">
  <span>🍣</span>
  <span>Try local specialties in each city for the best experience!</span>
</div>
\`\`\`
<!-- end:content:column -->

<!-- note:split{"title":"💰 Budget Breakdown","backgroundColor":"oklch(98% 0.02 250)"} -->

<!-- layout:multi-column{"id": "mc-budget","columns": [{ "id": "col-budget-1", "width": 50 },{ "id": "col-budget-2", "width": 50 }]}-->
<!-- content:column{"parent": "mc-budget","insert": "col-budget-1"} -->
`;
  const contentToTest = compactMixedContent;
  const testTitle = '🎨 完整功能混合测试';
  const testDescription = '富文本语法、表格支持、文档分割与多列布局的完整解析';

  // 然后异步加载内容
  doc.load(async () => {
    // 先创建基本的页面结构，确保 root 存在
    const rootId = store.addBlock('affine:page', {
      title: new Text(testTitle),
    });
    store.addBlock('affine:surface', {}, rootId);
    console.log(`🚀 开始测试 ${testDescription} 功能...`);
    console.log(`📋 测试内容: 富文本语法 + 复杂多列布局 + HTML 组件`);
    console.log(
      `💡 功能包括: 加粗、斜体、删除线、高亮、自定义颜色、背景色、嵌套多列布局`
    );

    try {
      // 使用 SimpleLayoutConverter 解析 Markdown 并生成 snapshot
      const snapshots =
        await SimpleLayoutConverter.markdownToMultipleSnapshots(contentToTest);

      console.log('✅ Markdown 解析成功！', snapshots);

      // 创建 Transformer 实例
      const schema = new Schema();
      schema.register(AffineSchemas);

      const transformer = new Transformer({
        schema,
        blobCRUD: {
          get: async () => null,
          set: async () => '',
          delete: async () => {},
          list: async () => [],
        },
        docCRUD: {
          create: (id: string) => collection.createDoc(id).getStore(),
          get: (id: string) => collection.getDoc(id)?.getStore() || null,
          delete: async () => {},
        },
      });

      for (const snapshot of snapshots) {
        await transformer.snapshotToBlock(snapshot, store, rootId);
      }

      console.log('✅ 页面内容生成完成！所有内容都通过 Markdown 解析器生成。');

      // 测试双向转换
      setTimeout(async () => {
        try {
          console.log('🔄 开始测试双向转换...');

          // 将生成的 snapshot 转换回 Markdown
          const backToMarkdown =
            await SimpleLayoutConverter.multipleSnapshotsToMarkdown(snapshots);
          console.log('✅ 双向转换测试成功！');
          console.log(
            '📄 转换回的 Markdown 长度:',
            backToMarkdown.length,
            '字符'
          );
          console.log('📄 转换回的 Markdown 内容:', backToMarkdown);
        } catch (error) {
          console.error('❌ 双向转换测试失败:', error);
        }
      }, 2000);

      console.log(
        '✅ 所有功能（富文本、表格、文档分割、多列布局）已通过合并内容一起解析完成！'
      );
    } catch (error) {
      console.error('❌ Markdown 解析失败:', error);

      // 如果解析失败，添加错误信息到已存在的页面
      const noteId = store.addBlock(
        'affine:note',
        { xywh: '[0, 100, 800, 95%]' },
        rootId
      );

      store.addBlock(
        'affine:paragraph',
        {
          text: new Text('❌ Markdown 解析失败'),
          type: 'h1',
        },
        noteId
      );

      store.addBlock(
        'affine:paragraph',
        {
          text: new Text('查看控制台了解详细错误信息。'),
          type: 'text',
        },
        noteId
      );

      store.addBlock(
        'affine:code',
        {
          text: new Text(
            `错误信息: ${error instanceof Error ? error.message : String(error)}`
          ),
          language: 'text',
        },
        noteId
      );
    }
  });

  store.resetHistory();
};

markdownLayout.id = 'markdown-layout';
markdownLayout.displayName = 'Markdown 解析器测试';
markdownLayout.description =
  '测试富文本语法扩展、表格支持、文档分割与复杂多列布局的完整混合解析功能';
