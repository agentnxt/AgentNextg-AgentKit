import { Injectable, Logger } from '@nestjs/common';
import type { TextStreamPart } from 'ai';
import {
  AuthenticationDetailsProvider,
  ConfigFileReader,
  Realm,
  Region,
  RegionProvider,
  SimpleAuthenticationDetailsProvider,
} from 'oci-common';
import { GenerativeAiInferenceClient } from 'oci-generativeaiinference';
import type {
  ImageContent,
  TextContent,
} from 'oci-generativeaiinference/lib/model';
import type { ChatRequest } from 'oci-generativeaiinference/lib/request';

import { metrics } from '../../../base';
import type { CustomAITools } from '../tools';
import { CopilotProvider } from './provider';
import type {
  CopilotChatOptions,
  CopilotProviderModel,
  ModelConditions,
  PromptMessage,
} from './types';
import { CopilotProviderType, ModelInputType, ModelOutputType } from './types';
import {
  chatToGPTMessage,
  imageToUrl,
  StreamObjectParser,
  TextStreamParser,
} from './utils';

export type OracleConfig = {
  endpoint?: string; // e.g. https://inference.generativeai.<region>.oci.oraclecloud.com
  compartmentId?: string; // OCID
  config?: {
    user: string;
    fingerprint: string;
    tenancy: string;
    region: string;
  };
  privateKey?: string;
};

type OracleChatMessage = {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: Array<TextContent | ImageContent>;
};

// Minimal stream part that TextStreamParser understands
type OracleStreamChunk = TextStreamPart<CustomAITools>;

const MODELS_MAP: Record<string, string> = {
  'grok4-oracle':
    'ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya3bsfz4ogiuv3yc7gcnlry7gi3zzx6tnikg6jltqszm2q',
};

@Injectable()
export class OracleProvider extends CopilotProvider<OracleConfig> {
  readonly type = CopilotProviderType.Oracle;

  readonly models: CopilotProviderModel[] = [
    {
      id: 'grok4-oracle',
      capabilities: [
        {
          input: [ModelInputType.Text],
          output: [ModelOutputType.Text, ModelOutputType.Object],
          defaultForOutputType: true,
        },
      ],
    },
  ];

  #instance!: GenerativeAiInferenceClient;

  configured(): boolean {
    const { endpoint, compartmentId, config, privateKey } = this.config;
    return !!(endpoint && compartmentId && config && privateKey);
  }

  protected override setup() {
    super.setup();
    if (this.configured()) {
      const { config, endpoint, privateKey } = this.config;
      const provider = OracleAuthProvider.init(config!, privateKey!);
      const client = new GenerativeAiInferenceClient({
        authenticationDetailsProvider: provider,
      });
      client.endpoint = endpoint!;
      this.#instance = client;
    }
  }

  async text(
    cond: ModelConditions,
    messages: PromptMessage[],
    options: CopilotChatOptions = {}
  ): Promise<string> {
    await this.checkParams({ messages, cond, options });

    let result = '';
    for await (const chunk of this.streamText(cond, messages, options)) {
      result += chunk;
      if (options.signal?.aborted) {
        break;
      }
    }

    return result;
  }

  async *streamText(
    cond: ModelConditions,
    messages: PromptMessage[],
    options: CopilotChatOptions = {}
  ): AsyncIterable<string> {
    const fullCond = { ...cond, outputType: ModelOutputType.Text } as const;
    await this.checkParams({ messages, cond: fullCond, options });
    const model = this.selectModel(fullCond);
    const textParser = new TextStreamParser(model.id);

    metrics.ai.counter('chat_text_stream_calls').add(1, { model: model.id });

    try {
      const { fullStream } = await this.getOracleStream(
        model.id,
        messages,
        options
      );
      for await (const chunk of fullStream) {
        // Only text deltas supported for now
        if (chunk.type === 'text-delta') {
          const out = textParser.parse(chunk);
          if (out) yield out;
        }
        if (options.signal?.aborted) {
          break;
        }
      }
      await textParser.handleFinish();
    } catch (e: any) {
      metrics.ai.counter('chat_text_stream_errors').add(1, { model: model.id });
      textParser.handleError();
      throw e;
    }
  }

  override async *streamObject(
    cond: ModelConditions,
    messages: PromptMessage[],
    options: CopilotChatOptions = {}
  ): AsyncIterable<import('./types').StreamObject> {
    const fullCond = { ...cond, outputType: ModelOutputType.Object } as const;
    await this.checkParams({ messages, cond: fullCond, options });
    const model = this.selectModel(fullCond);
    const parser = new StreamObjectParser(model.id, this.moduleRef);

    try {
      metrics.ai
        .counter('chat_object_stream_calls')
        .add(1, { model: model.id });
      const { fullStream } = await this.getOracleStream(
        model.id,
        messages,
        options
      );

      for await (const chunk of fullStream) {
        const result = parser.parse(chunk);
        if (result) {
          yield result;
        }
        if (options.signal?.aborted) {
          parser.handleError();
          break;
        }
      }
      // Emit a final status object for completeness
      yield await parser.statusStreamObject();
      await parser.handleFinish();
    } catch (e: any) {
      metrics.ai
        .counter('chat_object_stream_errors')
        .add(1, { model: model.id });
      parser.handleError();
      throw e;
    }
  }

  // ===== Implementation details =====

  private async getOracleStream(
    modelId: string,
    messages: PromptMessage[],
    options: CopilotChatOptions
  ): Promise<{ fullStream: AsyncIterable<OracleStreamChunk> }> {
    const [system, gptMsgs] = await chatToGPTMessage(messages, false);

    // Build Oracle request payload
    const toRole = (role: 'user' | 'assistant'): 'USER' | 'ASSISTANT' =>
      role === 'user' ? 'USER' : 'ASSISTANT';
    const oracleMsgs: OracleChatMessage[] = [];
    if (system?.trim()) {
      oracleMsgs.push({
        role: 'SYSTEM',
        content: [{ type: 'TEXT', text: system }],
      });
    }
    for (const m of gptMsgs) {
      oracleMsgs.push({
        role: toRole(m.role as 'user' | 'assistant'),
        content:
          typeof m.content === 'string'
            ? [{ type: 'TEXT', text: m.content }]
            : m.content
                .map(c => {
                  if (c.type === 'text') {
                    return { type: 'TEXT', text: c.text };
                  } else if (c.type === 'image') {
                    const imageUri = imageToUrl(c.image);
                    if (imageUri) return { type: 'IMAGE', imageUri };
                  }
                  return undefined;
                })
                .filter(c => !!c),
      });
    }

    const safeOptions = options || {};
    const req: ChatRequest = {
      chatDetails: {
        compartmentId: this.config.compartmentId!,
        servingMode: {
          servingType: 'ON_DEMAND',
          modelId: MODELS_MAP[modelId] || modelId,
        },
        chatRequest: {
          messages: oracleMsgs,
          apiFormat: 'GENERIC',
          maxTokens: safeOptions.maxTokens ?? 512,
          temperature: safeOptions.temperature ?? 0,
          topK: 0,
          topP: 1,
        },
      },
    };

    // Delegate to a fetcher which can be mocked in tests
    const iterator = this.fetchChatStream(req);
    return { fullStream: iterator };
  }

  protected async *fetchChatStream(
    req: ChatRequest
  ): AsyncIterable<OracleStreamChunk> {
    const response = await this.#instance.chat(req);

    // Best-effort extraction of text from response
    function collectTexts(obj: any, out: string[]) {
      if (!obj || typeof obj !== 'object') return;
      for (const [k, v] of Object.entries(obj)) {
        if (k.toLowerCase().includes('text') && typeof v === 'string') {
          out.push(v);
        } else if (Array.isArray(v)) {
          for (const item of v) collectTexts(item, out);
        } else if (v && typeof v === 'object') {
          collectTexts(v, out);
        }
      }
    }
    const texts: string[] = [];
    collectTexts(response, texts);
    const fullText = texts.join('\n').trim() || JSON.stringify(response);

    // Emit as small chunks to simulate streaming
    const chunkSize = 200;
    let id = 0;
    for (let i = 0; i < fullText.length; i += chunkSize) {
      const text = fullText.slice(i, i + chunkSize);
      const chunk: TextStreamPart<CustomAITools> = {
        type: 'text-delta',
        id: `oracle-${++id}`,
        text,
      };
      yield chunk;
    }
  }
}

export class OracleAuthProvider
  extends SimpleAuthenticationDetailsProvider
  implements AuthenticationDetailsProvider, RegionProvider
{
  // Lightweight local replacement for oci-common's checkNotNull to avoid deep runtime imports in ESM
  private static checkNotNull<T>(
    value: T | null | undefined,
    message: string
  ): T {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
    return value as T;
  }

  static init(
    config: NonNullable<OracleConfig['config']>,
    privateKeyContent: string,
    sessionToken?: string
  ): OracleAuthProvider {
    const file = ConfigFileReader.parse(
      `[DEFAULT]\n${Object.entries(config)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')}`,
      ConfigFileReader.DEFAULT_PROFILE_NAME
    );

    return new OracleAuthProvider(
      OracleAuthProvider.checkNotNull(
        file.get('tenancy'),
        'missing tenancy in config'
      ),
      sessionToken
        ? ''
        : OracleAuthProvider.checkNotNull(
            file.get('user'),
            'missing user in config'
          ),
      OracleAuthProvider.checkNotNull(
        file.get('fingerprint'),
        'missing fingerprint in config'
      ),
      privateKeyContent,
      file.get('pass_phrase'),
      OracleAuthProvider.retrieveRegionFromRegionId(
        OracleAuthProvider.checkNotNull(
          file.get('region'),
          'missing region in config'
        )
      ),
      undefined,
      undefined,
      file.profileCredentials,
      sessionToken
    );
  }

  static retrieveRegionFromRegionId(regionId: string): Region {
    let region: Region;
    try {
      region = Region.fromRegionId(regionId);
      if (!region) {
        // Proceed by assuming the region id in the config file belongs to OC1 realm.
        new Logger(OracleAuthProvider.name).warn(
          `Falling back to using OC1 realm.`
        );
        region = Region.register(regionId, Realm.OC1);
      }
      return region;
    } catch (e) {
      throw new Error(
        `Error from retrying to retrieve region from regionId: ${e}.`
      );
    }
  }

  // @ts-expect-error
  public override setRegion(regionId: string): void {
    super.setRegion(OracleAuthProvider.retrieveRegionFromRegionId(regionId));
  }
}
