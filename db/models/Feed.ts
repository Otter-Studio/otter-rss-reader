/**
 * Feed 模型 - RSS 源
 */

import { IBaseEntity } from './types';
import { ICategory } from './Category';

/**
 * Feed 实体接口
 */
export interface IFeed extends IBaseEntity {
  /** Feed 标题 */
  title: string;

  /** Feed 描述 */
  description?: string;

  /** RSS 源 URL */
  url: string;

  /** 源网站链接 */
  htmlUrl?: string;

  /** 源图标/图片 URL */
  iconUrl?: string;

  /** Feed 作者 */
  author?: string;

  /** 语言代码（如 zh-CN, en-US）*/
  language?: string;

  /** 最后更新时间戳 */
  lastUpdated?: number;

  /** 最后错误信息 */
  lastError?: string;

  /** 失败重试次数 */
  failureCount?: number;

  /** 是否活跃（用于启用/禁用订阅）*/
  isActive: boolean;

  /** 关联的分类 */
  categories?: ICategory[];

  /** 分类 ID 列表（用于存储关联）*/
  categoryIds?: string[];

  /** 用户自定义标题 */
  customTitle?: string;

  /** Feed 的项目总数 */
  itemCount?: number;

  /** 未读项目数 */
  unreadCount?: number;
}
