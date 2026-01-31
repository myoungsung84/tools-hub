import type { LucideIcon } from 'lucide-react'

type PageHeaderProps = {
  icon?: LucideIcon
  kicker?: string
  title: string
  description?: string
}

export default function PageHeader({ icon: Icon, kicker, title, description }: PageHeaderProps) {
  return (
    <div className='mb-8 flex flex-col gap-2'>
      {(Icon || kicker) && (
        <div className='flex items-center gap-2 text-primary'>
          {Icon && <Icon className='h-6 w-6' />}
          {kicker && <span className='font-bold uppercase tracking-wider'>{kicker}</span>}
        </div>
      )}

      <h1 className='text-3xl font-extrabold tracking-tight lg:text-4xl'>{title}</h1>

      {description && <p className='text-muted-foreground'>{description}</p>}
    </div>
  )
}
