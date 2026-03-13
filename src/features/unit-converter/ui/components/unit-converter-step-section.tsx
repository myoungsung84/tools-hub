import { Label } from '@/components/ui/label'

function StepBadge({ step }: { step: number }) {
  return (
    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary'>
      {step}
    </span>
  )
}

type UnitConverterStepSectionProps = {
  step: number
  title: string
  htmlFor?: string
  children: React.ReactNode
}

export default function UnitConverterStepSection({
  step,
  title,
  htmlFor,
  children,
}: UnitConverterStepSectionProps) {
  return (
    <section className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <StepBadge step={step} />
        <Label htmlFor={htmlFor} className='text-sm font-semibold tracking-tight text-foreground'>
          {title}
        </Label>
      </div>
      {children}
    </section>
  )
}
