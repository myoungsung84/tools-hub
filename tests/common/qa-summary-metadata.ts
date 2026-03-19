import type { TestInfo } from '@playwright/test'

type QaSummaryPrimitive = string | number | boolean

type QaSummaryValue = QaSummaryPrimitive | null | undefined | QaSummaryPrimitive[]

type QaSummaryFields = Record<string, QaSummaryValue>

type QaSummaryMetadata = {
  parameters?: QaSummaryFields
  checks?: QaSummaryFields
}

type SerializableQaEntry = [key: string, value: string | string[]]

function toSerializableEntries(fields: QaSummaryFields): SerializableQaEntry[] {
  const serializedEntries: SerializableQaEntry[] = []

  for (const [key, value] of Object.entries(fields)) {
    if (value == null) {
      continue
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue
      }

      serializedEntries.push([key, value.map(item => String(item))])
      continue
    }

    const serializedValue = String(value).trim()

    if (!serializedValue) {
      continue
    }

    serializedEntries.push([key, serializedValue])
  }

  return serializedEntries
}

function pushMetadataAnnotation(
  testInfo: TestInfo,
  type: 'qa:parameters' | 'qa:checks',
  fields?: QaSummaryFields
) {
  if (!fields) {
    return
  }

  const entries = toSerializableEntries(fields)

  if (entries.length === 0) {
    return
  }

  testInfo.annotations.push({
    type,
    description: JSON.stringify(Object.fromEntries(entries)),
  })
}

export function setQaSummaryMetadata(testInfo: TestInfo, metadata: QaSummaryMetadata) {
  pushMetadataAnnotation(testInfo, 'qa:parameters', metadata.parameters)
  pushMetadataAnnotation(testInfo, 'qa:checks', metadata.checks)
}
