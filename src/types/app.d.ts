/**
 * 时区选项接口
 * 用于时区选择器，包含时区名称、偏移量和显示标签
 */
interface TimezoneOption {
  label: string;
  offset: number;
  timezone: string;
}

export type { TimezoneOption };
