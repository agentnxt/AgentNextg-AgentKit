import { Text, type Workspace } from '@blocksuite/affine/store';
import type { InitFn } from './utils.js';

export const professionalFinanceReport: InitFn = async (
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
      title: new Text('专业财务分析报告'),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock(
      'affine:note',
      { xywh: '[0, 100, 1000, 1200]' },
      rootId
    );

    // === 报告标题和概述 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '腾讯控股有限公司', attributes: { bold: true } },
        ]),
        type: 'h1',
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '投资分析报告', attributes: { italic: true } },
        ]),
        type: 'h2',
      },
      noteId
    );

    // 报告基本信息
    const basicInfoContainerId = store.addBlock(
      'affine:multi-column-container',
      { gap: 24 },
      noteId
    );

    const infoColumn1Id = store.addBlock(
      'affine:column',
      { widthPercentage: 33.33 },
      basicInfoContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '股票代码：', attributes: { bold: true } },
          { insert: '00700.HK' },
        ]),
        type: 'text',
      },
      infoColumn1Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '当前价格：', attributes: { bold: true } },
          { insert: '¥368.50' },
        ]),
        type: 'text',
      },
      infoColumn1Id
    );

    const infoColumn2Id = store.addBlock(
      'affine:column',
      { widthPercentage: 33.33 },
      basicInfoContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '市值：', attributes: { bold: true } },
          { insert: '¥3.52万亿' },
        ]),
        type: 'text',
      },
      infoColumn2Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '行业：', attributes: { bold: true } },
          { insert: '互联网科技' },
        ]),
        type: 'text',
      },
      infoColumn2Id
    );

    const infoColumn3Id = store.addBlock(
      'affine:column',
      { widthPercentage: 33.33 },
      basicInfoContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '报告日期：', attributes: { bold: true } },
          { insert: '2024年12月31日' },
        ]),
        type: 'text',
      },
      infoColumn3Id
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '分析师：', attributes: { bold: true } },
          { insert: '投资研究部' },
        ]),
        type: 'text',
      },
      infoColumn3Id
    );

    // === 核心财务指标 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '核心财务指标', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    const metricsContainerId = store.addBlock(
      'affine:multi-column-container',
      { gap: 20 },
      noteId
    );

    // 营收指标列
    const revenueColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      metricsContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '营业收入', attributes: { bold: true } }]),
        type: 'h3',
      },
      revenueColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '¥5,545.2亿',
            attributes: { bold: true, color: '#059669' },
          },
        ]),
        type: 'text',
      },
      revenueColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '同比增长 +15.2%', attributes: { color: '#059669' } },
        ]),
        type: 'text',
      },
      revenueColumnId
    );

    // 利润指标列
    const profitColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      metricsContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '净利润', attributes: { bold: true } }]),
        type: 'h3',
      },
      profitColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '¥1,025.7亿',
            attributes: { bold: true, color: '#3b82f6' },
          },
        ]),
        type: 'text',
      },
      profitColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '净利润率 18.5%', attributes: { color: '#3b82f6' } },
        ]),
        type: 'text',
      },
      profitColumnId
    );

    // 现金流指标列
    const cashflowColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      metricsContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '经营现金流', attributes: { bold: true } }]),
        type: 'h3',
      },
      cashflowColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '¥1,456.8亿',
            attributes: { bold: true, color: '#f59e0b' },
          },
        ]),
        type: 'text',
      },
      cashflowColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '现金流充沛', attributes: { color: '#f59e0b' } },
        ]),
        type: 'text',
      },
      cashflowColumnId
    );

    // ROE指标列
    const roeColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      metricsContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: 'ROE', attributes: { bold: true } }]),
        type: 'h3',
      },
      roeColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '16.8%', attributes: { bold: true, color: '#8b5cf6' } },
        ]),
        type: 'text',
      },
      roeColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '股东回报优异', attributes: { color: '#8b5cf6' } },
        ]),
        type: 'text',
      },
      roeColumnId
    );

    // === 风险评估 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '风险评估', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    const riskContainerId = store.addBlock(
      'affine:multi-column-container',
      { gap: 20 },
      noteId
    );

    // 市场风险
    const marketRiskColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      riskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '市场风险', attributes: { bold: true } }]),
        type: 'h4',
      },
      marketRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '中等', attributes: { bold: true, color: '#f59e0b' } },
        ]),
        type: 'text',
      },
      marketRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '市场波动影响，需持续关注' }]),
        type: 'text',
      },
      marketRiskColumnId
    );

    // 信用风险
    const creditRiskColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      riskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '信用风险', attributes: { bold: true } }]),
        type: 'h4',
      },
      creditRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '低', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'text',
      },
      creditRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '信用状况良好，违约概率低' }]),
        type: 'text',
      },
      creditRiskColumnId
    );

    // 流动性风险
    const liquidityRiskColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      riskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '流动性风险', attributes: { bold: true } }]),
        type: 'h4',
      },
      liquidityRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '低', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'text',
      },
      liquidityRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '资金流动性充足，变现能力强' }]),
        type: 'text',
      },
      liquidityRiskColumnId
    );

    // 运营风险
    const operationalRiskColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 25 },
      riskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '运营风险', attributes: { bold: true } }]),
        type: 'h4',
      },
      operationalRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '低', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'text',
      },
      operationalRiskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '运营体系成熟，管理风险可控' }]),
        type: 'text',
      },
      operationalRiskColumnId
    );

    // === 投资建议 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资建议', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    const recommendationContainerId = store.addBlock(
      'affine:multi-column-container',
      { gap: 32 },
      noteId
    );

    // 投资评级列
    const ratingColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 40 },
      recommendationContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资评级', attributes: { bold: true } }]),
        type: 'h3',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '买入', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'h1',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '目标价位：', attributes: { bold: true } },
          { insert: '¥420.00', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '预期收益：', attributes: { bold: true } },
          { insert: '+14.0%', attributes: { bold: true, color: '#059669' } },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '投资期限：', attributes: { bold: true } },
          { insert: '中长期（12-18个月）' },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '风险等级：', attributes: { bold: true } },
          { insert: '中低风险', attributes: { color: '#f59e0b' } },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    // 投资亮点列
    const highlightsColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 60 },
      recommendationContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资亮点', attributes: { bold: true } }]),
        type: 'h3',
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          {
            insert:
              '营收同比增长15.2%，连续四个季度保持双位数增长，超出市场预期',
          },
        ]),
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '净利润率18.5%，处于行业领先水平，盈利能力持续提升' },
        ]),
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '市场份额稳步提升至23.7%，竞争优势明显，护城河深厚' },
        ]),
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '现金流充沛达1,456.8亿，财务状况稳健，抗风险能力强' },
        ]),
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: 'ROE达16.8%，股东回报优异，管理层执行力强' },
        ]),
      },
      highlightsColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '创新业务布局前瞻，AI、云计算等新兴领域投入加大' },
        ]),
      },
      highlightsColumnId
    );

    // === 投资建议总结 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资建议总结', attributes: {} }]),
        type: 'h3',
      },
      noteId
    );

    const summaryContainerId = store.addBlock(
      'affine:multi-column-container',
      { gap: 24 },
      noteId
    );

    const summaryColumnId = store.addBlock(
      'affine:column',
      { widthPercentage: 100 },
      summaryContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '基于强劲的财务表现、良好的市场前景和稳健的风险控制能力，我们给予腾讯控股',
            attributes: {},
          },
          { insert: '"买入"', attributes: { bold: true, color: '#059669' } },
          {
            insert:
              '评级，目标价位420.00元，预期收益14.0%。建议投资者积极关注并适当配置，投资期限建议12-18个月。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      summaryColumnId
    );

    // === 免责声明 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '免责声明：本报告基于公开信息和财务数据分析，仅供投资参考。投资有风险，决策需谨慎。过往业绩不代表未来表现，投资者应根据自身风险承受能力做出投资决策。',
            attributes: { italic: true, color: '#6b7280' },
          },
        ]),
        type: 'text',
      },
      noteId
    );
  }

  store.resetHistory();
};

professionalFinanceReport.id = 'professional-finance-report';
professionalFinanceReport.displayName = '专业财务分析报告';
professionalFinanceReport.description = '使用多列布局展示的专业财务分析报告';
