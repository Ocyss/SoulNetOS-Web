import dayjs from 'dayjs'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

dayjs.extend(isLeapYear)
dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.locale('zh-cn')

export default dayjs
