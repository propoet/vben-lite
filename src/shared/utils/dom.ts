/**
 * 可见区域矩形信息接口
 * 用于描述元素在视口中可见部分的边界框信息
 */

export interface VisibleDomRect {
  /** 可见区域底部边界（相对于视口顶部的距离，单位：像素） */
  bottom: number
  /** 可见区域的高度（单位：像素） */
  height: number
  /** 可见区域左边界（相对于视口左边的距离，单位：像素） */
  left: number
  /** 可见区域右边界（相对于视口左边的距离，单位：像素） */
  right: number
  /** 可见区域顶部边界（相对于视口顶部的距离，单位：像素） */
  top: number
  /** 可见区域的宽度（单位：像素） */
  width: number
}

/**
 * 获取元素在视口中的可见区域信息
 * 计算元素与视口（viewport）的交集部分，返回可见区域的边界框
 *
 * @param element - 要获取可见信息的 DOM 元素，可以是 null 或 undefined
 * @returns 返回元素可见区域的矩形信息，如果元素不存在则返回全零对象
 */
export function getElementVisibleRect(element?: HTMLElement | null | undefined): VisibleDomRect {
  // 如果元素不存在，返回全零的默认值
  if (!element) {
    return {
      bottom: 0, // 底部边界为 0
      height: 0, // 高度为 0
      left: 0, // 左边界为 0
      right: 0, // 右边界为 0
      top: 0, // 顶部边界为 0
      width: 0 // 宽度为 0
    }
  }
  // 获取元素相对于视口的位置和尺寸信息
  // getBoundingClientRect() 返回元素相对于视口的完整边界框
  const rect = element.getBoundingClientRect()

  // 计算视口的高度
  // 使用 Math.max 确保获取到最大的视口高度值
  // document.documentElement.clientHeight: 文档根元素（html）的客户端高度（不包含滚动条）
  // window.innerHeight: 浏览器窗口的内部高度（包含滚动条）
  const viewHeight = Math.max(
    document.documentElement.clientHeight, // 文档根元素的客户端高度
    window.innerHeight // 窗口内部高度
  )

  // 计算可见区域的顶部边界
  // Math.max(rect.top, 0) 确保顶部边界不小于 0（元素在视口上方时，可见部分从视口顶部开始）
  const top = Math.max(rect.top, 0)

  // 计算可见区域的底部边界
  // Math.min(rect.bottom, viewHeight) 确保底部边界不超过视口高度（元素在视口下方时，可见部分到视口底部结束）
  const bottom = Math.min(rect.bottom, viewHeight)

  // 计算视口的宽度
  // 使用 Math.max 确保获取到最大的视口宽度值
  // document.documentElement.clientWidth: 文档根元素的客户端宽度（不包含滚动条）
  // window.innerWidth: 浏览器窗口的内部宽度（包含滚动条）
  const viewWidth = Math.max(
    document.documentElement.clientWidth, // 文档根元素的客户端宽度
    window.innerWidth // 窗口内部宽度
  )

  // 计算可见区域的左边界
  // Math.max(rect.left, 0) 确保左边界不小于 0（元素在视口左侧时，可见部分从视口左边开始）
  const left = Math.max(rect.left, 0)

  // 计算可见区域的右边界
  // Math.min(rect.right, viewWidth) 确保右边界不超过视口宽度（元素在视口右侧时，可见部分到视口右边结束）
  const right = Math.min(rect.right, viewWidth)

  // 返回计算得到的可见区域信息
  return {
    bottom, // 可见区域底部边界
    height: Math.max(0, bottom - top), // 可见区域高度（确保不为负数）
    left, // 可见区域左边界
    right, // 可见区域右边界
    top, // 可见区域顶部边界
    width: Math.max(0, right - left) // 可见区域宽度（确保不为负数）
  }
}

/**
 * 获取浏览器滚动条的宽度
 * 通过创建一个隐藏的滚动容器来测量滚动条的宽度
 *
 * @returns 返回滚动条的宽度（单位：像素），如果浏览器不支持则返回 0
 */
export function getScrollbarWidth() {
  // 创建一个临时的 div 元素用于测量滚动条宽度
  const scrollDiv = document.createElement('div')

  // 设置滚动容器的样式，使其不可见但存在
  scrollDiv.style.visibility = 'hidden' // 隐藏元素但保留其布局空间
  scrollDiv.style.overflow = 'scroll' // 强制显示滚动条（即使内容不需要滚动）
  scrollDiv.style.position = 'absolute' // 绝对定位，不影响页面布局
  scrollDiv.style.top = '-9999px' // 将元素移到视口外，完全不可见

  // 将滚动容器添加到页面 body 中，使其能够计算滚动条宽度
  document.body.append(scrollDiv)

  // 在滚动容器内创建一个内部 div 元素
  // 这个内部 div 的宽度将不包含滚动条，用于计算滚动条宽度
  const innerDiv = document.createElement('div')
  scrollDiv.append(innerDiv)

  // 计算滚动条宽度
  // scrollDiv.offsetWidth: 滚动容器的总宽度（包含滚动条）
  // innerDiv.offsetWidth: 内部 div 的宽度（不包含滚动条）
  // 两者相减即为滚动条的宽度
  const scrollbarWidth = scrollDiv.offsetWidth - innerDiv.offsetWidth

  // 移除临时创建的滚动容器，清理 DOM
  scrollDiv.remove()

  // 返回计算得到的滚动条宽度
  return scrollbarWidth
}

/**
 * 判断页面是否需要显示滚动条
 * 检查页面内容高度是否超过视口高度，从而判断是否需要滚动条
 *
 * @returns 如果页面需要滚动条返回 true，否则返回 false
 */
export function needsScrollbar() {
  // 获取文档根元素（html 元素）
  const doc = document.documentElement
  // 获取 body 元素
  const body = document.body

  // 检查 body 元素的 overflow-y CSS 样式属性
  // getComputedStyle 获取元素计算后的样式（包括继承和应用的样式）
  const overflowY = window.getComputedStyle(body).overflowY

  // 如果 body 的 overflow-y 样式明确设置为 'scroll' 或 'auto'
  // 说明可能需要滚动条，进一步检查内容高度
  if (overflowY === 'scroll' || overflowY === 'auto') {
    // 比较文档总高度（scrollHeight）和窗口内部高度（innerHeight）
    // 如果文档高度大于窗口高度，则需要滚动条
    return doc.scrollHeight > window.innerHeight
  }

  // 在其他情况下（overflow-y 为 'hidden' 或 'visible' 等）
  // 同样根据文档总高度和窗口内部高度比较判断是否需要滚动条
  return doc.scrollHeight > window.innerHeight
}

/**
 * 手动触发 window 的 resize 事件
 * 用于在某些情况下需要强制触发窗口大小变化事件，例如：
 * - 动态改变布局后需要重新计算尺寸
 * - 某些组件需要响应 resize 事件但实际窗口大小未改变
 *
 * @returns 无返回值（void）
 */
export function triggerWindowResize(): void {
  // 创建一个新的 resize 事件对象
  // Event 构造函数创建一个原生 DOM 事件
  const resizeEvent = new Event('resize')

  // 在 window 对象上派发（触发）resize 事件
  // dispatchEvent 方法会触发所有监听该事件的处理器
  window.dispatchEvent(resizeEvent)
}
