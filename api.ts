import Reader from 'libseymour'

let authHeader: string | null = null

function encodeBase64(str: string): string {
  if (typeof btoa === 'function') return btoa(str)
  if (typeof Buffer !== 'undefined') return Buffer.from(str).toString('base64')
  throw new Error('No base64 available')
}

/**
 * 最简单的：调用 setBasicAuth(user, pass) 来设置 Basic Auth（Node 或浏览器都可）。
 * 不调用则在浏览器中使用已有的 session cookie（fetch 会带 credentials:'include'）。
 */
export function setBasicAuth(user: string, pass: string): void {
  if (!user && !pass) {
    authHeader = null
    return
  }
  authHeader = 'Basic ' + encodeBase64(`${user}:${pass}`)
}

export function clearAuth(): void {
  authHeader = null
}

function seymourFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const initCopy = { ...(init || {}) }
  const headers = new Headers(initCopy.headers || {})

  if (authHeader) headers.set('Authorization', authHeader)

  // 浏览器默认复用 cookie 会话
  if (typeof window !== 'undefined' && !('credentials' in initCopy)) {
    initCopy.credentials = 'include'
  }

  initCopy.headers = headers
  return fetch(input, initCopy)
}

// 只需要把自定义 fetch 传给 libseymour，库会自动去 /token 获取 T（用于 POST）
const API = new Reader({
  url: 'https://www.example.com/api/greader',
  fetch: seymourFetch,
})

export default API

// 使用示例：
// import API, { setBasicAuth } from './libseymour-api'
// setBasicAuth('youruser', 'yourpass')   // 在 Node 或需要 Basic Auth 时调用
// // 或 在浏览器不调用 setBasicAuth，登录后直接使用（会用 cookie）