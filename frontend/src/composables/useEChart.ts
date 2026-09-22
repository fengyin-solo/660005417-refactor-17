import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts'

type ChartOption = Parameters<echarts.ECharts['setOption']>[0]

/** 三个图表面板共用的渲染骨架：初始化、空态守卫、随结果刷新、销毁。 */
export function useEChart(result: Ref<unknown>, buildOption: () => ChartOption) {
  const chart = ref<HTMLDivElement>()
  let inst: echarts.ECharts | null = null
  function update() {
    if (!inst || !result.value) return
    inst.setOption(buildOption())
  }
  onMounted(() => { if (chart.value) { inst = echarts.init(chart.value); update() } })
  watch(result, update)
  onUnmounted(() => inst?.dispose())
  return { chart }
}
