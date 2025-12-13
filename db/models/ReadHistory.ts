/**
 * ReadHistory 模型 - 阅读历史
 */

import { IBaseEntity } from './types';

/**
 * 阅读历史实体接口
 */
export interface IReadHistory extends IBaseEntity {
  /** 文章 ID */
  itemId: string;

  /** 文章标题 */
  itemTitle: string;

  /** Feed 标题 */
  feedTitle?: string;

  /** 文章链接 */
  itemLink?: string;

  /** 阅读开始时间戳 */
  readStartTime: number;

  /** 阅读结束时间戳 */
  readEndTime: number;

  /** 阅读时长（秒）*/
  timeSpent: number;

  /** 阅读滚动位置百分比（0-100）*/
  scrollPosition: number;

  /** 是否完全阅读 */
  fullyRead: boolean;

  /** 用户评分（1-5）*/
  rating?: number;

  /** 用户备注 */
  notes?: string;

  /** 设备类型（web, mobile, tablet）*/
  deviceType?: string;

  /** 阅读器使用时长（毫秒）*/
  viewportTime?: number;
}
