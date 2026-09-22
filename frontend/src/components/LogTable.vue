<template>
  <div class="panel" style="height:100%">
    <h4>📋 日志流 ({{ totalLogs }} 条)</h4>
    <div class="table-wrap">
      <el-table :data="logs" size="small" max-height="400" stripe>
        <el-table-column v-for="col in logColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" :show-overflow-tooltip="col.showOverflowTooltip">
          <template v-if="col.isLevel" #default="{row}"><el-tag size="small" :type="levelTagType(row.level)">{{ row.level }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAnalysis, levelTagType } from '../composables/useAnalysis'
const { logs, totalLogs, logColumns } = useAnalysis()
</script>
<style scoped>.panel{background:#1e293b;border-radius:8px;padding:12px;height:100%;border:1px solid #334155}.panel h4{color:#38bdf8;font-size:13px;margin-bottom:8px}.table-wrap{height:calc(100% - 30px);overflow:auto}</style>