export default function HomeOverlay() {
  return (
    <div
      className='pointer-events-none absolute inset-0 z-[1]'
      style={{
        background:
          'radial-gradient(ellipse 70% 65% at 50% 52%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 70%, transparent 100%)',
      }}
    />
  )
}
