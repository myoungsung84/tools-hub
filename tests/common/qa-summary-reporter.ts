import fs from 'node:fs'
import path from 'node:path'

import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter'

type SummaryEntry = {
  title: string
  file: string
  status: string
  failureReason: string | null
  artifactPaths: string[]
}

function toRelativePath(targetPath: string) {
  return path.relative(process.cwd(), targetPath) || targetPath
}

function formatFailureReason(errors: TestError[]) {
  const message = errors
    .map(error => error.message?.trim())
    .find(Boolean)

  if (!message) return null

  return message
    .replace(/\u001B\[[0-9;]*m/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join('\n')
}

function collectArtifactPaths(result: TestResult) {
  return result.attachments
    .map(attachment => attachment.path)
    .filter((value): value is string => Boolean(value))
    .map(toRelativePath)
}

class QaSummaryReporter implements Reporter {
  private entries: SummaryEntry[] = []

  onBegin(_config: FullConfig) {
    this.entries = []
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.entries.push({
      title: test.titlePath().slice(1).join(' > '),
      file: toRelativePath(test.location.file),
      status: result.status,
      failureReason: formatFailureReason(result.errors),
      artifactPaths: collectArtifactPaths(result),
    })
  }

  onEnd(result: FullResult) {
    const outputDir = path.join(process.cwd(), 'test-results')
    const outputPath = path.join(outputDir, 'qa-summary.md')

    fs.mkdirSync(outputDir, { recursive: true })

    const total = this.entries.length
    const passed = this.entries.filter(entry => entry.status === 'passed').length
    const failed = this.entries.filter(entry => entry.status === 'failed').length
    const skipped = this.entries.filter(entry => entry.status === 'skipped').length

    const lines = [
      '# QA Summary',
      '',
      `- 실행 결과: ${result.status}`,
      `- 전체: ${total}`,
      `- 성공: ${passed}`,
      `- 실패: ${failed}`,
      `- 스킵: ${skipped}`,
      '',
    ]

    for (const entry of this.entries) {
      lines.push(`## ${entry.status.toUpperCase()} - ${entry.title}`)
      lines.push(`- 파일: ${entry.file}`)

      if (entry.failureReason) {
        lines.push('- 실패 이유:')
        lines.push('```text')
        lines.push(entry.failureReason)
        lines.push('```')
      } else {
        lines.push('- 실패 이유: 없음')
      }

      if (entry.artifactPaths.length > 0) {
        lines.push('- 실패 아티팩트:')
        for (const artifactPath of entry.artifactPaths) {
          lines.push(`  - ${artifactPath}`)
        }
      } else {
        lines.push('- 실패 아티팩트: 없음')
      }

      lines.push('')
    }

    fs.writeFileSync(outputPath, `${lines.join('\n').trimEnd()}\n`, 'utf8')
  }
}

export default QaSummaryReporter
