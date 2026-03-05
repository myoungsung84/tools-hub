import type { ComponentType } from 'react'

import ToolCard from './tool-card'

export default function ToolsGrid({
  tools,
}: {
  tools: Array<{
    href: string
    icon: ComponentType<{ size?: number; className?: string }>
    label: { ko: string; en: string }
    priority?: number
  }>
}) {
  return (
    <div className='relative z-10 mt-10 grid w-full max-w-[900px] grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-3'>
      {tools.map(tool => (
        <ToolCard key={tool.href} tool={tool} />
      ))}
    </div>
  )
}
