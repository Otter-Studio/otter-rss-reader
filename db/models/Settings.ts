/**
 * Settings 模型 - 用户设置
 */

import { IBaseEntity, ThemeType } from './types';

/**
 * Settings 实体接口
 */
export interface ISettings extends IBaseEntity {
  /** RSS 服务器基础 URL */
  baseUrl?: string;

  /** RSS 服务器用户名 */
  username?: string;

  /** RSS 服务器密码 */
  password?: string;

  /** 应用主题 */
  theme: ThemeType;

  /** 自动刷新间隔（秒，0 表示禁用）*/
  refreshInterval: number;

  /** 每页显示的文章数 */
  articlesPerPage: number;

  /** 应用语言 */
  language: string;

  /** 是否自动标记为已读 */
  autoMarkAsRead: boolean;

  /** 自动标记延迟（毫秒）*/
  autoMarkAsReadDelay?: number;

  /** 是否启用通知 */
  notificationsEnabled: boolean;

  /** 是否启用声音通知 */
  soundNotificationEnabled: boolean;

  /** 是否启用震动通知 */
  vibrationEnabled: boolean;

  /** 最后同步时间戳 */
  lastSyncTime?: number;

  /** 是否启用离线模式 */
  offlineModeEnabled: boolean;

  /** 缓存项目数量限制 */
  cacheItemLimit?: number;

  /** 是否压缩存储 */
  compressionEnabled: boolean;

  /** 首选字体大小（相对值，0.8-1.2）*/
  fontSizeMultiplier?: number;

  /** 首选行高倍数 */
  lineHeightMultiplier?: number;

  /** 是否启用深色阅读模式 */
  readingModeEnabled: boolean;

  /** 自定义背景颜色 */
  backgroundColor?: string;

  /** 自定义文字颜色 */
  textColor?: string;
}
