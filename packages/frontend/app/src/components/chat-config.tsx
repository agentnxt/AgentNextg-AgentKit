import { Menu, MenuItem, MenuSeparator, MenuSub, Switch } from '@afk/component';
import {
  AiIcon,
  CodeIcon,
  MakeItRealIcon,
  PageIcon,
  SelectionIcon,
  ThinkingIcon,
  WebIcon,
} from '@blocksuite/icons/rc';
import type { Dispatch, SetStateAction } from 'react';

import { ChatGPTIcon } from '@/icons/chatgpt';
import { ClaudeIcon } from '@/icons/claude';
import { GeminiIcon } from '@/icons/gemini';

export const tempModels = [
  {
    label: 'Claude Sonnet 4',
    value: 'claude-sonnet-4@20250514',
    icon: <ClaudeIcon />,
  },
  { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro', icon: <GeminiIcon /> },
  { label: 'GPT-5', value: 'gpt-5', icon: <ChatGPTIcon /> },
  {
    label: 'Gemini 2.5 Flash',
    value: 'gemini-2.5-flash',
    icon: <GeminiIcon />,
  },
  { label: 'o4 Mini', value: 'o4-mini', icon: <ChatGPTIcon /> },
];

export const configurableTools = [
  {
    label: 'Code Artifact',
    icon: <CodeIcon />,
    value: 'codeArtifact',
  },
  {
    label: 'Make It Real',
    icon: <MakeItRealIcon />,
    value: 'makeItReal',
  },
  {
    label: 'Doc Compose',
    icon: <PageIcon />,
    value: 'docCompose',
  },
  {
    label: 'Web Search',
    icon: <WebIcon />,
    value: 'webSearch',
  },
  // {
  //   label: 'Web Crawl',
  //   icon: <WebIcon />,
  //   value: 'web_crawl_exa',
  // },
  // {
  //   label: 'Todo',
  // },
  {
    label: 'Python',
    icon: <CodeIcon />,
    value: ['pythonCoding', 'pythonSandbox'],
  },
  {
    label: 'Browser Use',
    icon: <SelectionIcon />,
    value: 'browserUse',
  },
  {
    label: 'Task Analysis',
    icon: <ThinkingIcon />,
    value: 'taskAnalysis',
  },
];

export const defaultTools = [
  'conversationSummary',
  'todoList',
  'markTodo',
  'docEdit',
  'choose',
  ...configurableTools.map(tool => tool.value).flat(),
];

export const ChatConfigMenu = ({
  model,
  setModel,
  children,
  tools,
  setTools,
}: {
  children: React.ReactNode;
  model: string;
  setModel: Dispatch<SetStateAction<string>>;
  tools: string[];
  setTools: Dispatch<SetStateAction<string[]>>;
}) => {
  return (
    <Menu
      contentOptions={{
        style: { padding: 0 },
      }}
      items={
        <div>
          <div className="flex flex-col px-2 pt-2">
            <MenuSub
              items={tempModels.map(m => (
                <MenuItem
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  prefixIcon={m.icon}
                  selected={model === m.value}
                >
                  {m.label}
                </MenuItem>
              ))}
              triggerOptions={{
                prefixIcon: <AiIcon />,
              }}
              subContentOptions={{
                sideOffset: 14,
                alignOffset: -8,
              }}
            >
              Foundation Model
            </MenuSub>
          </div>
          <MenuSeparator />
          <div className="flex flex-col gap-1 items-stretch px-2 pb-2 w-full">
            {configurableTools.map(tool => {
              const toolNames = Array.isArray(tool.value)
                ? tool.value
                : [tool.value];
              const isEnabled = toolNames.every(name => tools.includes(name));
              return (
                <div
                  className="flex gap-2 items-center w-full"
                  style={{ minWidth: 'min(100vw, 300px)' }}
                  key={tool.label}
                >
                  <div className="size-6 text-xl text-icon-primary flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <div className="flex-1">{tool.label}</div>
                  <Switch
                    size={20}
                    checked={isEnabled}
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    onChange={checked => {
                      if (checked) {
                        setTools(prev =>
                          Array.from(new Set([...prev, ...toolNames]))
                        );
                      } else {
                        setTools(prev =>
                          prev.filter(name => !toolNames.includes(name))
                        );
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      }
    >
      {children}
    </Menu>
  );
};
