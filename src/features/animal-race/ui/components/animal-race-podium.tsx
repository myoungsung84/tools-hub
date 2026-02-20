'use client'

import Image from 'next/image'

import type { Participant } from '../../lib/animal-race.types'

type AnimalRacePodiumProps = {
  top3: Participant[]
}

export default function AnimalRacePodium({ top3 }: AnimalRacePodiumProps) {
  if (!top3.length) return null

  return (
    <section className='rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm'>
      <h3 className='mb-3 text-lg font-semibold text-white'>Podium</h3>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
        {top3.map((participant, index) => (
          <div key={participant.id} className='rounded-lg border border-white/10 bg-white/5 p-3 text-center'>
            <p className='text-sm font-bold text-white/90'>{index + 1}위</p>
            <Image
              src={`/animals/${participant.animalKey}.png`}
              alt={participant.name}
              width={72}
              height={72}
              className='mx-auto h-16 w-16 object-contain'
            />
            <p className='text-sm text-white'>{participant.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
