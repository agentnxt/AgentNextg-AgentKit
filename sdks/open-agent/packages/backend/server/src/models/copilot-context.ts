import { Injectable } from '@nestjs/common';

import { CopilotSessionNotFound } from '../base';
import { BaseModel } from './base';
import {
  ContextConfig,
  ContextConfigSchema,
  CopilotContext,
  MinimalContextConfigSchema,
} from './common/copilot';

type UpdateCopilotContextInput = Pick<CopilotContext, 'config'>;

/**
 * Copilot Job Model
 */
@Injectable()
export class CopilotContextModel extends BaseModel {
  // ================ contexts ================

  async create(sessionId: string) {
    const session = await this.db.aiSession.findFirst({
      where: { id: sessionId },
      select: { userId: true },
    });
    if (!session) {
      throw new CopilotSessionNotFound();
    }

    const row = await this.db.aiContext.create({
      data: {
        sessionId,
        config: {
          userId: session.userId,
          chats: [],
          docs: [],
          files: [],
        },
      },
    });
    return row;
  }

  async get(id: string) {
    const row = await this.db.aiContext.findFirst({
      where: { id },
    });
    return row;
  }

  async getConfig(id: string): Promise<ContextConfig | null> {
    const row = await this.get(id);
    if (row) {
      const config = ContextConfigSchema.safeParse(row.config);
      if (config.success) {
        return config.data;
      }
      const minimalConfig = MinimalContextConfigSchema.safeParse(row.config);
      if (minimalConfig.success) {
        // fulfill the missing fields
        return {
          ...minimalConfig.data,
          chats: [],
          docs: [],
          files: [],
        };
      }
    }
    return null;
  }

  async getBySessionId(sessionId: string) {
    const row = await this.db.aiContext.findFirst({
      where: { sessionId },
    });
    return row;
  }

  async update(contextId: string, data: UpdateCopilotContextInput) {
    const ret = await this.db.aiContext.updateMany({
      where: {
        id: contextId,
      },
      data: {
        config: data.config || undefined,
      },
    });
    return ret.count > 0;
  }
}
