import { produce } from 'immer';
import type { ChatMessage } from '@/store/copilot/types';
import { mergeStreamObjects } from '@/store/copilot/utils';

export interface StreamOptions {
  /**
   * Number of characters to reveal per frame when streaming plain text or text-delta.
   * Defaults to 1 (character-by-character).
   */
  charChunk?: number;
}

const randomDelay = async (min: number, max: number) => {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
};

/**
 * Generate progressively updated copies of a final ChatMessage array, emulating
 * how messages arrive from the backend streaming API.
 *
 * Each `yield` returns a **new** ChatMessage[] reference; no object from a
 * previously yielded frame is mutated afterwards.
 *
 * Streaming rules
 * 1. Messages are revealed in order.
 * 2. If a message has `streamObjects`, they are emitted one-by-one.
 *    • For non-`text-delta` objects → push the whole object at once.
 *    • For `text-delta` objects → reveal the `textDelta` string progressively
 *      by `charChunk` characters.
 * 3. If a message has no `streamObjects`, its `content` is revealed
 *    progressively by `charChunk` characters.
 */
export async function* streamMessages(
  finalMessages: ChatMessage[],
  opts: StreamOptions = {}
): AsyncGenerator<ChatMessage[], void, unknown> {
  const chunk = Math.max(1, opts.charChunk ?? 1);

  // The evolving timeline we will clone & yield.
  let current: ChatMessage[] = [];

  // Helper to deep-clone the timeline immutably using immer.
  const pushFrame = (recipe: (draft: ChatMessage[]) => void) => {
    current = produce(current, recipe);
    // Always yield a brand-new reference so React detects change.
    return current;
  };

  for (const msg of finalMessages) {
    // User messages are not streamed; add fully and yield once.
    if (msg.role === 'user') {
      pushFrame(draft => {
        draft.push({ ...msg });
      });
      yield current;
      continue;
    }

    // 1) Reveal the message itself with empty/partial content.
    pushFrame(draft => {
      const placeholder: ChatMessage = { ...msg } as ChatMessage;
      if (msg.streamObjects && msg.streamObjects.length > 0) {
        placeholder.streamObjects = [];
        placeholder.content = '';
      } else {
        placeholder.content = '';
      }
      draft.push(placeholder);
    });
    await randomDelay(500, 1000);
    yield current;

    const idx = current.length - 1; // index of the message we are working on

    // 2) Stream its data
    if (msg.streamObjects && msg.streamObjects.length > 0) {
      /**
       * Stream objects case
       * ------------------------------------------------------------------
       */
      for (const obj of msg.streamObjects) {
        if (obj.type === 'text-delta' && typeof obj.textDelta === 'string') {
          // Reveal textDelta progressively
          const full = obj.textDelta;
          let partial = '';
          for (let i = 0; i < full.length; i += chunk) {
            partial += full.slice(i, i + chunk);
            const textDeltaObj = { ...obj, textDelta: partial } as any;

            if (partial.length === chunk) {
              // First chunk → push new object
              pushFrame(draft => {
                const msgDraft = draft[idx];
                if (!msgDraft.streamObjects) msgDraft.streamObjects = [];
                msgDraft.streamObjects!.push(textDeltaObj);
                msgDraft.streamObjects = mergeStreamObjects(msgDraft.streamObjects as any);
              });
            } else {
              // Subsequent chunks → update last object
              pushFrame(draft => {
                const msgDraft = draft[idx];
                const soList = msgDraft.streamObjects!;
                soList[soList.length - 1] = textDeltaObj;
                msgDraft.streamObjects = mergeStreamObjects(soList as any);
              });
            }
            yield current;
          }
        } else {
          // Non-text-delta: push entire object in one go
          pushFrame(draft => {
            const msgDraft = draft[idx];
            if (!msgDraft.streamObjects) msgDraft.streamObjects = [];
            msgDraft.streamObjects!.push({ ...obj } as any);
            msgDraft.streamObjects = mergeStreamObjects(msgDraft.streamObjects as any);
          });
          await randomDelay(500, 1000);
          yield current;
          await randomDelay(500, 1000);
        }
      }
    } else {
      /**
       * Plain content case
       * ------------------------------------------------------------------
       */
      const full = msg.content || '';
      let partial = '';
      for (let i = 0; i < full.length; i += chunk) {
        partial += full.slice(i, i + chunk);
        pushFrame(draft => {
          draft[idx].content = partial;
        });
        await randomDelay(500, 1000);
        yield current;
      }
    }
  }
}
