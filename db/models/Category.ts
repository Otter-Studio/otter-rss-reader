/**
 * 分类模型 - 用于组织 Feed 和 Item
 */

import { IBaseEntity } from './types';

/**
 * 分类实体接口
 */
export interface ICategory extends IBaseEntity {
  /** 分类名称 */
  name: string;

  /** 分类描述 */
  description?: string;

  /** 分类图标 URL */
  iconUrl?: string;

  /** 分类颜色（十六进制）*/
  color?: string;

  /** 分类顺序 */
  order?: number;

  /** 父分类 ID（用于子分类场景）*/
  parentId?: string;

  /** 是否活跃 */
  isActive: boolean;
}
