import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  // Minimal layout - no sidebar or header for full-screen scan experience
  return <>{children}</>;
}
