/**
 * 格式化工具类
 * 提供日期、金额、数字等格式化功能
 */

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化日期范围
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 格式化后的日期范围字符串
 */
export function formatDateRange(startDate: Date | string | number, endDate: Date | string | number): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 如果是同一天
  if (start.toDateString() === end.toDateString()) {
    return formatDate(start, 'YYYY年MM月DD日');
  }
  
  // 如果是同年同月
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${formatDate(start, 'YYYY年MM月DD日')} - ${end.getDate()}日`;
  }
  
  // 如果是同年
  if (start.getFullYear() === end.getFullYear()) {
    return `${formatDate(start, 'YYYY年MM月DD日')} - ${formatDate(end, 'MM月DD日')}`;
  }
  
  // 不同年
  return `${formatDate(start, 'YYYY年MM月DD日')} - ${formatDate(end, 'YYYY年MM月DD日')}`;
}

/**
 * 计算两个日期之间的天数差
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数差
 */
export function getDaysBetween(startDate: Date | string | number, endDate: Date | string | number): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * 格式化货币
 * @param value 金额
 * @param currency 货币符号，默认 '¥'
 * @param decimals 小数位数，默认 2
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number, currency: string = '¥', decimals: number = 2): string {
  const formatter = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${currency}${formatter.format(value)}`;
}

/**
 * 格式化大数字（如转换为千、万等单位）
 * @param value 数值
 * @param decimals 小数位数，默认 1
 * @returns 格式化后的数字字符串
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
  if (value < 1000) {
    return value.toString();
  } else if (value < 10000) {
    return `${(value / 1000).toFixed(decimals)}k`;
  } else if (value < 100000000) {
    return `${(value / 10000).toFixed(decimals)}万`;
  } else {
    return `${(value / 100000000).toFixed(decimals)}亿`;
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化手机号（中间四位显示为星号）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone || phone.length !== 11) return phone || '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 格式化邮箱（部分字符显示为星号）
 * @param email 邮箱
 * @returns 格式化后的邮箱
 */
export function formatEmail(email: string | undefined): string {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const username = parts[0];
  const domain = parts[1];
  
  if (!username) return email;
  
  // 显示用户名的前两个字符和后一个字符
  const first = username.charAt(0);
  const last = username.charAt(username.length - 1);
  
  if (username.length <= 3) {
    return `${first}***@${domain}`;
  }
  
  return `${first}***${last}@${domain}`;
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间的小数）
 * @param decimals 小数位数，默认 0
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化距离
 * @param meters 米数
 * @returns 格式化后的距离字符串
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} 米`;
  }
  return `${(meters / 1000).toFixed(1)} 公里`;
}

/**
 * 格式化持续时间（秒转换为时分秒）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${remainingSeconds}秒`;
  } else {
    return `${remainingSeconds}秒`;
  }
}

/**
 * 格式化时间戳为相对时间
 * @param timestamp 时间戳
 * @returns 相对时间字符串（如：刚刚、5分钟前、2小时前、3天前等）
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const diff = now - date;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
}