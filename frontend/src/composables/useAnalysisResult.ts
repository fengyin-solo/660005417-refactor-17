import { computed, type ComputedRef } from 'vue'
import { useLogStore } from '@/store/log'
import type { Alert, AnalysisResult, AnomalyScore, LogEntry, TimeWindow } from '@/types'

/**
 * 日志异常检测结果的唯一读取/呈现层：
 * 表格与各面板只从这里取值，不再各自读取 store.result、各自写字段映射与空态分支。
 * 后端 /api/generate、/api/detect 返回的字段（AnalysisResult）也只在此处访问。
 */

// 表格列定义：列宽与原模板逐列保持一致，message 列不设宽度（自适应）
export interface LogColumn {
  prop: 'id' | 'timestamp' | 'level' | 'source' | 'message'
  label: string
  width?: number
  overflow?: boolean
}
export const LOG_COLUMNS: readonly LogColumn[] = [
  { prop: 'id', label: '#', width: 50 },
  { prop: 'timestamp', label: '时间', width: 150 },
  { prop: 'level', label: '级别', width: 70 },
  { prop: 'source', label: '来源', width: 120 },
  { prop: 'message', label: '消息', overflow: true }
]

// level 文本 -> el-tag 类型（集中原先写在 LogTable 模板里的判断）
export function levelTagType(level: string): 'danger' | 'warning' | 'info' {
  return level === 'ERROR' || level === 'error'
    ? 'danger'
    : level === 'WARN' || level === 'warn'
      ? 'warning'
      : 'info'
}

// 热力图展示的级别顺序
export const HEAT_LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG'] as const

// 面板最多展示的告警条数（原 AlertPanel 中写死的 slice(0,8)）
export const MAX_VISIBLE_ALERTS = 8

const windowLabel = (i: number) => 'W' + i

// 告警展示行：集中 severity 等字段到界面文案的映射
export interface AlertRow {
  id: number
  ruleName: string
  severity: string
  severityLabel: string
  message: string
  timestamp: string
}

export function useAnalysisResult() {
  const store = useLogStore()

  const result: ComputedRef<AnalysisResult | null> = computed(() => store.result)
  // 唯一的空态判定，各面板共用
  const hasResult = computed(() => store.result !== null)

  // —— 表格 ——
  const totalLogs = computed(() => store.result?.totalLogs ?? 0)
  const logs = computed<readonly LogEntry[]>(() => store.result?.logs ?? [])

  // —— 异常分数面板（横轴取 anomaly.windowIndex）——
  const anomalies = computed<readonly AnomalyScore[]>(() => store.result?.anomalies ?? [])
  const anomalyLabels = computed(() => anomalies.value.map(a => 'W' + a.windowIndex))
  const sigmaSeries = computed(() => anomalies.value.map(a => a.sigmaScore))
  const iqrSeries = computed(() => anomalies.value.map(a => a.iqrScore))

  // —— 窗口趋势 / 热力图面板（横轴取窗口下标）——
  const windows = computed<readonly TimeWindow[]>(() => store.result?.windows ?? [])
  const windowLabels = computed(() => windows.value.map((_, i) => windowLabel(i)))
  const windowCounts = computed(() => windows.value.map(w => w.count))
  const heatData = computed<[number, number, number][]>(() => {
    const data: [number, number, number][] = []
    windows.value.forEach((w, i) => {
      HEAT_LEVELS.forEach((lv, j) => { data.push([i, j, w.levels[lv] ?? 0]) })
    })
    return data
  })
  const heatMax = computed(() => Math.max(...heatData.value.map(d => d[2]), 1))

  // —— 告警面板 ——
  const alerts = computed<readonly Alert[]>(() => store.result?.alerts ?? [])
  const hasAlerts = computed(() => alerts.value.length > 0)
  const alertRows = computed<AlertRow[]>(() =>
    alerts.value.slice(0, MAX_VISIBLE_ALERTS).map(a => ({
      id: a.id,
      ruleName: a.ruleName,
      severity: a.severity,
      severityLabel: a.severity.toUpperCase(),
      message: a.message,
      timestamp: a.timestamp
    }))
  )

  return {
    result,
    hasResult,
    // 表格
    totalLogs,
    logs,
    // 异常分数
    anomalies,
    anomalyLabels,
    sigmaSeries,
    iqrSeries,
    // 趋势 / 热力图
    windows,
    windowLabels,
    windowCounts,
    heatData,
    heatMax,
    // 告警
    alerts,
    hasAlerts,
    alertRows
  }
}
