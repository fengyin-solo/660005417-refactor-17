import { computed } from 'vue'
import { useLogStore } from '../store/log'
import type { LogEntry } from '../types'

export interface LogColumn {
  prop: keyof LogEntry
  label: string
  width?: string
  isLevel?: boolean
  showOverflowTooltip?: boolean
}

/** 日志表格列定义：字段映射与列宽的唯一来源 */
export const LOG_COLUMNS: LogColumn[] = [
  { prop: 'id', label: '#', width: '50' },
  { prop: 'timestamp', label: '时间', width: '150' },
  { prop: 'level', label: '级别', width: '70', isLevel: true },
  { prop: 'source', label: '来源', width: '120' },
  { prop: 'message', label: '消息', showOverflowTooltip: true }
]

/** 热力图纵轴级别顺序 */
export const HEAT_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG']

export function levelTagType(level: string): 'danger' | 'warning' | 'info' {
  return level === 'ERROR' || level === 'error' ? 'danger' : level === 'WARN' || level === 'warn' ? 'warning' : 'info'
}

/**
 * 分析结果的唯一读取入口：表格与三个面板都从这里取数，
 * 接口返回字段（logs/windows/anomalies/alerts/totalLogs）只在本文件内被引用。
 */
export function useAnalysis() {
  const store = useLogStore()
  const result = computed(() => store.result)

  // —— 日志表格 ——
  const logs = computed<LogEntry[]>(() => result.value?.logs || [])
  const totalLogs = computed(() => result.value?.totalLogs || 0)

  // —— 告警面板 ——
  const alerts = computed(() => result.value?.alerts || [])
  const hasAlerts = computed(() => alerts.value.length > 0)
  const visibleAlerts = computed(() => alerts.value.slice(0, 8))

  // —— 异常分数面板 ——
  const anomalies = computed(() => result.value?.anomalies || [])
  const anomalyLabels = computed(() => anomalies.value.map(a => 'W' + a.windowIndex))
  const sigmaScores = computed(() => anomalies.value.map(a => a.sigmaScore))
  const iqrScores = computed(() => anomalies.value.map(a => a.iqrScore))

  // —— 趋势面板 ——
  const windows = computed(() => result.value?.windows || [])
  const windowLabels = computed(() => windows.value.map((_, i) => 'W' + i))
  const windowCounts = computed(() => windows.value.map(w => w.count))

  // —— 热力图面板 ——
  const heatmapData = computed<[number, number, number][]>(() => {
    const data: [number, number, number][] = []
    windows.value.forEach((w, i) => {
      HEAT_LEVELS.forEach((lv, j) => { data.push([i, j, w.levels[lv] || 0]) })
    })
    return data
  })
  const heatmapMax = computed(() => Math.max(...heatmapData.value.map(d => d[2]), 1))

  return {
    result,
    logs, totalLogs, logColumns: LOG_COLUMNS,
    alerts, hasAlerts, visibleAlerts,
    anomalies, anomalyLabels, sigmaScores, iqrScores,
    windows, windowLabels, windowCounts,
    heatLevels: HEAT_LEVELS, heatmapData, heatmapMax
  }
}
