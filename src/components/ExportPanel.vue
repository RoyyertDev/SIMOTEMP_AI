<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-gray-800 border border-gray-600 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-mono font-bold text-green-400">EXPORTACIÓN DE DATOS</h2>
          <p class="text-sm text-gray-400 font-mono">GENERACIÓN DE REPORTES INDUSTRIALES</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white text-2xl font-mono"
        >
          ×
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Data Type Selection -->
        <div>
          <h3 class="text-sm font-mono font-bold text-gray-300 mb-3 flex items-center">
            <Database :size="16" class="mr-2" />
            TIPO DE DATOS
          </h3>
          <div class="space-y-2">
            <button
              v-for="type in dataTypes"
              :key="type.id"
              @click="selectedDataType = type.id"
              :class="`w-full p-3 text-left border font-mono text-sm transition-colors ${
                selectedDataType === type.id
                  ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                  : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
              }`"
            >
              <div class="flex items-center">
                <component :is="type.icon" :size="16" :class="`mr-3 ${type.color}`" />
                <span>{{ type.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Format and Options -->
        <div class="space-y-6">
          <!-- Format Selection -->
          <div>
            <h3 class="text-sm font-mono font-bold text-gray-300 mb-3 flex items-center">
              <FileText :size="16" class="mr-2" />
              FORMATO DE EXPORTACIÓN
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="selectedFormat = 'excel'"
                :class="`p-3 border font-mono text-sm transition-colors ${
                  selectedFormat === 'excel'
                    ? 'border-green-500 bg-green-900/30 text-green-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`"
              >
                <FileSpreadsheet :size="16" class="mx-auto mb-1" />
                EXCEL (.xlsx)
              </button>
              <button
                @click="selectedFormat = 'pdf'"
                :class="`p-3 border font-mono text-sm transition-colors ${
                  selectedFormat === 'pdf'
                    ? 'border-red-500 bg-red-900/30 text-red-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`"
              >
                <FileText :size="16" class="mx-auto mb-1" />
                PDF (.pdf)
              </button>
            </div>
          </div>

          <!-- Date Range -->
          <div>
            <h3 class="text-sm font-mono font-bold text-gray-300 mb-3 flex items-center">
              <Calendar :size="16" class="mr-2" />
              RANGO TEMPORAL
            </h3>
            <select
              v-model="dateRange"
              class="w-full p-2 bg-gray-700 border border-gray-600 text-gray-300 font-mono text-sm"
            >
              <option v-for="range in dateRanges" :key="range.id" :value="range.id">
                {{ range.name }}
              </option>
            </select>
          </div>

          <!-- Room Selection -->
          <div>
            <h3 class="text-sm font-mono font-bold text-gray-300 mb-3 flex items-center">
              <Filter :size="16" class="mr-2" />
              FILTRO POR ALMACÉN
            </h3>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <label 
                v-for="room in roomOptions" 
                :key="room.id" 
                class="flex items-center space-x-2 text-sm font-mono"
              >
                <input
                  type="checkbox"
                  :checked="selectedRooms.includes(room.id)"
                  @change="toggleRoom(room.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span class="text-gray-300">{{ room.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Summary -->
      <div class="mt-6 p-4 bg-gray-700 border border-gray-600">
        <h3 class="text-sm font-mono font-bold text-gray-300 mb-2">RESUMEN DE EXPORTACIÓN</h3>
        <div class="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
          <div>
            <span class="text-gray-500">Tipo de datos:</span>
            <span class="ml-2 text-gray-300">
              {{ dataTypes.find(t => t.id === selectedDataType)?.name }}
            </span>
          </div>
          <div>
            <span class="text-gray-500">Formato:</span>
            <span class="ml-2 text-gray-300">{{ selectedFormat.toUpperCase() }}</span>
          </div>
          <div>
            <span class="text-gray-500">Período:</span>
            <span class="ml-2 text-gray-300">
              {{ dateRanges.find(r => r.id === dateRange)?.name }}
            </span>
          </div>
          <div>
            <span class="text-gray-500">Almacenes:</span>
            <span class="ml-2 text-gray-300">
              {{ selectedRooms.includes('all') ? 'TODOS' : selectedRooms.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 font-mono text-sm transition-colors"
        >
          CANCELAR
        </button>
        <button
          @click="handleExport"
          :disabled="isExporting"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-mono text-sm transition-colors flex items-center"
        >
          <div v-if="isExporting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          <Download v-else :size="16" class="mr-2" />
          {{ isExporting ? 'EXPORTANDO...' : 'EXPORTAR DATOS' }}
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-gray-600">
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-red-400">1,152</div>
          <div class="text-xs font-mono text-gray-400">REGISTROS TEMP</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-green-400">150</div>
          <div class="text-xs font-mono text-gray-400">COMANDOS</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-yellow-400">200</div>
          <div class="text-xs font-mono text-gray-400">ALERTAS</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-purple-400">50</div>
          <div class="text-xs font-mono text-gray-400">EVENTOS SYS</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Filter,
  Database,
  Activity,
  AlertTriangle,
  Settings,
  Thermometer
} from 'lucide-vue-next'
import { 
  generateSampleData,
  exportTemperaturesToExcel,
  exportCommandsToExcel,
  exportAlertsToExcel,
  exportSystemToExcel,
  exportTemperaturesToPDF,
  exportCommandsToPDF,
  exportAlertsToPDF,
  exportSystemToPDF,
  exportAllDataToExcel
} from '../utils/exportUtils'

defineEmits<{
  close: []
}>()

const selectedDataType = ref('all')
const selectedFormat = ref('excel')
const dateRange = ref('7d')
const selectedRooms = ref(['all'])
const isExporting = ref(false)

const dataTypes = [
  { id: 'all', name: 'Todos los datos', icon: Database, color: 'text-blue-400' },
  { id: 'temperatures', name: 'Temperaturas', icon: Thermometer, color: 'text-red-400' },
  { id: 'commands', name: 'Comandos', icon: Activity, color: 'text-green-400' },
  { id: 'alerts', name: 'Alertas', icon: AlertTriangle, color: 'text-yellow-400' },
  { id: 'system', name: 'Sistema', icon: Settings, color: 'text-purple-400' }
]

const roomOptions = [
  { id: 'all', name: 'Todos los almacenes' },
  { id: 'A1', name: 'ALMACÉN A1' },
  { id: 'B2', name: 'ALMACÉN B2' },
  { id: 'C3', name: 'ALMACÉN C3' },
  { id: 'D4', name: 'ALMACÉN D4' }
]

const dateRanges = [
  { id: '1d', name: 'Último día' },
  { id: '7d', name: 'Última semana' },
  { id: '30d', name: 'Último mes' },
  { id: '90d', name: 'Últimos 3 meses' },
  { id: 'custom', name: 'Rango personalizado' }
]

const toggleRoom = (roomId: string) => {
  if (roomId === 'all') {
    selectedRooms.value = ['all']
  } else {
    const filtered = selectedRooms.value.filter(id => id !== 'all')
    if (filtered.includes(roomId)) {
      const newSelection = filtered.filter(id => id !== roomId)
      selectedRooms.value = newSelection.length === 0 ? ['all'] : newSelection
    } else {
      selectedRooms.value = [...filtered, roomId]
    }
  }
}

const handleExport = async () => {
  isExporting.value = true
  
  try {
    const data = generateSampleData()
    
    if (selectedDataType.value === 'all') {
      exportAllDataToExcel()
    } else {
      const filename = `${selectedDataType.value}_${dateRange.value}`
      
      if (selectedFormat.value === 'excel') {
        switch (selectedDataType.value) {
          case 'temperatures':
            exportTemperaturesToExcel(data.temperatureRecords, filename)
            break
          case 'commands':
            exportCommandsToExcel(data.commandRecords, filename)
            break
          case 'alerts':
            exportAlertsToExcel(data.alertRecords, filename)
            break
          case 'system':
            exportSystemToExcel(data.systemRecords, filename)
            break
        }
      } else if (selectedFormat.value === 'pdf') {
        switch (selectedDataType.value) {
          case 'temperatures':
            exportTemperaturesToPDF(data.temperatureRecords, filename)
            break
          case 'commands':
            exportCommandsToPDF(data.commandRecords, filename)
            break
          case 'alerts':
            exportAlertsToPDF(data.alertRecords, filename)
            break
          case 'system':
            exportSystemToPDF(data.systemRecords, filename)
            break
        }
      }
    }
    
    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
  } catch (error) {
    console.error('Error durante la exportación:', error)
  } finally {
    isExporting.value = false
  }
}
</script>