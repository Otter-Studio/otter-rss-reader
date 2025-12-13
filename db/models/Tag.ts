/**
 * 标签模型 - 用于标记和分类 Item
 */

import { IBaseEntity } from './types';

/**
 * 标签实体接口
 */
export interface ITag extends IBaseEntity {
  /** 标签名称 */
  name: string;

  /** 标签描述 */
  description?: string;

  /** 标签颜色（十六进制）*/
  color?: string;

  /** 标签图标 */
  iconUrl?: string;

  /** 标签顺序 */
  order?: number;

  /** 是否为系统标签 */
  isSystem: boolean;

  /** 是否活跃 */
  isActive: boolean;
}
