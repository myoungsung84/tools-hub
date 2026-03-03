import AppLayout from '@/components/layout/app-layout'
import { Toaster } from '@/components/ui/sonner'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
      <Toaster richColors position='bottom-center' />
    </AppLayout>
  )
}
