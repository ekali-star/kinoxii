import { ComingSoonSection } from './ComingSoonSection'
import { HeroCarousel } from './HeroCarousel'
import { NowPlayingSection } from './NowPlayingSection'
import { RecentlyViewedSection } from './RecentlyViewedSection'

export function HomePage() {
  return (
    <>
      <HeroCarousel />
      <RecentlyViewedSection />
      <NowPlayingSection />
      <ComingSoonSection />
    </>
  )
}
