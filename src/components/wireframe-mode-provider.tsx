"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface WireframeContextValue {
  readonly isWireframe: boolean;
  readonly toggle: () => void;
}

const WireframeContext = createContext<WireframeContextValue>({
  isWireframe: false,
  toggle: () => {},
});

export function useWireframeMode(): WireframeContextValue {
  return useContext(WireframeContext);
}

export function WireframeModeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isWireframe, setIsWireframe] = useState(false);
  const toggle = useCallback(() => setIsWireframe((prev) => !prev), []);

  return (
    <WireframeContext.Provider value={{ isWireframe, toggle }}>
      <div className={isWireframe ? "wireframe-mode" : ""}>{children}</div>
    </WireframeContext.Provider>
  );
}
