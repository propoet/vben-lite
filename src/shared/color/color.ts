import { TinyColor } from '@ctrl/tinycolor'

// 相对亮度和 0.5比较

export function isDarkColor(color: string) {
  return new TinyColor(color).isDark()
}
export function isLightColor(color: string) {
  return new TinyColor(color).isLight()
}
