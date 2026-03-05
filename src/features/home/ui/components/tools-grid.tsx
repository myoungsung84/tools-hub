import { TOOLS_NAV } from '@/lib/constants/tools-nav'

import ToolCard from './tool-card'

type ToolNavItem = (typeof TOOLS_NAV)[number]

export default function ToolsGrid({
  tools,
}: {
  tools: ToolNavItem[]
}) {
  return (
    <div className='relative z-10 mt-10 grid w-full max-w-[900px] grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-3'>
      {tools.map(tool => (
        <ToolCard key={tool.href} tool={tool} />
      ))}
    </div>
  )
}
