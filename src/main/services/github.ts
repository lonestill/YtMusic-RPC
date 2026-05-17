const API_URL = 'https://api.github.com/repos/M3th4d0n/YtMusic-RPC/releases/latest'

export async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch(API_URL, { headers: { 'User-Agent': 'YtMusic-RPC' } })
    if (!res.ok) return ''
    const data = await res.json() as { tag_name?: string }
    return (data.tag_name ?? '').replace(/^v/, '')
  } catch {
    return ''
  }
}

export function isNewerVersion(latest: string, current: string): boolean {
  if (!latest) return false
  try {
    const parse = (v: string) => v.split('.').map(Number)
    const [a, b] = [parse(latest), parse(current)]
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) {
      const diff = (a[i] ?? 0) - (b[i] ?? 0)
      if (diff !== 0) return diff > 0
    }
    return false
  } catch {
    return false
  }
}
