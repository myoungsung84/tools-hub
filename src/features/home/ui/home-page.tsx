import BackgroundSceneRotator from '@/components/layout/background/background-scene-rotator'
import { TOOLS_NAV } from '@/lib/constants/tools-nav'

import HomeHero from './components/home-hero'
import HomeOverlay from './components/home-overlay'
import ToolsGrid from './components/tools-grid'

export default function HomePage() {
  const tools = [...TOOLS_NAV].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  return (
    <div className='relative w-full flex flex-1 flex-col items-center justify-center gap-0'>
      <BackgroundSceneRotator />
      <HomeOverlay />
      <HomeHero />
      <ToolsGrid tools={tools} />
    </div>
  )
}
