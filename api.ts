import Reader from 'libseymour'
import { SettingsOperations } from '@/db/settings'

let authHeader: string | null = null
let API: Reader | null = null

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

/**
 * 从设置中初始化 API 配置
 * 获取 baseUrl、username 和 password 并设置到 API
 */
export async function initializeAPIFromSettings(): Promise<Reader> {
  try {
    const userInfo = await SettingsOperations.getUserInfo()
    
    if (!userInfo || !userInfo.baseUrl) {
      throw new Error('baseUrl not configured in settings')
    }

    // 如果有用户名和密码，设置 Basic Auth
    if (userInfo.username && userInfo.password) {
      setBasicAuth(userInfo.username, userInfo.password)
    }

    // 创建 API 实例
    API = new Reader({
      url: userInfo.baseUrl,
      // libseymour's IConfig type doesn't include 'fetch', so assert to any to allow a custom fetch
      fetch: seymourFetch,
    } as any)

    return API
  } catch (error) {
    console.error('Failed to initialize API from settings:', error)
    throw error
  }
}

/**
 * 获取 API 实例，如果未初始化则先初始化
 */
export async function getAPI(): Promise<Reader> {
  if (!API) {
    return await initializeAPIFromSettings()
  }
  return API
}

/**
 * 使用自定义配置初始化 API
 */
export async function initializeAPIWithConfig(baseUrl: string, username: string, password: string): Promise<Reader> {
  setBasicAuth(username, password)
  
  API = new Reader({
    url: baseUrl,
    fetch: seymourFetch,
  } as any)

  return API
}

// 导出默认的 API（兼容旧代码）
export default API