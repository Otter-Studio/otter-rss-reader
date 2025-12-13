/**
 * Settings 仓库接口
 */

import { ISettings } from '../models';

/**
 * Settings 仓库接口 - 定义所有 Settings 相关的数据库操作
 */
export interface ISettingsRepository {
  /**
   * 获取设置（通常只有一条记录）
   */
  get(): Promise<ISettings | null>;

  /**
   * 保存或更新设置
   */
  save(settings: ISettings): Promise<ISettings>;

  /**
   * 更新特定设置字段
   */
  update(data: Partial<ISettings>): Promise<ISettings>;

  /**
   * 重置为默认设置
   */
  reset(): Promise<ISettings>;

  /**
   * 检查设置是否存在
   */
  exists(): Promise<boolean>;
}
