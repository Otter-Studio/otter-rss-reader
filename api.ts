import Reader, { IConfig } from 'libseymour'
import { SettingsOperations } from '@/db/settings'

/**
 * 为 libseymour 的 getAuthToken 创建兼容性包装
 * 解决移动端与 PC 端的差异
 */
async function getAuthTokenCompat(
  baseUrl: string,
  username: string,
  password: string
): Promise<string> {
  const authUrl = baseUrl.replace(/\/+$/, '') + '/accounts/ClientLogin'

  console.log('[API] Requesting auth token from:', authUrl)

  // 使用标准 fetch 而不是依赖 libseymour 的实现
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      Email: username,
      Passwd: password,
    }).toString(),
  })

  const responseText = await response.text()

  if (!response.ok) {
    console.error('[API] Auth failed with status:', response.status)
    console.error('[API] Response body:', responseText)
    throw new Error(`HTTP ${response.status}: ${responseText}`)
  }

  // 解析响应
  const lines = responseText.split('\n')
  const authLine = lines.find(line => line.startsWith('Auth='))

  if (!authLine) {
    throw new Error('No Auth token in response')
  }

  const token = authLine.replace('Auth=', '')
  console.log('[API] Auth token obtained successfully')

  return token
}

class APIClient {
  private static instance: APIClient | null = null
  private reader: Reader | null = null
  private initializing: Promise<Reader> | null = null
  private lastError: Error | null = null

  private constructor() { }

  /**
   * 获取单例实例
   */
  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient()
    }
    return APIClient.instance
  }

  /**
   * 初始化 API 客户端
   */
  public async initialize(): Promise<Reader> {
    // 如果已经初始化完成，直接返回
    if (this.reader) {
      return this.reader
    }

    // 如果正在初始化中，返回正在进行的 Promise
    if (this.initializing) {
      return this.initializing
    }

    // 开始初始化
    this.initializing = this.performInitialization()
    try {
      this.reader = await this.initializing
      this.lastError = null
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error(String(error))
      this.initializing = null
      throw error
    }

    this.initializing = null
    return this.reader
  }

  /**
   * 执行实际的初始化逻辑
   */
  private async performInitialization(): Promise<Reader> {
    try {
      const userInfo = await SettingsOperations.getUserInfo()

      if (!userInfo || !userInfo.baseUrl) {
        throw new Error('baseUrl not configured in settings')
      }

      if (!userInfo.username || !userInfo.password) {
        throw new Error('username or password not configured in settings')
      }

      // 确保 URL 有协议前缀，并清理空格和末尾斜杠
      let baseUrl = userInfo.baseUrl.trim()
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = 'http://' + baseUrl
      }
      // 移除末尾的所有斜杠
      baseUrl = baseUrl.replace(/\/+$/, '')

      console.log('[API] Initializing with URL:', baseUrl)

      const config: IConfig = {
        url: baseUrl,
      }

      const reader = new Reader(config)

      try {
        // 使用兼容性包装获取认证令牌
        const token = await getAuthTokenCompat(baseUrl, userInfo.username, userInfo.password)
        reader.setAuthToken(token)
        console.log('[API] Authentication successful')
      } catch (error) {
        console.error('[API] Authentication failed:', error)
        throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`)
      }

      return reader
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[API] Initialization failed:', errorMsg)
      throw error
    }
  }

  /**
   * 获取 Reader 实例（如果未初始化则自动初始化）
   */
  public async getReader(): Promise<Reader> {
    if (!this.reader) {
      return await this.initialize()
    }
    return this.reader
  }

  /**
   * 同步获取 Reader 实例（必须已初始化）
   */
  public getReaderSync(): Reader {
    if (!this.reader) {
      throw new Error('API not initialized. Call initialize() or getReader() first.')
    }
    return this.reader
  }

  /**
   * 获取最后一次错误
   */
  public getLastError(): Error | null {
    return this.lastError
  }

  /**
   * 检查是否已初始化
   */
  public isInitialized(): boolean {
    return this.reader !== null
  }

  /**
   * 重置单例
   */
  public reset(): void {
    this.reader = null
    this.initializing = null
    this.lastError = null
    console.log('[API] Reset')
  }
}

/**
 * 获取 API 客户端单例实例
 */
export const apiClient = APIClient.getInstance()

/**
 * 初始化 API（推荐在 app 启动时调用）
 */
export async function initializeAPI(): Promise<Reader> {
  return apiClient.initialize()
}

/**
 * 获取 Reader 实例（如果未初始化则自动初始化）
 */
export async function getReader(): Promise<Reader> {
  return apiClient.getReader()
}

/**
 * 同步获取 Reader 实例（必须已初始化）
 */
export function getReaderSync(): Reader {
  return apiClient.getReaderSync()
}

/**
 * 检查 API 是否已初始化
 */
export function isAPIInitialized(): boolean {
  return apiClient.isInitialized()
}

/**
 * 获取最后一次初始化错误
 */
export function getAPIError(): Error | null {
  return apiClient.getLastError()
}

/**
 * 重置 API
 */
export function resetAPI(): void {
  apiClient.reset()
}

export default apiClient