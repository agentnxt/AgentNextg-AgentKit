import { Text, type Workspace } from '@blocksuite/affine/store';
import { MarkdownTransformer } from '@blocksuite/affine/widgets/linked-doc';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

import type { InitFn } from './utils.js';

const financialReportMarkdown = `# 📈 季度财务分析报告

**报告期间：** 2024年第四季度  
**报告日期：** 2024年12月31日  
**分析师：** 投资研究部

## 执行摘要

本季度公司业绩表现强劲，营收同比增长15.2%，净利润率提升至18.5%。市场份额持续扩大，投资回报率达到预期目标。

---

*以下为详细财务分析与市场洞察*`;

// 营收分析图表
const revenueAnalysisHtml = `
<div id="revenue-chart" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>营收分析</h3>
  <div id="revenue-content" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <div>
      <div id="revenue-amount" style="font-size: 32px; font-weight: bold; transition: all 0.3s ease;">¥2.85亿</div>
      <div style="font-size: 14px; opacity: 0.9;">本季度营收</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 20px; color: #4ade80;">+15.2%</div>
      <div style="font-size: 12px; opacity: 0.8;">同比增长</div>
    </div>
  </div>
  <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; position: relative; transition: height 0.3s ease;">
    <div id="revenue-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 4px; transition: width 2s ease-in-out;"></div>
  </div>
  <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">目标完成率: 76%</div>
  <div id="revenue-details" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="margin-bottom: 5px;">Q1: ¥2.1亿 (+8.5%)</div>
    <div style="margin-bottom: 5px;">Q2: ¥2.4亿 (+12.1%)</div>
    <div style="margin-bottom: 5px;">Q3: ¥2.6亿 (+13.8%)</div>
    <div>Q4: ¥2.85亿 (+15.2%)</div>
  </div>
</div>
<style>
#revenue-chart:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
}
#revenue-amount:hover {
  transform: scale(1.1);
  color: #4ade80;
}
</style>
<style>
#revenue-chart:hover #revenue-details {
  opacity: 1;
}
#revenue-chart:hover #revenue-content {
  opacity: 0.7;
}
#revenue-progress {
  animation: progressAnimation 2s ease-in-out 0.5s forwards;
}
@keyframes progressAnimation {
  from { width: 0%; }
  to { width: 76%; }
}
</style>
`;

// 利润率分析
const profitMarginHtml = `
<div id="profit-chart" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>利润率分析</h3>
  <div id="profit-content" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <div>
      <div id="profit-rate" style="font-size: 32px; font-weight: bold; transition: all 0.3s ease;">18.5%</div>
      <div style="font-size: 14px; opacity: 0.9;">净利润率</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 20px; color: #4ade80;">+2.3%</div>
      <div style="font-size: 12px; opacity: 0.8;">较上季度</div>
    </div>
  </div>
  <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; transition: height 0.3s ease;">
    <div id="profit-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 4px; transition: width 2s ease-in-out;"></div>
  </div>
  <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">行业平均: 15.2%</div>
  <div id="profit-comparison" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>我司</span><span style="color: #4ade80;">18.5%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>行业平均</span><span>15.2%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>行业领先</span><span>22.1%</span></div>
    <div style="display: flex; justify-content: space-between;"><span>排名</span><span style="color: #fbbf24;">第3位</span></div>
  </div>
</div>
<style>
#profit-chart:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 45px rgba(240, 147, 251, 0.3);
}
#profit-rate:hover {
  transform: scale(1.15);
  color: #fbbf24;
}
</style>
<style>
#profit-chart:hover #profit-comparison {
  opacity: 1;
}
#profit-chart:hover #profit-content {
  opacity: 0.7;
}
#profit-progress {
  animation: profitProgressAnimation 2s ease-in-out 0.8s forwards;
}
@keyframes profitProgressAnimation {
  from { width: 0%; }
  to { width: 85%; }
}
</style>
`;

// 市场份额
const marketShareHtml = `
<div id="market-chart" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/></svg>市场份额</h3>
  <div id="market-content" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <div>
      <div id="market-share" style="font-size: 32px; font-weight: bold; transition: all 0.3s ease;">23.7%</div>
      <div style="font-size: 14px; opacity: 0.9;">市场占有率</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 20px; color: #4ade80;">+1.8%</div>
      <div style="font-size: 12px; opacity: 0.8;">较去年同期</div>
    </div>
  </div>
  <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden; transition: height 0.3s ease;">
    <div id="market-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #06b6d4, #0891b2); border-radius: 4px; transition: width 2s ease-in-out;"></div>
  </div>
  <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">排名: 行业第2位</div>
  <div id="market-trend" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="margin-bottom: 8px; font-weight: bold;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 6px;"><polyline points="22,6 12,16 2,10"/></svg>增长趋势</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>2023 Q1</span><span>21.2%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>2023 Q2</span><span>21.9%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>2023 Q3</span><span>22.5%</span></div>
    <div style="display: flex; justify-content: space-between;"><span>2023 Q4</span><span style="color: #4ade80;">23.7%</span></div>
  </div>
</div>
<style>
#market-chart:hover {
  transform: translateY(-3px) rotate(1deg);
  box-shadow: 0 12px 40px rgba(79, 172, 254, 0.3);
}
#market-share:hover {
  transform: scale(1.1);
  color: #06b6d4;
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
}
</style>
<style>
#market-chart:hover #market-trend {
  opacity: 1;
}
#market-chart:hover #market-content {
  opacity: 0.7;
}
#market-progress {
  animation: marketProgressAnimation 2s ease-in-out 1.2s forwards;
}
@keyframes marketProgressAnimation {
  from { width: 0%; }
  to { width: 67%; }
}
</style>
`;

// 投资回报率
const roiAnalysisHtml = `
<div id="roi-chart" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.3); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #333;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,6 12,16 2,10"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #333;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><polyline points="22,6 12,16 2,10"/></svg>投资回报率</h3>
  <div id="roi-content" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
    <div>
      <div id="roi-rate" style="font-size: 32px; font-weight: bold; color: #333; transition: all 0.3s ease;">24.6%</div>
      <div style="font-size: 14px; opacity: 0.8; color: #333;">年化ROI</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 20px; color: #059669;">+3.2%</div>
      <div style="font-size: 12px; opacity: 0.7; color: #333;">超出预期</div>
    </div>
  </div>
  <div style="background: rgba(255,255,255,0.4); height: 8px; border-radius: 4px; overflow: hidden; transition: height 0.3s ease;">
    <div id="roi-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #059669, #10b981); border-radius: 4px; transition: width 2s ease-in-out;"></div>
  </div>
  <div style="font-size: 12px; margin-top: 8px; opacity: 0.8; color: #333;">目标ROI: 21.4%</div>
  <div id="roi-breakdown" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.3); border-radius: 6px; font-size: 12px; color: #333; opacity: 0.7;">
    <div style="margin-bottom: 8px; font-weight: bold;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 6px;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>投资组合分析</div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>股权投资</span><span style="color: #059669;">28.5%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>债券投资</span><span style="color: #059669;">18.2%</span></div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>现金管理</span><span style="color: #059669;">12.1%</span></div>
    <div style="display: flex; justify-content: space-between;"><span>其他投资</span><span style="color: #059669;">31.8%</span></div>
  </div>
</div>
<style>
#roi-chart:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 15px 50px rgba(250, 112, 154, 0.3);
}
#roi-rate:hover {
  transform: scale(1.2);
  color: #059669 !important;
  text-shadow: 0 0 15px rgba(5, 150, 105, 0.5);
}
</style>
<style>
#roi-chart:hover #roi-breakdown {
  opacity: 1;
}
#roi-chart:hover #roi-content {
  opacity: 0.7;
}
#roi-progress {
  animation: roiProgressAnimation 2s ease-in-out 1.6s forwards;
}
@keyframes roiProgressAnimation {
  from { width: 0%; }
  to { width: 82%; }
}
</style>
`;

// 现金流分析
const cashFlowHtml = `
<div id="cashflow-chart" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.4); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #333;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-2.26S7.29 10.09 7.29 11.25c0 1.22.86 2.28 2.14 2.28.03 0 .05 0 .07-.01M13 5l6 6-6 6"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-2.26S7.29 10.09 7.29 11.25c0 1.22.86 2.28 2.14 2.28.03 0 .05 0 .07-.01M13 5l6 6-6 6"/></svg>现金流分析</h3>
  <div id="cashflow-content" style="margin-bottom: 12px;">
    <div class="cashflow-item" style="display: flex; justify-content: space-between; margin-bottom: 8px; transition: all 0.3s ease; padding: 4px; border-radius: 4px;">
      <span style="font-size: 14px;">经营现金流</span>
      <span style="font-weight: bold; color: #059669; transition: all 0.3s ease;">+¥4,250万</span>
    </div>
    <div class="cashflow-item" style="display: flex; justify-content: space-between; margin-bottom: 8px; transition: all 0.3s ease; padding: 4px; border-radius: 4px;">
      <span style="font-size: 14px;">投资现金流</span>
      <span style="font-weight: bold; color: #dc2626; transition: all 0.3s ease;">-¥1,680万</span>
    </div>
    <div class="cashflow-item" style="display: flex; justify-content: space-between; margin-bottom: 8px; transition: all 0.3s ease; padding: 4px; border-radius: 4px;">
      <span style="font-size: 14px;">筹资现金流</span>
      <span style="font-weight: bold; color: #059669; transition: all 0.3s ease;">+¥890万</span>
    </div>
  </div>
  <div style="border-top: 1px solid rgba(0,0,0,0.1); padding-top: 10px;">
    <div style="display: flex; justify-content: space-between;">
      <span style="font-weight: bold;">净现金流</span>
      <span id="net-cashflow" style="font-weight: bold; font-size: 18px; color: #059669; transition: all 0.3s ease;">+¥3,460万</span>
    </div>
  </div>
  <div id="cashflow-chart-view" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.4); border-radius: 6px; opacity: 0.7;">
    <div style="margin-bottom: 10px; font-weight: bold; font-size: 14px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 6px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>现金流趋势图</div>
    <div style="display: flex; justify-content: space-between; align-items: end; height: 60px; margin-bottom: 10px;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 20px; height: 45px; background: #059669; border-radius: 2px; margin-bottom: 5px; transition: height 0.4s ease;"></div>
        <span style="font-size: 10px;">经营</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 20px; height: 18px; background: #dc2626; border-radius: 2px; margin-bottom: 5px; margin-top: 27px; transition: height 0.4s ease;"></div>
        <span style="font-size: 10px;">投资</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 20px; height: 12px; background: #059669; border-radius: 2px; margin-bottom: 5px; margin-top: 33px; transition: height 0.4s ease;"></div>
        <span style="font-size: 10px;">筹资</span>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 20px; height: 38px; background: #10b981; border-radius: 2px; margin-bottom: 5px; margin-top: 7px; transition: height 0.4s ease;"></div>
        <span style="font-size: 10px;">净额</span>
      </div>
    </div>
  </div>
</div>
<style>
#cashflow-chart:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 40px rgba(168, 237, 234, 0.4);
}
.cashflow-item:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(5px);
}
#net-cashflow:hover {
  transform: scale(1.1);
  text-shadow: 0 0 10px rgba(5, 150, 105, 0.5);
}
</style>
<style>
#cashflow-chart:hover #cashflow-chart-view {
  opacity: 1;
}
#cashflow-chart:hover #cashflow-content {
  opacity: 0.7;
}
</style>
`;

// 风险评估
const riskAssessmentHtml = `
<div id="risk-chart" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); color: #333; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.4); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #333;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 8px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>风险评估</h3>
  <div id="risk-content" style="margin-bottom: 12px;">
    <div class="risk-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; transition: all 0.3s ease; padding: 6px; border-radius: 4px;">
      <span style="font-size: 14px;">市场风险</span>
      <div style="display: flex; align-items: center;">
        <div style="width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; margin-right: 8px; overflow: hidden;">
          <div class="risk-bar" style="width: 0%; height: 100%; background: #fbbf24; border-radius: 3px; transition: width 1.5s ease-in-out;"></div>
        </div>
        <span style="font-size: 12px; color: #f59e0b;">中等</span>
      </div>
    </div>
    <div class="risk-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; transition: all 0.3s ease; padding: 6px; border-radius: 4px;">
      <span style="font-size: 14px;">信用风险</span>
      <div style="display: flex; align-items: center;">
        <div style="width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; margin-right: 8px; overflow: hidden;">
          <div class="risk-bar" style="width: 0%; height: 100%; background: #22c55e; border-radius: 3px; transition: width 1.5s ease-in-out;"></div>
        </div>
        <span style="font-size: 12px; color: #22c55e;">低</span>
      </div>
    </div>
    <div class="risk-item" style="display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; padding: 6px; border-radius: 4px;">
      <span style="font-size: 14px;">流动性风险</span>
      <div style="display: flex; align-items: center;">
        <div style="width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; margin-right: 8px; overflow: hidden;">
          <div class="risk-bar" style="width: 0%; height: 100%; background: #22c55e; border-radius: 3px; transition: width 1.5s ease-in-out;"></div>
        </div>
        <span style="font-size: 12px; color: #22c55e;">低</span>
      </div>
    </div>
  </div>
  <div id="risk-rating" style="background: rgba(255,255,255,0.5); padding: 10px; border-radius: 6px; font-size: 12px; transition: all 0.3s ease;">
    <strong>综合评级：</strong> <span style="color: #22c55e; font-weight: bold; transition: all 0.3s ease;">A-</span> (投资级别)
  </div>
  <div id="risk-details" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.4); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="margin-bottom: 8px; font-weight: bold;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: middle; margin-right: 6px;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>风险分析详情</div>
    <div style="margin-bottom: 6px;"><strong>市场风险：</strong> 行业竞争加剧，需关注市场变化</div>
    <div style="margin-bottom: 6px;"><strong>信用风险：</strong> 客户信用良好，坏账率低于1%</div>
    <div style="margin-bottom: 6px;"><strong>流动性风险：</strong> 现金充足，流动比率2.3</div>
    <div><strong>建议：</strong> 继续保持稳健经营策略</div>
  </div>
</div>
<style>
#risk-chart:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 15px 45px rgba(255, 236, 210, 0.4);
}
.risk-item:hover {
  background: rgba(255,255,255,0.3);
  transform: translateX(3px);
}
#risk-rating:hover {
  background: rgba(255,255,255,0.7);
  transform: scale(1.05);
}
</style>
<style>
#risk-chart:hover #risk-details {
  opacity: 1;
}
#risk-chart:hover #risk-content {
  opacity: 0.7;
}
.risk-bar {
  animation: riskBarAnimation 1.5s ease-in-out 2s forwards;
}
.risk-bar:nth-child(1) {
  animation-name: riskBar1Animation;
}
.risk-bar:nth-child(2) {
  animation-name: riskBar2Animation;
}
.risk-bar:nth-child(3) {
  animation-name: riskBar3Animation;
}
@keyframes riskBar1Animation {
  from { width: 0%; }
  to { width: 40%; }
}
@keyframes riskBar2Animation {
  from { width: 0%; }
  to { width: 25%; }
}
@keyframes riskBar3Animation {
  from { width: 0%; }
  to { width: 30%; }
}
</style>
`;

export const debugReport: InitFn = async (
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
      title: new Text('📈 季度财务分析报告 - Q4 2024'),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add main note block
    const noteId = store.addBlock(
      'affine:note',
      { xywh: '[0, 100, 1200, 800]' },
      rootId
    );

    // // Import preset markdown content
    // await MarkdownTransformer.importMarkdownToBlock({
    //   doc: store,
    //   blockId: noteId,
    //   markdown: financialReportMarkdown,
    //   extensions: getTestStoreManager().get('store'),
    // });

    // === 核心财务指标展示区 ===
    // 标题与描述
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '📊 核心财务指标', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '本季度业绩表现强劲，各项核心指标均超预期，展现出良好的增长势头和盈利能力',
            attributes: { italic: true },
          },
        ]),
        type: 'text',
      },
      noteId
    );

    // 第一行：营收与利润率 (2:1布局)
    const topMetricsContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const revenueColumnId = store.addBlock(
      'affine:column',
      { width: 65 },
      topMetricsContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(revenueAnalysisHtml),
        language: 'html',
      },
      revenueColumnId
    );

    const profitColumnId = store.addBlock(
      'affine:column',
      { width: 35 },
      topMetricsContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(profitMarginHtml),
        language: 'html',
      },
      profitColumnId
    );

    // 第二行：市场份额与投资回报 (1:1布局)
    const bottomMetricsContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const marketShareColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      bottomMetricsContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(marketShareHtml),
        language: 'html',
      },
      marketShareColumnId
    );

    const roiColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      bottomMetricsContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(roiAnalysisHtml),
        language: 'html',
      },
      roiColumnId
    );

    // === 现金流与风险管理 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '💰 现金流与风险管理', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    // 现金流与风险评估并排展示
    const cashFlowRiskContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    // 现金流分析 (左侧)
    const cashFlowColumnId = store.addBlock(
      'affine:column',
      { width: 60 },
      cashFlowRiskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '💧 现金流状况', attributes: {} }]),
        type: 'h3',
      },
      cashFlowColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '现金流管理是企业健康运营的重要指标，本季度各项现金流指标表现良好。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      cashFlowColumnId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(cashFlowHtml),
        language: 'html',
      },
      cashFlowColumnId
    );

    // 风险评估 (右侧)
    const riskColumnId = store.addBlock(
      'affine:column',
      { width: 40 },
      cashFlowRiskContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '⚠️ 风险控制', attributes: {} }]),
        type: 'h3',
      },
      riskColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '通过多维度风险评估，确保投资决策的科学性和安全性。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      riskColumnId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(riskAssessmentHtml),
        language: 'html',
      },
      riskColumnId
    );

    // === 数据洞察与趋势分析 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '📈 数据洞察与趋势分析', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '深入分析关键业务指标，洞察市场趋势，为战略决策提供数据支撑',
            attributes: { italic: true },
          },
        ]),
        type: 'text',
      },
      noteId
    );

    // === 关键指标与营收趋势 ===
    const quarterlyRevenueChartContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    // 关键指标雷达图 (较窄，左侧)
    const metricsChartColumnId = store.addBlock(
      'affine:column',
      { width: 30 },
      quarterlyRevenueChartContainerId
    );

    const keyMetricsRadarChart = `
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);">
  <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">🎯 关键指标评分</h3>
  <div style="margin: 20px 0;">
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px;">ROI (24.6%)</span>
        <span style="font-size: 12px; opacity: 0.9;">优秀</span>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; transition: height 0.3s ease;">
        <div style="width: 92%; height: 100%; background: linear-gradient(90deg, #4ade80, #22c55e); border-radius: 4px;"></div>
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px;">ROE (18.9%)</span>
        <span style="font-size: 12px; opacity: 0.9;">良好</span>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; transition: height 0.3s ease;">
        <div style="width: 85%; height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 4px;"></div>
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px;">流动比率 (2.34)</span>
        <span style="font-size: 12px; opacity: 0.9;">健康</span>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; transition: height 0.3s ease;">
        <div style="width: 78%; height: 100%; background: linear-gradient(90deg, #06b6d4, #0891b2); border-radius: 4px;"></div>
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-size: 14px;">市盈率 (18.7)</span>
        <span style="font-size: 12px; opacity: 0.9;">合理</span>
      </div>
      <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; transition: height 0.3s ease;">
        <div style="width: 70%; height: 100%; background: linear-gradient(90deg, #8b5cf6, #7c3aed); border-radius: 4px;"></div>
      </div>
    </div>
  </div>
  <div style="text-align: center; font-size: 12px; opacity: 0.9; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 6px;">
    综合评分: <span style="font-weight: bold; font-size: 16px;">8.2/10</span>
  </div>
</div>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(keyMetricsRadarChart),
        language: 'html',
      },
      metricsChartColumnId
    );

    // 季度营收柱状图 (较宽，右侧)
    const revenueChartColumnId = store.addBlock(
      'affine:column',
      { width: 70 },
      quarterlyRevenueChartContainerId
    );

    const quarterlyRevenueChart = `
<style>
#revenue-chart:hover #growth-indicator {
  opacity: 0.7;
}
#revenue-chart{
  transition: all 0.3s ease;
}
</style>
<div id="revenue-chart" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
  <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">📊 季度营收对比 (单位: 亿元)</h3>
  <div style="display: flex; align-items: end; justify-content: space-around; height: 200px; margin: 20px 0;">
    <div class="revenue-bar" style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; background: linear-gradient(to top, #4ade80, #22c55e); border-radius: 4px 4px 0 0; margin-bottom: 8px; height: 120px; position: relative;">
        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: bold;">2.67</div>
      </div>
      <span style="font-size: 12px; opacity: 0.9;">Q3 2024</span>
    </div>
    <div class="revenue-bar" style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; background: linear-gradient(to top, #fbbf24, #f59e0b); border-radius: 4px 4px 0 0; margin-bottom: 8px; height: 160px; position: relative;">
        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: bold;">2.85</div>
      </div>
      <span style="font-size: 12px; opacity: 0.9;">Q4 2024</span>
    </div>
    <div class="revenue-bar" style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 40px; background: linear-gradient(to top, #06b6d4, #0891b2); border-radius: 4px 4px 0 0; margin-bottom: 8px; height: 180px; position: relative; opacity: 0.6;">
        <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: bold;">3.10</div>
      </div>
      <span style="font-size: 12px; opacity: 0.7;">Q1 2025 (预测)</span>
    </div>
  </div>
  <div id="growth-indicator" style="text-align: center; font-size: 14px; opacity: 0.9; margin-top: 15px;">
    <span style="color: #4ade80;">▲ 15.2%</span> 同比增长
  </div>
  <div id="revenue-details" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 12px;">
    <div style="margin-bottom: 8px; font-weight: bold;">📈 营收分析详情</div>
    <div style="margin-bottom: 6px;">• Q4营收创历史新高，增长6.7%</div>
    <div style="margin-bottom: 6px;">• 核心业务贡献率达到78%</div>
    <div style="margin-bottom: 6px;">• Q1预测基于市场扩张计划</div>
    <div>• 预计全年营收将突破11亿元</div>
  </div>
</div>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(quarterlyRevenueChart),
        language: 'html',
      },
      revenueChartColumnId
    );

    // === 市场表现与竞争分析 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '🎯 市场表现与竞争分析', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    // 市场数据可视化

    // 第一行：市场份额分析
    const marketShareRowContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const marketShareTextColumnId = store.addBlock(
      'affine:column',
      { width: 35 },
      marketShareRowContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '🥧 市场份额表现', attributes: {} }]),
        type: 'h3',
      },
      marketShareTextColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '公司在细分市场中保持稳定的竞争地位，市场份额达到23.7%，位居行业第二。通过持续的产品创新和市场拓展，预计未来市场份额将进一步提升。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      marketShareTextColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '关键亮点：', attributes: { bold: true } }]),
        type: 'text',
      },
      marketShareTextColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '市场份额同比增长1.8%', attributes: {} }]),
      },
      marketShareTextColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '行业排名稳定在第2位', attributes: {} }]),
      },
      marketShareTextColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '核心产品竞争力持续增强', attributes: {} }]),
      },
      marketShareTextColumnId
    );

    const marketSharePieColumnId = store.addBlock(
      'affine:column',
      { width: 65 },
      marketShareRowContainerId
    );

    const marketSharePieChart = `
<div id="market-share-chart" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.3); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: white;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg></div>
  <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">🥧 市场份额分布</h3>
  <div style="display: flex; justify-content: center; align-items: center; margin: 20px 0;">
    <div id="pie-chart" style="width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#22c55e 0deg 85deg, #fbbf24 85deg 150deg, #ef4444 150deg 210deg, #8b5cf6 210deg 270deg, #6b7280 270deg 360deg); position: relative; display: flex; align-items: center; justify-content: center; transition: all 0.5s ease, height 0.4s ease;">
      <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #333; font-weight: bold; font-size: 14px; transition: all 0.3s ease, height 0.4s ease;">23.7%</div>
    </div>
  </div>
  <div id="legend-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
    <div class="legend-item" style="display: flex; align-items: center; transition: all 0.3s ease; padding: 4px; border-radius: 4px; cursor: pointer;">
      <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 2px; margin-right: 6px; transition: all 0.3s ease;"></div>
      <span>我司 (23.7%)</span>
    </div>
    <div class="legend-item" style="display: flex; align-items: center; transition: all 0.3s ease; padding: 4px; border-radius: 4px; cursor: pointer;">
      <div style="width: 12px; height: 12px; background: #fbbf24; border-radius: 2px; margin-right: 6px; transition: all 0.3s ease;"></div>
      <span>CompanyA (28.9%)</span>
    </div>
    <div class="legend-item" style="display: flex; align-items: center; transition: all 0.3s ease; padding: 4px; border-radius: 4px; cursor: pointer;">
      <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 2px; margin-right: 6px; transition: all 0.3s ease;"></div>
      <span>CompanyB (18.2%)</span>
    </div>
    <div class="legend-item" style="display: flex; align-items: center; transition: all 0.3s ease; padding: 4px; border-radius: 4px; cursor: pointer;">
      <div style="width: 12px; height: 12px; background: #8b5cf6; border-radius: 2px; margin-right: 6px; transition: all 0.3s ease;"></div>
      <span>CompanyC (16.5%)</span>
    </div>
    <div class="legend-item" style="display: flex; align-items: center; grid-column: span 2; transition: all 0.3s ease; padding: 4px; border-radius: 4px; cursor: pointer;">
      <div style="width: 12px; height: 12px; background: #6b7280; border-radius: 2px; margin-right: 6px; transition: all 0.3s ease;"></div>
      <span>其他 (12.7%)</span>
    </div>
  </div>
  <div id="market-details" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="margin-bottom: 8px; font-weight: bold;">📈 市场趋势分析</div>
    <div style="margin-bottom: 6px;">• 我司市场份额较去年同期增长1.8%</div>
    <div style="margin-bottom: 6px;">• 主要竞争对手CompanyA份额略有下降</div>
    <div style="margin-bottom: 6px;">• 新兴市场机会增加，预计份额将继续提升</div>
    <div>• 建议加强产品差异化竞争策略</div>
  </div>
</div>
<style>
#market-share-chart:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 50px rgba(79, 172, 254, 0.4);
}
#pie-chart:hover {
  transform: scale(1.1) rotate(5deg);
}
.legend-item:hover {
  background: rgba(255,255,255,0.2);
  transform: translateX(5px);
}
</style>
<style>
#market-share-chart:hover #market-details {
  opacity: 1;
}
#market-share-chart:hover #legend-grid {
  opacity: 0.7;
}
.legend-item:hover ~ #pie-chart {
  filter: brightness(1.2);
}
</style>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(marketSharePieChart),
        language: 'html',
      },
      marketSharePieColumnId
    );

    // 第二行：股价表现与业绩摘要
    const stockPerformanceContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const stockTrendColumnId = store.addBlock(
      'affine:column',
      { width: 70 },
      stockPerformanceContainerId
    );

    const stockTrendChart = `
<div id="stock-chart" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #333; padding: 25px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.4); border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #333;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,6 12,16 2,10"/></svg></div>
  <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center; color: #333;">📈 股价走势 (近6个月)</h3>
  <div id="chart-container" style="position: relative; height: 120px; margin: 20px 0; background: rgba(255,255,255,0.3); border-radius: 8px; padding: 10px; transition: all 0.3s ease, height 0.4s ease;">
    <svg width="100%" height="100%" viewBox="0 0 300 100" style="overflow: visible;">
      <defs>
        <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#059669;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#059669;stop-opacity:0" />
        </linearGradient>
      </defs>
      <polyline id="stock-line" fill="url(#stockGradient)" stroke="#059669" stroke-width="2" points="0,80 50,75 100,70 150,65 200,45 250,40 300,35" style="transition: all 0.5s ease;" />
      <circle id="current-point" cx="300" cy="35" r="4" fill="#059669" style="transition: all 0.3s ease;" />
      <circle cx="0" cy="80" r="3" fill="#059669" opacity="0.7" class="data-point" />
      <circle cx="50" cy="75" r="3" fill="#059669" opacity="0.7" class="data-point" />
      <circle cx="100" cy="70" r="3" fill="#059669" opacity="0.7" class="data-point" />
      <circle cx="150" cy="65" r="3" fill="#059669" opacity="0.7" class="data-point" />
      <circle cx="200" cy="45" r="3" fill="#059669" opacity="0.7" class="data-point" />
      <circle cx="250" cy="40" r="3" fill="#059669" opacity="0.7" class="data-point" />
    </svg>
    <div id="price-display" style="position: absolute; top: 5px; right: 10px; background: #059669; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; transition: all 0.3s ease;">
      ¥156.80
    </div>
    <div id="tooltip" style="position: absolute; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; display: none; pointer-events: none; z-index: 10;"></div>
  </div>
  <div style="display: flex; justify-content: space-between; font-size: 12px; color: #333; opacity: 0.8;">
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">7月</span>
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">8月</span>
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">9月</span>
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">10月</span>
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">11月</span>
    <span class="month-label" style="transition: all 0.3s ease; cursor: pointer;">12月</span>
  </div>
  <div id="market-cap" style="text-align: center; margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.4); border-radius: 6px; transition: all 0.3s ease;">
    <div style="font-size: 14px; color: #333; margin-bottom: 5px;">市值: <span style="font-weight: bold;">¥125亿</span></div>
    <div style="font-size: 12px; color: #059669; font-weight: bold;">+12.8% (6个月涨幅)</div>
  </div>
  <div id="stock-details" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.4); border-radius: 6px; font-size: 12px; opacity: 0.7;">
    <div style="margin-bottom: 8px; font-weight: bold;">📊 技术指标</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div>RSI: <span style="color: #059669; font-weight: bold;">65.2</span></div>
      <div>MACD: <span style="color: #059669; font-weight: bold;">+2.3</span></div>
      <div>MA20: <span style="color: #333; font-weight: bold;">¥151.20</span></div>
      <div>MA50: <span style="color: #333; font-weight: bold;">¥147.80</span></div>
    </div>
  </div>
</div>
<style>
#stock-chart:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 15px 50px rgba(250, 112, 154, 0.4);
}
#current-point:hover {
  r: 6;
  filter: drop-shadow(0 0 8px #059669);
}
.data-point:hover {
  r: 5;
  opacity: 1;
  filter: drop-shadow(0 0 6px #059669);
}
#market-cap:hover {
  background: rgba(255,255,255,0.6);
  transform: scale(1.05);
}
#price-display:hover {
  transform: scale(1.1);
  background: #047857;
}
</style>
<style>
#stock-chart:hover #stock-details {
  opacity: 1;
}
#stock-chart:hover #market-cap {
  opacity: 0.7;
}
.month-label:hover {
  font-weight: bold;
}
</style>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(stockTrendChart),
        language: 'html',
      },
      stockTrendColumnId
    );

    const performanceSummaryColumnId = store.addBlock(
      'affine:column',
      { width: 30 },
      stockPerformanceContainerId
    );

    const performanceSummaryChart = `
<div id="performance-summary" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); transition: all 0.3s ease; cursor: pointer; position: relative;">
  <div style="position: absolute; top: 10px; right: 15px; background: rgba(255,255,255,0.2); border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; color: white;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
  <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; text-align: center;">📊 业绩摘要</h3>
  <div class="metric-item" style="margin-bottom: 12px; transition: all 0.3s ease; padding: 6px; border-radius: 4px; cursor: pointer;">
    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">季度营收</div>
    <div style="font-size: 18px; font-weight: bold; transition: all 0.3s ease;">¥2.85亿</div>
    <div style="font-size: 10px; color: #4ade80; transition: all 0.3s ease;">+15.2%</div>
  </div>
  <div class="metric-item" style="margin-bottom: 12px; transition: all 0.3s ease; padding: 6px; border-radius: 4px; cursor: pointer;">
    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">净利润率</div>
    <div style="font-size: 18px; font-weight: bold; transition: all 0.3s ease;">18.5%</div>
    <div style="font-size: 10px; color: #4ade80; transition: all 0.3s ease;">+2.3%</div>
  </div>
  <div class="metric-item" style="margin-bottom: 12px; transition: all 0.3s ease; padding: 6px; border-radius: 4px; cursor: pointer;">
    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">ROI</div>
    <div style="font-size: 18px; font-weight: bold; transition: all 0.3s ease;">24.6%</div>
    <div style="font-size: 10px; color: #4ade80; transition: all 0.3s ease;">+3.2%</div>
  </div>
  <div id="rating-section" style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; text-align: center; transition: all 0.3s ease;">
    <div style="font-size: 10px; opacity: 0.9;">综合评级</div>
    <div style="font-size: 16px; font-weight: bold; transition: all 0.3s ease;">A-</div>
  </div>
  <div id="performance-details" style="margin-top: 12px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 11px; opacity: 0.7;">
    <div style="margin-bottom: 6px; font-weight: bold;">📈 同比增长详情</div>
    <div style="margin-bottom: 4px;">• 营收增长主要来自核心业务扩张</div>
    <div style="margin-bottom: 4px;">• 利润率提升得益于成本控制优化</div>
    <div style="margin-bottom: 4px;">• ROI增长反映投资效率提升</div>
    <div>• 预计下季度将保持稳定增长</div>
  </div>
</div>
<style>
#performance-summary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 45px rgba(102, 126, 234, 0.4);
}
.metric-item:hover {
  background: rgba(255,255,255,0.1);
  transform: translateX(3px);
}
#rating-section:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.05);
}
</style>
<style>
#performance-summary:hover #performance-details {
  opacity: 1;
}
#performance-summary:hover #rating-section {
  opacity: 0.7;
}
</style>
`;

    store.addBlock(
      'affine:code',
      {
        text: new Text(performanceSummaryChart),
        language: 'html',
      },
      performanceSummaryColumnId
    );

    // === 投资建议与展望 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '💡 投资建议与展望', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    // 投资建议布局
    const investmentAdviceContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    // 核心观点与评级
    const coreViewColumnId = store.addBlock(
      'affine:column',
      { width: 40 },
      investmentAdviceContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '🎯 核心观点', attributes: {} }]),
        type: 'h3',
      },
      coreViewColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '买入评级', attributes: { bold: true } },
          { insert: ' - 目标价位：¥180.00 (+14.8%)', attributes: {} },
        ]),
        type: 'text',
      },
      coreViewColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '基于强劲的财务表现和良好的市场前景，我们给予公司"买入"评级。预计未来12个月内股价将有显著上涨空间。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      coreViewColumnId
    );

    // 优势与风险分析
    const analysisColumnId = store.addBlock(
      'affine:column',
      { width: 60 },
      investmentAdviceContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '📊 优势分析', attributes: {} }]),
        type: 'h3',
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '强劲增长', attributes: { bold: true } },
          { insert: '：营收同比增长15.2%，超出市场预期', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '盈利能力', attributes: { bold: true } },
          { insert: '：净利润率18.5%，行业领先水平', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '市场地位', attributes: { bold: true } },
          { insert: '：市场份额稳步提升，竞争优势明显', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '现金流健康', attributes: { bold: true } },
          { insert: '：经营现金流充沛，财务状况稳健', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '⚠️ 风险提示', attributes: {} }]),
        type: 'h3',
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '宏观经济波动可能影响业务增长', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '行业竞争加剧，需持续关注市场份额变化', attributes: {} },
        ]),
      },
      analysisColumnId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '原材料成本上涨压力', attributes: {} }]),
      },
      analysisColumnId
    );

    // 未来展望
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '🔮 未来展望', attributes: {} }]),
        type: 'h3',
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '预计下季度营收将继续保持10-15%的增长率，建议投资者在当前价位积极配置。公司正处于快速发展期，具备良好的投资价值。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      noteId
    );

    // === 执行总结 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '📋 执行总结', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    const summaryContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const summaryColumn1Id = store.addBlock(
      'affine:column',
      { width: 33.33 },
      summaryContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '📈 业绩亮点', attributes: {} }]),
        type: 'h3',
      },
      summaryColumn1Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '营收增长15.2%', attributes: {} }]),
      },
      summaryColumn1Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '净利润率18.5%', attributes: {} }]),
      },
      summaryColumn1Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: 'ROI达24.6%', attributes: {} }]),
      },
      summaryColumn1Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '超出市场预期', attributes: {} }]),
      },
      summaryColumn1Id
    );

    const summaryColumn2Id = store.addBlock(
      'affine:column',
      { width: 33.33 },
      summaryContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '🎯 市场表现', attributes: {} }]),
        type: 'h3',
      },
      summaryColumn2Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '市场份额23.7%', attributes: {} }]),
      },
      summaryColumn2Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '行业排名第2位', attributes: {} }]),
      },
      summaryColumn2Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '竞争优势稳固', attributes: {} }]),
      },
      summaryColumn2Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '品牌影响力提升', attributes: {} }]),
      },
      summaryColumn2Id
    );

    const summaryColumn3Id = store.addBlock(
      'affine:column',
      { width: 33.33 },
      summaryContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '💰 财务健康', attributes: {} }]),
        type: 'h3',
      },
      summaryColumn3Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '现金流充沛', attributes: {} }]),
      },
      summaryColumn3Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '债务比例合理', attributes: {} }]),
      },
      summaryColumn3Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '投资级别评级', attributes: {} }]),
      },
      summaryColumn3Id
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([{ insert: '财务结构优化', attributes: {} }]),
      },
      summaryColumn3Id
    );

    // 报告结语
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '本报告基于公开信息和财务数据分析，仅供投资参考。投资有风险，决策需谨慎。',
            attributes: { italic: true },
          },
        ]),
        type: 'text',
      },
      noteId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '报告完成时间：', attributes: { bold: true } },
          { insert: ' 2024年12月31日 | ', attributes: {} },
          { insert: '分析师：', attributes: { bold: true } },
          { insert: ' 投资研究部', attributes: {} },
        ]),
        type: 'text',
      },
      noteId
    );
  }
};

debugReport.id = 'debug-report';
