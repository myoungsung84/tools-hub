export default function TimeBackgroundGlow() {
  return (
    <div
      className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[360px] sm:w-[600px]
                 h-[260px] sm:h-[400px]
                 bg-indigo-500/5 rounded-full
                 blur-[100px] sm:blur-[120px]
                 -z-10'
    />
  )
}
