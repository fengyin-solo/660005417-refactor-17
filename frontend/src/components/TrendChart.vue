<template>
  <div class="panel"><h4>📉 窗口日志量趋势</h4><div ref="chart" class="chart"></div></div>
</template>
<script setup lang="ts">
import { useAnalysis } from '../composables/useAnalysis'
import { useEChart } from '../composables/useEChart'
const a = useAnalysis()
const { chart } = useEChart(a.result, () => ({
  backgroundColor:'transparent',grid:{left:40,right:15,top:10,bottom:25},
  xAxis:{type:'category',data:a.windowLabels.value,axisLabel:{color:'#94a3b8',fontSize:9}},
  yAxis:{type:'value',axisLabel:{color:'#94a3b8'}},
  series:[{
    type:'bar',data:a.windowCounts.value,itemStyle:{color:'#38bdf8'},
    markLine:{data:[{type:'average',name:'avg'}],lineStyle:{color:'#f97316',type:'dashed'},label:{color:'#f97316'}}
  }],animation:false
}))
</script>
<style scoped>.panel{background:#1e293b;border-radius:8px;padding:12px;border:1px solid #334155}.panel h4{color:#38bdf8;font-size:13px;margin-bottom:4px}.chart{width:100%;height:200px}</style>