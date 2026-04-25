import { Text, type Workspace } from '@blocksuite/affine/store';
import { MarkdownTransformer } from '@blocksuite/affine/widgets/linked-doc';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

import type { InitFn } from './utils.js';

// 现代极简风格的财务报告组件

// 核心指标卡片 - 增强版视觉设计
const modernMetricsCard = `
<div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: linear-gradient(135deg, #059669, #34d399); border-radius: 50%; opacity: 0.1;"></div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: #059669; border-radius: 50%;"></div>
        <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #374151;">季度营收表现</h3>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: #111827; margin-bottom: 8px; letter-spacing: -1px;">¥2.85<span style="font-size: 24px; color: #6b7280;">亿</span></div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 14px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">+15.2% YoY</div>
        <div style="font-size: 12px; color: #6b7280;">vs 去年同期</div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #059669 0%, #34d399 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 700; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);">Q4</div>
      <div style="font-size: 11px; color: #6b7280; font-weight: 500;">2024</div>
    </div>
  </div>
  <div style="margin-bottom: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 12px; color: #6b7280; font-weight: 500;">目标完成度</span>
      <span style="font-size: 14px; color: #111827; font-weight: 700;">76%</span>
    </div>
    <div style="height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; position: relative;">
      <div style="height: 100%; width: 76%; background: linear-gradient(90deg, #059669 0%, #34d399 100%); border-radius: 3px; position: relative;">
        <div style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; background: #ffffff; border: 2px solid #059669; border-radius: 50%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);"></div>
      </div>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px;">
    <div style="text-align: center; padding: 8px; background: #f8fafc; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: 700; color: #111827;">¥0.92亿</div>
      <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">10月</div>
    </div>
    <div style="text-align: center; padding: 8px; background: #f8fafc; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: 700; color: #111827;">¥0.98亿</div>
      <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">11月</div>
    </div>
    <div style="text-align: center; padding: 8px; background: #ecfdf5; border-radius: 8px; border: 1px solid #d1fae5;">
      <div style="font-size: 16px; font-weight: 700; color: #059669;">¥0.95亿</div>
      <div style="font-size: 10px; color: #059669; margin-top: 2px;">12月</div>
    </div>
  </div>
</div>
`;

// 利润率卡片 - 增强版视觉设计
const modernProfitCard = `
<div style="background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #fbbf24;">
  <div style="position: absolute; top: -30px; left: -30px; width: 120px; height: 120px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 50%; opacity: 0.1;"></div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></div>
        <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #374151;">净利润率</h3>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: #111827; margin-bottom: 8px; letter-spacing: -1px;">18.5<span style="font-size: 24px; color: #6b7280;">%</span></div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 14px; color: #f59e0b; font-weight: 700; background: #fef3c7; padding: 4px 8px; border-radius: 6px;">+2.3%</div>
        <div style="font-size: 12px; color: #6b7280;">较上季度</div>
      </div>
    </div>
    <div style="width: 80px; height: 80px; position: relative;">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#f3f4f6" stroke-width="6"/>
        <circle cx="40" cy="40" r="35" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="130 220" stroke-dashoffset="0" transform="rotate(-90 40 40)"/>
      </svg>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #f59e0b;">18.5%</div>
      </div>
    </div>
  </div>
  <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 12px; color: #92400e; font-weight: 500;">行业对比</span>
      <span style="font-size: 12px; color: #059669; font-weight: 600;">+3.3% 超出行业平均</span>
    </div>
    <div style="display: flex; gap: 16px;">
      <div style="flex: 1;">
        <div style="font-size: 11px; color: #92400e; margin-bottom: 4px;">我司</div>
        <div style="height: 4px; background: #f59e0b; border-radius: 2px;"></div>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 11px; color: #92400e; margin-bottom: 4px;">行业平均 15.2%</div>
        <div style="height: 4px; background: #d1d5db; border-radius: 2px;"></div>
      </div>
    </div>
  </div>
</div>
`;

// 市场份额卡片 - 增强版视觉设计
const modernMarketShareCard = `
<div style="background: linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #0ea5e9;">
  <div style="position: absolute; bottom: -40px; right: -40px; width: 140px; height: 140px; background: linear-gradient(135deg, #0ea5e9, #38bdf8); border-radius: 50%; opacity: 0.08;"></div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: #0ea5e9; border-radius: 50%;"></div>
        <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #374151;">市场份额占比</h3>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: #111827; margin-bottom: 8px; letter-spacing: -1px;">23.7<span style="font-size: 24px; color: #6b7280;">%</span></div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 14px; color: #0ea5e9; font-weight: 700; background: #e0f2fe; padding: 4px 8px; border-radius: 6px;">+1.2%</div>
        <div style="font-size: 12px; color: #6b7280;">较上季度</div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#0ea5e9 0deg 85deg, #e5e7eb 85deg 360deg); display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="width: 36px; height: 36px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #0ea5e9;">#3</div>
      </div>
      <div style="font-size: 11px; color: #6b7280; font-weight: 500;">行业排名</div>
    </div>
  </div>
  <div style="background: #e0f2fe; border-radius: 12px; padding: 16px; margin-top: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 12px; color: #0c4a6e; font-weight: 500;">竞争态势</span>
      <span style="font-size: 12px; color: #059669; font-weight: 600;">稳步上升</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div style="background: white; border-radius: 8px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #0ea5e9;">28.9%</div>
        <div style="font-size: 10px; color: #6b7280;">领先者</div>
      </div>
      <div style="background: white; border-radius: 8px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #f59e0b;">18.2%</div>
        <div style="font-size: 10px; color: #6b7280;">追随者</div>
      </div>
    </div>
  </div>
</div>
`;

// ROI投资回报率卡片 - 增强版视觉设计
const modernROICard = `
<div style="background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); border-radius: 20px; padding: 28px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #22c55e;">
  <div style="position: absolute; top: -50px; left: -50px; width: 160px; height: 160px; background: linear-gradient(135deg, #22c55e, #4ade80); border-radius: 50%; opacity: 0.06;"></div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 1;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></div>
        <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #374151;">投资回报率</h3>
      </div>
      <div style="font-size: 42px; font-weight: 800; color: #111827; margin-bottom: 8px; letter-spacing: -1px;">24.8<span style="font-size: 24px; color: #6b7280;">%</span></div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 14px; color: #22c55e; font-weight: 700; background: #f0fdf4; padding: 4px 8px; border-radius: 6px;">+3.1%</div>
        <div style="font-size: 12px; color: #6b7280;">较上季度</div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="width: 70px; height: 70px; position: relative;">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="30" fill="none" stroke="#e5e7eb" stroke-width="4"/>
          <circle cx="35" cy="35" r="30" fill="none" stroke="#22c55e" stroke-width="4" stroke-dasharray="47 188" stroke-dashoffset="0" transform="rotate(-90 35 35)"/>
          <circle cx="35" cy="35" r="20" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="31 126" stroke-dashoffset="0" transform="rotate(-90 35 35)"/>
        </svg>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <div style="font-size: 10px; font-weight: 700; color: #22c55e;">ROI</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #6b7280; font-weight: 500;">双环指标</div>
    </div>
  </div>
  <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; margin-top: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 12px; color: #166534; font-weight: 500;">预期对比</span>
      <span style="font-size: 12px; color: #059669; font-weight: 600;">超出预期 +4.8%</span>
    </div>
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 10px; color: #166534;">实际</span>
          <span style="font-size: 10px; color: #22c55e; font-weight: 600;">24.8%</span>
        </div>
        <div style="height: 4px; background: #dcfce7; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: 82%; background: #22c55e; border-radius: 2px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 10px; color: #166534;">预期</span>
          <span style="font-size: 10px; color: #6b7280;">20.0%</span>
        </div>
        <div style="height: 4px; background: #dcfce7; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: 67%; background: #9ca3af; border-radius: 2px;"></div>
        </div>
      </div>
      <div style="background: white; border-radius: 8px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #22c55e;">A+</div>
        <div style="font-size: 10px; color: #6b7280;">评级</div>
      </div>
    </div>
  </div>
</div>
`;

// 现金流分析表格 - 增强版视觉设计
const modernCashFlowTable = `
<div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; border: 1px solid #e2e8f0;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">现金流分析</h3>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 8px 12px;">
      <span style="font-size: 12px; color: #475569; font-weight: 500;">Q4 2024</span>
    </div>
  </div>
  
  <div style="display: grid; gap: 16px; margin-bottom: 24px;">
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); border-radius: 16px; padding: 20px; border: 1px solid #d1fae5; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #22c55e; border-radius: 50%; opacity: 0.1;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
        <div>
          <div style="font-size: 14px; color: #166534; font-weight: 500; margin-bottom: 4px;">经营活动现金流</div>
          <div style="font-size: 24px; font-weight: 800; color: #059669;">+¥45.2亿</div>
        </div>
        <div style="width: 50px; height: 50px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 20px; color: white;">↗</div>
        </div>
      </div>
      <div style="margin-top: 12px; height: 4px; background: #d1fae5; border-radius: 2px; overflow: hidden;">
        <div style="height: 100%; width: 85%; background: #22c55e; border-radius: 2px;"></div>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border-radius: 16px; padding: 20px; border: 1px solid #fecaca; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #ef4444; border-radius: 50%; opacity: 0.1;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
        <div>
          <div style="font-size: 14px; color: #991b1b; font-weight: 500; margin-bottom: 4px;">投资活动现金流</div>
          <div style="font-size: 24px; font-weight: 800; color: #dc2626;">-¥12.8亿</div>
        </div>
        <div style="width: 50px; height: 50px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 20px; color: white;">↙</div>
        </div>
      </div>
      <div style="margin-top: 12px; height: 4px; background: #fecaca; border-radius: 2px; overflow: hidden;">
        <div style="height: 100%; width: 35%; background: #ef4444; border-radius: 2px;"></div>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%); border-radius: 16px; padding: 20px; border: 1px solid #fcd34d; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -10px; right: -10px; width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; opacity: 0.1;"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
        <div>
          <div style="font-size: 14px; color: #92400e; font-weight: 500; margin-bottom: 4px;">筹资活动现金流</div>
          <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">-¥8.5亿</div>
        </div>
        <div style="width: 50px; height: 50px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <div style="font-size: 20px; color: white;">↘</div>
        </div>
      </div>
      <div style="margin-top: 12px; height: 4px; background: #fcd34d; border-radius: 2px; overflow: hidden;">
        <div style="height: 100%; width: 25%; background: #f59e0b; border-radius: 2px;"></div>
      </div>
    </div>
  </div>
  
  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border-radius: 16px; padding: 24px; border: 2px solid #0ea5e9; position: relative;">
    <div style="position: absolute; top: -20px; left: -20px; width: 80px; height: 80px; background: #0ea5e9; border-radius: 50%; opacity: 0.1;"></div>
    <div style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;">
      <div>
        <div style="font-size: 16px; color: #0c4a6e; font-weight: 600; margin-bottom: 8px;">净现金流</div>
        <div style="font-size: 36px; font-weight: 900; color: #0ea5e9; letter-spacing: -1px;">+¥23.9亿</div>
        <div style="font-size: 12px; color: #0c4a6e; margin-top: 4px;">较上季度 +18.5%</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="width: 80px; height: 80px; background: conic-gradient(#0ea5e9 0deg 216deg, #e5e7eb 216deg 360deg); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #0ea5e9;">60%</div>
        </div>
        <div style="font-size: 10px; color: #6b7280; font-weight: 500;">健康度</div>
      </div>
    </div>
  </div>
</div>
`;

// 风险评估 - 紧凑型布局设计
const modernRiskAssessment = `
<div style="padding: 20px 0; margin: 16px 0;">
  <!-- 标题 -->
  <h3 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 300; color: #111827; letter-spacing: -0.5px;">风险评估</h3>
  
  <!-- 风险指标紧凑布局 -->
  <div style="margin: 20px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
      <div>
        <div style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">MARKET RISK</div>
        <div style="font-size: 14px; color: #6b7280;">市场波动影响适中，需持续关注</div>
      </div>
      <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">中等</div>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
      <div>
        <div style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">CREDIT RISK</div>
        <div style="font-size: 14px; color: #6b7280;">信用状况良好，违约概率极低</div>
      </div>
      <div style="font-size: 24px; font-weight: 700; color: #059669;">低</div>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
      <div>
        <div style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">LIQUIDITY RISK</div>
        <div style="font-size: 14px; color: #6b7280;">资金流动性充足，变现能力强</div>
      </div>
      <div style="font-size: 24px; font-weight: 700; color: #059669;">低</div>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0;">
      <div>
        <div style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; margin-bottom: 4px;">OPERATIONAL RISK</div>
        <div style="font-size: 14px; color: #6b7280;">运营体系稳健，管理风险可控</div>
      </div>
      <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">低</div>
    </div>
  </div>
  
  <!-- 综合评级 -->
  <div style="margin-top: 32px; padding: 24px 0; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 12px;">
    <div style="font-size: 12px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">OVERALL RATING</div>
    <div style="font-size: 48px; font-weight: 800; color: #059669; margin-bottom: 8px; letter-spacing: -1px;">A-</div>
    <div style="font-size: 14px; color: #6b7280; font-weight: 300;">Investment Grade • 建议持有</div>
  </div>
</div>
`;

// 季度营收趋势图 - 增强版视觉设计
const modernRevenueChart = `
<div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; padding: 40px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin: 40px 0; border: 1px solid #e2e8f0; position: relative; overflow: hidden;">
  <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: linear-gradient(135deg, #059669, #34d399); border-radius: 50%; opacity: 0.05;"></div>
  
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; position: relative; z-index: 1;">
    <div>
      <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827;">季度营收趋势</h3>
      <div style="font-size: 14px; color: #6b7280;">2024年度财务表现</div>
    </div>
    <div style="background: #ecfdf5; border-radius: 12px; padding: 12px 16px; border: 1px solid #d1fae5;">
      <div style="font-size: 12px; color: #166534; font-weight: 500; margin-bottom: 4px;">年度总营收</div>
      <div style="font-size: 20px; font-weight: 800; color: #059669;">¥9.95亿</div>
    </div>
  </div>
  
  <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin-bottom: 24px; position: relative;">
    <div style="display: flex; align-items: end; justify-content: space-between; height: 200px; margin: 20px 0; position: relative;">
      <!-- 网格线背景 -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(to top, #e5e7eb 1px, transparent 1px); background-size: 100% 40px; opacity: 0.3;"></div>
      
      <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1;">
        <div style="width: 40px; height: 160px; position: relative; margin-bottom: 20px;">
          <div style="position: absolute; bottom: 0; width: 100%; height: 75%; background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%); border-radius: 8px 8px 4px 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
          <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 700; color: #111827;">¥2.1亿</div>
            <div style="font-size: 10px; color: #6b7280; text-align: center;">+8.2%</div>
          </div>
        </div>
        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Q1</span>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1;">
        <div style="width: 40px; height: 160px; position: relative; margin-bottom: 20px;">
          <div style="position: absolute; bottom: 0; width: 100%; height: 85%; background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%); border-radius: 8px 8px 4px 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
          <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 700; color: #111827;">¥2.4亿</div>
            <div style="font-size: 10px; color: #6b7280; text-align: center;">+14.3%</div>
          </div>
        </div>
        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Q2</span>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1;">
        <div style="width: 40px; height: 160px; position: relative; margin-bottom: 20px;">
          <div style="position: absolute; bottom: 0; width: 100%; height: 92%; background: linear-gradient(180deg, #34d399 0%, #10b981 100%); border-radius: 8px 8px 4px 4px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"></div>
          <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: white; border-radius: 8px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
            <div style="font-size: 14px; font-weight: 700; color: #111827;">¥2.6亿</div>
            <div style="font-size: 10px; color: #6b7280; text-align: center;">+8.3%</div>
          </div>
        </div>
        <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Q3</span>
      </div>
      
      <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1;">
        <div style="width: 40px; height: 160px; position: relative; margin-bottom: 20px;">
          <div style="position: absolute; bottom: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%); border-radius: 8px 8px 4px 4px; box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3); border: 2px solid #f59e0b;"></div>
          <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); background: #fef3c7; border-radius: 8px; padding: 6px 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); border: 2px solid #f59e0b;">
            <div style="font-size: 14px; font-weight: 800; color: #92400e;">¥2.85亿</div>
            <div style="font-size: 10px; color: #f59e0b; text-align: center; font-weight: 600;">+9.6%</div>
          </div>
          <!-- 闪烁效果 -->
          <div style="position: absolute; top: -5px; right: -5px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; animation: pulse 2s infinite;"></div>
        </div>
        <span style="font-size: 14px; color: #f59e0b; font-weight: 600;">Q4</span>
      </div>
    </div>
    
    <!-- 趋势线 -->
    <div style="position: absolute; bottom: 60px; left: 32px; right: 32px; height: 2px; background: linear-gradient(90deg, #94a3b8 0%, #3b82f6 25%, #10b981 50%, #f59e0b 75%, #f59e0b 100%); border-radius: 1px; opacity: 0.6;"></div>
  </div>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 24px;">
    <div style="background: #f0f9ff; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #bae6fd;">
      <div style="font-size: 12px; color: #0c4a6e; font-weight: 500; margin-bottom: 4px;">同比增长</div>
      <div style="font-size: 18px; font-weight: 700; color: #0ea5e9;">+15.2%</div>
    </div>
    <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #d1fae5;">
      <div style="font-size: 12px; color: #166534; font-weight: 500; margin-bottom: 4px;">环比增长</div>
      <div style="font-size: 18px; font-weight: 700; color: #059669;">+9.6%</div>
    </div>
    <div style="background: #fef3c7; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #fcd34d;">
      <div style="font-size: 12px; color: #92400e; font-weight: 500; margin-bottom: 4px;">目标达成</div>
      <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">112%</div>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
    <span style="font-size: 14px; color: #6b7280;">单位：亿元 | </span>
    <span style="font-size: 14px; color: #059669; font-weight: 500;">Q4创历史新高，连续四个季度保持增长</span>
  </div>
</div>
`;

// 市场份额分布 - 重新设计的排版布局
const modernMarketSharePie = `
<div style="padding: 60px 0; margin: 40px 0; max-width: 900px;">
  <!-- 标题区域 -->
  <div style="margin-bottom: 60px; text-align: left;">
    <h2 style="margin: 0 0 16px 0; font-size: 42px; font-weight: 200; color: #1f2937; letter-spacing: -1px; line-height: 1.1;">市场份额分布</h2>
    <div style="font-size: 18px; color: #6b7280; font-weight: 300; letter-spacing: 0.5px;">Market Share Distribution</div>
  </div>
  
  <!-- 市场份额排行榜 -->
  <div style="margin: 48px 0;">
    <!-- 第一名 -->
    <div style="display: flex; align-items: center; padding: 32px 0; border-bottom: 3px solid #f1f5f9; position: relative;">
      <div style="font-size: 24px; font-weight: 800; color: #fbbf24; margin-right: 32px; min-width: 40px;">1</div>
      <div style="flex: 1;">
        <div style="font-size: 28px; font-weight: 600; color: #111827; margin-bottom: 8px;">CompanyA</div>
        <div style="font-size: 16px; color: #6b7280;">行业领导者</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 48px; font-weight: 800; color: #111827; margin-bottom: 4px;">28.9<span style="font-size: 24px; color: #6b7280;">%</span></div>
        <div style="font-size: 14px; color: #6b7280;">+2.1% YoY</div>
      </div>
      <div style="position: absolute; left: 0; bottom: 0; height: 3px; width: 28.9%; background: linear-gradient(90deg, #fbbf24, #f59e0b);"></div>
    </div>
    
    <!-- 第二名（我司） -->
    <div style="display: flex; align-items: center; padding: 32px 0; border-bottom: 3px solid #f1f5f9; position: relative; background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); margin: 0 -20px; padding-left: 20px; padding-right: 20px; border-radius: 12px;">
      <div style="font-size: 24px; font-weight: 800; color: #3b82f6; margin-right: 32px; min-width: 40px;">2</div>
      <div style="flex: 1;">
        <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">我司</div>
        <div style="font-size: 16px; color: #3b82f6; font-weight: 500;">稳步增长中</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 48px; font-weight: 800; color: #1e40af; margin-bottom: 4px;">23.7<span style="font-size: 24px; color: #6b7280;">%</span></div>
        <div style="font-size: 14px; color: #3b82f6; font-weight: 600;">+1.8% YoY</div>
      </div>
      <div style="position: absolute; left: 20px; bottom: 0; height: 3px; width: calc(23.7% - 20px); background: linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
    </div>
    
    <!-- 第三名 -->
    <div style="display: flex; align-items: center; padding: 32px 0; border-bottom: 3px solid #f1f5f9; position: relative;">
      <div style="font-size: 24px; font-weight: 800; color: #f97316; margin-right: 32px; min-width: 40px;">3</div>
      <div style="flex: 1;">
        <div style="font-size: 28px; font-weight: 600; color: #111827; margin-bottom: 8px;">CompanyB</div>
        <div style="font-size: 16px; color: #6b7280;">传统竞争对手</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 48px; font-weight: 800; color: #111827; margin-bottom: 4px;">18.2<span style="font-size: 24px; color: #6b7280;">%</span></div>
        <div style="font-size: 14px; color: #ef4444;">-0.5% YoY</div>
      </div>
      <div style="position: absolute; left: 0; bottom: 0; height: 3px; width: 18.2%; background: linear-gradient(90deg, #f97316, #fb923c);"></div>
    </div>
    
    <!-- 其他公司 -->
    <div style="display: flex; align-items: center; padding: 24px 0; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 20px; font-weight: 600; color: #9ca3af; margin-right: 32px; min-width: 40px;">4</div>
      <div style="flex: 1;">
        <div style="font-size: 22px; font-weight: 500; color: #6b7280; margin-bottom: 4px;">CompanyC</div>
      </div>
      <div style="font-size: 32px; font-weight: 700; color: #6b7280;">16.5%</div>
    </div>
    
    <div style="display: flex; align-items: center; padding: 24px 0;">
      <div style="font-size: 20px; font-weight: 600; color: #9ca3af; margin-right: 32px; min-width: 40px;">—</div>
      <div style="flex: 1;">
        <div style="font-size: 22px; font-weight: 500; color: #6b7280; margin-bottom: 4px;">其他</div>
      </div>
      <div style="font-size: 32px; font-weight: 700; color: #6b7280;">12.7%</div>
    </div>
  </div>
  
  <!-- 市场洞察 -->
  <div style="margin-top: 60px; padding: 32px 0; text-align: center; background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border-radius: 16px;">
    <div style="font-size: 16px; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">MARKET INSIGHT</div>
    <div style="font-size: 24px; color: #1e40af; font-weight: 600; margin-bottom: 8px;">排名第2位，市场地位稳固</div>
    <div style="font-size: 16px; color: #6b7280; font-weight: 400;">与行业领导者差距缩小 • 增长势头良好</div>
  </div>
</div>
`;

// 股价走势 - 增强版可视化设计
const modernStockChart = `
<div style="background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%); border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); margin-bottom: 20px; position: relative; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 50%; opacity: 0.05;"></div>
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; position: relative; z-index: 1;">
    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #374151;">股价走势</h3>
      </div>
      <div style="font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 8px; letter-spacing: -1px;">¥156.80</div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 14px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 4px 8px; border-radius: 6px;">+12.8%</div>
        <div style="font-size: 12px; color: #6b7280;">6个月涨幅</div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 700; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);">📈</div>
      <div style="font-size: 11px; color: #6b7280; font-weight: 500;">强势上涨</div>
    </div>
  </div>
  
  <!-- SVG 股价图表 -->
  <div style="height: 180px; background: #f9fafb; border-radius: 12px; padding: 20px; position: relative; margin-bottom: 20px;">
    <svg width="100%" height="100%" viewBox="0 0 400 140" style="overflow: visible;">
      <!-- 网格背景 -->
      <defs>
        <pattern id="grid" width="40" height="28" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 28" fill="none" stroke="#e5e7eb" stroke-width="0.5" opacity="0.5"/>
        </pattern>
        <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      <!-- 网格 -->
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- 股价趋势线和填充区域 -->
      <path d="M 0,100 L 67,95 L 133,85 L 200,75 L 267,45 L 333,35 L 400,25 L 400,140 L 0,140 Z" fill="url(#stockGradient)" />
      <polyline fill="none" stroke="#3b82f6" stroke-width="3" points="0,100 67,95 133,85 200,75 267,45 333,35 400,25" filter="url(#glow)" />
      
      <!-- 数据点 -->
      <circle cx="0" cy="100" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="67" cy="95" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8" />
      <circle cx="133" cy="85" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8" />
      <circle cx="200" cy="75" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8" />
      <circle cx="267" cy="45" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8" />
      <circle cx="333" cy="35" r="4" fill="#3b82f6" stroke="white" stroke-width="2" opacity="0.8" />
      <circle cx="400" cy="25" r="6" fill="#059669" stroke="white" stroke-width="3">
        <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      
      <!-- 价格标签 -->
      <text x="400" y="15" text-anchor="end" font-size="12" font-weight="600" fill="#059669">¥156.80</text>
      <text x="0" y="115" text-anchor="start" font-size="10" fill="#6b7280">¥139.20</text>
    </svg>
    
    <!-- 悬浮信息框 -->
    <div style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.95); border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px);">
      <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">最高价</div>
      <div style="font-size: 12px; font-weight: 600; color: #059669;">¥158.90</div>
    </div>
  </div>
  
  <!-- 时间轴和统计信息 -->
  <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; color: #6b7280;">
    <span>7月</span>
    <span>8月</span>
    <span>9月</span>
    <span>10月</span>
    <span>11月</span>
    <span style="color: #059669; font-weight: 600;">12月</span>
  </div>
  
  <!-- 关键指标 -->
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px;">
    <div style="text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px; border: 1px solid #e0f2fe;">
      <div style="font-size: 14px; font-weight: 700; color: #0369a1;">¥139.20</div>
      <div style="font-size: 10px; color: #0369a1; margin-top: 2px;">期初价格</div>
    </div>
    <div style="text-align: center; padding: 12px; background: #ecfdf5; border-radius: 8px; border: 1px solid #d1fae5;">
      <div style="font-size: 14px; font-weight: 700; color: #059669;">¥158.90</div>
      <div style="font-size: 10px; color: #059669; margin-top: 2px;">最高价格</div>
    </div>
    <div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px; border: 1px solid #fbbf24;">
      <div style="font-size: 14px; font-weight: 700; color: #d97706;">2.8M</div>
      <div style="font-size: 10px; color: #d97706; margin-top: 2px;">日均成交</div>
    </div>
  </div>
  
  <!-- 技术分析 -->
  <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-top: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 12px; color: #374151; font-weight: 500;">技术指标</span>
      <span style="font-size: 12px; color: #059669; font-weight: 600;">多头排列</span>
    </div>
    <div style="display: flex; gap: 16px;">
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 10px; color: #6b7280;">MA5</span>
          <span style="font-size: 10px; color: #3b82f6; font-weight: 600;">¥154.20</span>
        </div>
        <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: 85%; background: #3b82f6; border-radius: 2px;"></div>
        </div>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 10px; color: #6b7280;">MA20</span>
          <span style="font-size: 10px; color: #f59e0b; font-weight: 600;">¥148.60</span>
        </div>
        <div style="height: 3px; background: #e5e7eb; border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; width: 72%; background: #f59e0b; border-radius: 2px;"></div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

export const modernDebugReport: InitFn = async (
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
      title: new Text('📊 现代财务分析报告 - Q4 2024'),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add main note block
    const noteId = store.addBlock(
      'affine:note',
      { xywh: '[0, 100, 1200, 800]' },
      rootId
    );

    // === 报告标题与概述 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '财务表现概览', attributes: {} }]),
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
              '本季度各项核心指标表现优异，营收增长超预期，盈利能力持续提升，市场地位稳固。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      noteId
    );

    // === 复杂多重嵌套布局结构 ===
    // 主容器：三列布局
    const mainContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    // 左列：营收指标（占40%）
    const leftColumnId = store.addBlock(
      'affine:column',
      { width: 40 },
      mainContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernMetricsCard),
        language: 'html',
      },
      leftColumnId
    );

    // 中列：嵌套多行布局（占35%）
    const middleColumnId = store.addBlock(
      'affine:column',
      { width: 35 },
      mainContainerId
    );

    // 中列第一行：利润率
    store.addBlock(
      'affine:code',
      {
        text: new Text(modernProfitCard),
        language: 'html',
      },
      middleColumnId
    );

    // 中列第二行：嵌套两列布局
    const nestedTwoColContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      middleColumnId
    );

    const nestedLeftColId = store.addBlock(
      'affine:column',
      { width: 50 },
      nestedTwoColContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernMarketShareCard),
        language: 'html',
      },
      nestedLeftColId
    );

    const nestedRightColId = store.addBlock(
      'affine:column',
      { width: 50 },
      nestedTwoColContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernROICard),
        language: 'html',
      },
      nestedRightColId
    );

    // 右列：图表区域（占25%）
    const rightColumnId = store.addBlock(
      'affine:column',
      { width: 25 },
      mainContainerId
    );

    // 右列嵌套垂直布局
    const rightNestedContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      rightColumnId
    );

    const rightTopColId = store.addBlock(
      'affine:column',
      { width: 100 },
      rightNestedContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(`
<div style="background: linear-gradient(135deg, #ddd6fe 0%, #ffffff 100%); border-radius: 16px; padding: 20px; margin-bottom: 16px; text-align: center; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
  <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #6b46c1; font-weight: 600;">实时监控</h4>
  <div style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">98.5%</div>
  <div style="font-size: 12px; color: #6b7280;">系统稳定性</div>
  <div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; margin-top: 12px; overflow: hidden;">
    <div style="width: 98.5%; height: 100%; background: #6b46c1; border-radius: 2px;"></div>
  </div>
</div>
        `),
        language: 'html',
      },
      rightTopColId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(`
<div style="background: linear-gradient(135deg, #fecaca 0%, #ffffff 100%); border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
  <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #dc2626; font-weight: 600;">风险预警</h4>
  <div style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 8px;">2</div>
  <div style="font-size: 12px; color: #6b7280;">待处理事项</div>
  <div style="margin-top: 12px; display: flex; justify-content: center; gap: 4px;">
    <div style="width: 8px; height: 8px; background: #dc2626; border-radius: 50%;"></div>
    <div style="width: 8px; height: 8px; background: #dc2626; border-radius: 50%;"></div>
    <div style="width: 8px; height: 8px; background: #e5e7eb; border-radius: 50%;"></div>
  </div>
</div>
        `),
        language: 'html',
      },
      rightTopColId
    );

    // === 财务分析详情 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '财务分析详情', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    // 现金流和风险评估
    const analysisContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const cashFlowColumnId = store.addBlock(
      'affine:column',
      { width: 60 },
      analysisContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernCashFlowTable),
        language: 'html',
      },
      cashFlowColumnId
    );

    const riskColumnId = store.addBlock(
      'affine:column',
      { width: 40 },
      analysisContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernRiskAssessment),
        language: 'html',
      },
      riskColumnId
    );

    // === 市场表现与趋势 ===
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '市场表现与趋势', attributes: {} }]),
        type: 'h2',
      },
      noteId
    );

    // 营收趋势图
    store.addBlock(
      'affine:code',
      {
        text: new Text(modernRevenueChart),
        language: 'html',
      },
      noteId
    );

    // 市场份额和股价走势
    const marketTrendContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const marketPieColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      marketTrendContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernMarketSharePie),
        language: 'html',
      },
      marketPieColumnId
    );

    const stockColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      marketTrendContainerId
    );

    store.addBlock(
      'affine:code',
      {
        text: new Text(modernStockChart),
        language: 'html',
      },
      stockColumnId
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

    // 投资评级和目标价位
    const investmentContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const ratingColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      investmentContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资评级', attributes: {} }]),
        type: 'h3',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '🟢 买入',
            attributes: {
              bold: true,
              color: 'var(--affine-text-emphasis-color)',
            },
          },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          { insert: '目标价位：', attributes: { bold: true } },
          {
            insert: '¥180.00',
            attributes: { color: 'var(--affine-text-emphasis-color)' },
          },
        ]),
        type: 'text',
      },
      ratingColumnId
    );

    const reasonColumnId = store.addBlock(
      'affine:column',
      { width: 50 },
      investmentContainerId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资理由', attributes: {} }]),
        type: 'h3',
      },
      reasonColumnId
    );

    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert:
              '基于强劲的财务表现和良好的市场前景，建议投资者积极关注并适当配置该股票。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      reasonColumnId
    );

    // 投资亮点
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([{ insert: '投资亮点', attributes: {} }]),
        type: 'h3',
      },
      noteId
    );

    const highlightsContainerId = store.addBlock(
      'affine:multi-column-container',
      {},
      noteId
    );

    const leftHighlightsId = store.addBlock(
      'affine:column',
      { width: 50 },
      highlightsContainerId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '📈 营收同比增长15.2%，超出市场预期', attributes: {} },
        ]),
      },
      leftHighlightsId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '💰 净利润率18.5%，行业领先水平', attributes: {} },
        ]),
      },
      leftHighlightsId
    );

    const rightHighlightsId = store.addBlock(
      'affine:column',
      { width: 50 },
      highlightsContainerId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '🎯 市场份额稳步提升，竞争优势明显', attributes: {} },
        ]),
      },
      rightHighlightsId
    );

    store.addBlock(
      'affine:list',
      {
        type: 'bulleted',
        text: new Text([
          { insert: '💎 现金流充沛，财务状况稳健', attributes: {} },
        ]),
      },
      rightHighlightsId
    );

    // 风险提示
    store.addBlock(
      'affine:paragraph',
      {
        text: new Text([
          {
            insert: '⚠️ 风险提示：',
            attributes: { bold: true, color: 'var(--affine-warning-color)' },
          },
          {
            insert: '投资有风险，建议根据个人风险承受能力合理配置。',
            attributes: {},
          },
        ]),
        type: 'text',
      },
      noteId
    );

    // === 报告结语 ===
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
          { insert: '报告日期：', attributes: { bold: true } },
          { insert: '2024年12月31日 | ', attributes: {} },
          { insert: '分析师：', attributes: { bold: true } },
          { insert: '投资研究部', attributes: {} },
        ]),
        type: 'text',
      },
      noteId
    );
  }
};

modernDebugReport.id = 'modern-debug-report';
