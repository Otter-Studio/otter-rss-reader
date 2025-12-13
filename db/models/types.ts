/**
 * Otter RSS Reader - DB 类型定义层
 * 
 * 定义所有 ORM 模型使用的基础类型和枚举
 */

// ==================== 枚举 ====================

/**
 * 应用主题
 */
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * 项目的阅读状态
 */
export enum ItemStatus {
  UNREAD = 'unread',
  READ = 'read',
  STARRED = 'starred',
  ARCHIVED = 'archived',
}

// ==================== 基础接口 ====================

/**
 * 基础实体接口 - 所有实体都应继承这个接口
 */
export interface IBaseEntity {
  /** 唯一标识 */
  id: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 分页参数
 */
export interface IPaginationParams {
  /** 页码，从 1 开始 */
  page: number;
  /** 每页大小 */
  pageSize: number;
}

/**
 * 分页结果
 */
export interface IPaginatedResult<T> {
  /** 数据列表 */
  items: T[];
  /** 总数 */
  total: number;
  /** 页码 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 批量操作结果
 */
export interface IBatchOperationResult<T> {
  /** 成功的项 */
  success: T[];
  /** 失败的项及其错误 */
  failed: Array<{ item: T; error: string }>;
}
