<template>
  <div class="panel"><h4>🔥 日志级别热力图</h4><div ref="chart" class="chart"></div></div>
</template>
<script setup lang="ts">
import { useAnalysis } from '../composables/useAnalysis'
import { useEChart } from '../composables/useEChart'
const a = useAnalysis()
const { chart } = useEChart(a.result, () => ({
  backgroundColor:'transparent',grid:{left:60,right:15,top:5,bottom:25},
  xAxis:{type:'category',data:a.windowLabels.value,axisLabel:{color:'#94a3b8',fontSize:8}},
  yAxis:{type:'category',data:a.heatLevels,axisLabel:{color:'#94a3b8',fontSize:9}},
  visualMap:{min:0,max:a.heatmapMax.value,inRange:{color:['#1e293b','#fef08a','#ef4444']},calculable:false,show:false},
  series:[{type:'heatmap',data:a.heatmapData.value,label:{show:true,fontSize:8,color:'#94a3b8'}}],animation:false
}))
</script>
<style scoped>.panel{background:#1e293b;border-radius:8px;padding:12px;border:1px solid #334155}.panel h4{color:#38bdf8;font-size:13px;margin-bottom:4px}.chart{width:100%;height:200px}</style>