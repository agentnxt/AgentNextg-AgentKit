import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useState,
} from 'react';

const ChatScrollerContext = createContext<HTMLDivElement | null>(null);

export const ChatScrollerProvider = forwardRef(function ChatScrollerProvider(
  { children, ...attrs }: HTMLAttributes<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>
) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  const onRef = (el: HTMLDivElement) => {
    setEl(el);
    if (ref) {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    }
  };

  return (
    <div ref={onRef} {...attrs}>
      <ChatScrollerContext.Provider value={el}>
        {el ? children : null}
      </ChatScrollerContext.Provider>
    </div>
  );
});

export const useChatScroller = () => {
  const el = useContext(ChatScrollerContext);
  if (!el) {
    throw new Error(
      'useChatScroller must be used within a ChatScrollerProvider'
    );
  }
  return el;
};
