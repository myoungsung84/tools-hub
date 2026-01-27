import { z } from 'zod'

const ipApiSchema = z.object({
  country_name: z.string().optional(),
  city: z.string().optional(),
  org: z.string().optional(),
})

export type IpGeo = z.infer<typeof ipApiSchema>

export async function fetchIpGeo(
  params: { ip: string },
  signal?: AbortSignal
): Promise<IpGeo | null> {
  if (!params.ip || params.ip === 'unknown') return null

  if (params.ip === '::1' || params.ip === '127.0.0.1') {
    return ipApiSchema.parse({
      country_name: 'Localhost',
      city: 'Localhost',
      org: 'Localhost',
    })
  }

  const url = `https://ipapi.co/${encodeURIComponent(params.ip)}/json/`
  const res = await fetch(url, {
    signal,
    next: { revalidate: 60 },
  })

  if (!res.ok) return null

  const json = (await res.json()) as unknown
  const parsed = ipApiSchema.safeParse(json)
  if (!parsed.success) return null

  return parsed.data
}
