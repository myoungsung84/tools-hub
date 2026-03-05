export default function HomeHero() {
  return (
    <div className='relative z-10 flex flex-col items-center text-center px-6'>
      <p className='text-[13px] font-semibold uppercase tracking-[0.35em] text-white/60'>Tools Hub</p>

      <h1
        className='mt-4 text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.1] tracking-tight text-white'
        style={{ textShadow: '0 2px 40px rgba(0,0,0,0.7)' }}
      >
        자주 쓰는 도구,{' '}
        <span className='text-white/50' style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
          한곳에.
        </span>
      </h1>

      <p className='mt-5 text-[14px] leading-[1.9] text-white/60' style={{ textShadow: '0 1px 20px rgba(0,0,0,0.8)' }}>
        검색하거나 북마크를 뒤질 필요 없이,
        <br />
        필요한 도구를 바로 꺼내 쓰세요.
      </p>
    </div>
  )
}
