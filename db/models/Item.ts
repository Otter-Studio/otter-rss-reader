/**
 * Item 模型 - RSS 文章/项目
 */

import { IBaseEntity } from './types';
import { IFeed } from './Feed';
import { ICategory } from './Category';
import { ITag } from './Tag';

/**
 * Item 实体接口
 */
export interface IItem extends IBaseEntity {
  /** 文章标题 */
  title: string;

  /** 文章摘要 */
  summary?: string;

  /** 文章完整内容 */
  content?: string;

  /** 文章作者 */
  author?: string;

  /** 文章链接 */
  link: string;

  /** 文章原文网站链接 */
  htmlUrl?: string;

  /** 文章图片 URL */
  image?: string;

  /** 文章发布时间戳 */
  published?: number;

  /** 文章爬取时间戳 */
  crawlTime?: number;

  /** 关联的 Feed ID */
  feedId: string;

  /** 关联的 Feed 对象 */
  feed?: IFeed;

  /** 关联的分类 */
  categories?: ICategory[];

  /** 分类 ID 列表 */
  categoryIds?: string[];

  /** 关联的标签 */
  tags?: ITag[];

  /** 标签 ID 列表 */
  tagIds?: string[];

  /** 是否已读 */
  isRead: boolean;

  /** 是否已星标 */
  isStarred: boolean;

  /** 是否已归档 */
  isArchived: boolean;

  /** 阅读时长（秒）*/
  readingTime?: number;

  /** 用户评分（1-5）*/
  rating?: number;

  /** 用户备注 */
  notes?: string;

  /** 最后阅读位置（0-100）*/
  scrollPosition?: number;
}
