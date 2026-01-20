import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

type FormatDate = Date | dayjs.Dayjs | number | string

type Format =
  | 'HH'
  | 'HH:mm'
  | 'HH:mm:ss'
  | 'YYYY'
  | 'YYYY-MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD HH'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH:mm:ss'
  | (string & {})

/**
 * 格式化日期
 * @param time 日期
 * @param format 格式
 * @returns 格式化后的日期
 */
export function formatDate(time?: FormatDate, format: Format = 'YYYY-MM-DD') {
  try {
    const date = dayjs.isDayjs(time) ? time : dayjs(time)
    if (!date.isValid()) {
      throw new Error('Invalid date')
    }
    //  date.tz() 默认时区 ,  tz timezone 格式化日期
    return date.tz().format(format)
  } catch (error) {
    console.error(`Error formatting date: ${error}`)
    return String(time ?? '')
  }
}

/**
 * 格式化日期时间
 * @param time 日期时间
 * @returns 格式化后的日期时间
 */
export function formatDateTime(time?: FormatDate) {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss')
}
/**
 * 判断是否为日期
 * @param value 值
 * @returns 是否为日期
 */
export function isDate(value: any): value is Date {
  return value instanceof Date
}

/**
 * 判断是否为dayjs对象
 * @param value 值
 * @returns 是否为dayjs对象
 */
export function isDayjsObject(value: any): value is dayjs.Dayjs {
  return dayjs.isDayjs(value)
}

/**
 * 获取当前时区
 * @returns 当前时区
 */
export const getSystemTimezone = () => {
  return dayjs.tz.guess()
}

/**
 * 自定义设置的时区
 */
let currentTimezone = getSystemTimezone()

/**
 * 设置默认时区
 * @param timezone
 */
export const setCurrentTimezone = (timezone?: string) => {
  currentTimezone = timezone || getSystemTimezone()
  dayjs.tz.setDefault(currentTimezone)
}

/**
 * 获取设置的时区
 * @returns 设置的时区
 */
export const getCurrentTimezone = () => {
  return currentTimezone
}
