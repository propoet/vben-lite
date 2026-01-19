import { getColors } from 'theme-colors';
import { convertToHslCssVar, TinyColor } from './convert';

interface ColorItem {
  /** 颜色别名 */
  alias?: string;
  /** 颜色值 */
  color: string;
  /** 颜色名称 */
  name: string;
}

/**
 * 
 * @param colorItems 颜色项列表
 * @returns 颜色变量对象
 */

function generatorColorVariables(colorItems: ColorItem[]) {
  const colorVariables: Record<string, string> = {};

  colorItems.forEach(({ alias, color, name }) => {

    if (color) {
      // 获取颜色映射
      const colorsMap = getColors(new TinyColor(color).toHexString());
      // 获取主颜色
      let mainColor = colorsMap['500'];
      // 获取颜色键
      const colorKeys = Object.keys(colorsMap);
      // 遍历颜色键
      colorKeys.forEach((key) => {
        // 获取颜色值
        const colorValue = colorsMap[key];

        if (colorValue) {
          // 转换为HSL颜色
          const hslColor = convertToHslCssVar(colorValue);
          // 设置颜色变量
          colorVariables[`--${name}-${key}`] = hslColor;
          // 设置别名颜色变量
          if (alias) {
            colorVariables[`--${alias}-${key}`] = hslColor;
          }

          // 设置主颜色
          if (key === '500') {
            mainColor = hslColor;
          }
        }
      });
      // 设置别名主颜色
      if (alias && mainColor) {
        colorVariables[`--${alias}`] = mainColor;
      }
    }
  });
  return colorVariables;
}
export { generatorColorVariables };