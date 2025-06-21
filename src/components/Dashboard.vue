<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4">
    <div class="max-w-[2000px] mx-auto">
      <!-- Header -->
      <header class="mb-6 pb-4 border-b border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-mono font-bold text-green-400">SISTEMA MONITOREO TEMP</h1>
            <p class="text-sm text-gray-400 font-mono">CONTROL INDUSTRIAL - ALMACENES</p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showThresholdConfig = true"
              class="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-mono transition-colors"
            >
              <Sliders :size="16" />
              <span>UMBRALES</span>
            </button>
            <button
              @click="showExportPanel = true"
              class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-mono transition-colors"
            >
              <Download :size="16" />
              <span>EXPORTAR DATOS</span>
            </button>
            <div class="text-right">
              <div class="text-lg font-mono">{{ currentTime }}</div>
              <div class="text-sm text-gray-400">{{ currentDate }}</div>
            </div>
            <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      <!-- Main Grid -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="bg-gray-800 border border-gray-700 p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-mono font-bold">{{ room.name }}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <div :class="`w-2 h-2 rounded-full ${room.sensorOnline ? 'bg-green-400' : 'bg-red-400'}`"></div>
                <span class="text-xs text-gray-400 font-mono">
                  {{ room.sensorOnline ? 'SENSOR ONLINE' : 'SENSOR OFFLINE' }}
                </span>
              </div>
            </div>
            <div :class="`px-3 py-1 rounded text-xs font-mono ${getStatusColor(room.status)}`">
              {{ room.status.toUpperCase() }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Thermometer :size="16" class="text-red-400" />
                <span class="text-sm font-mono">TEMPERATURA</span>
              </div>
              <div class="text-3xl font-mono font-bold">{{ room.temperature }}°C</div>
              <div class="text-xs text-gray-400 font-mono">Última: {{ room.lastUpdate }}</div>
            </div>
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Droplets :size="16" class="text-blue-400" />
                <span class="text-sm font-mono">HUMEDAD</span>
              </div>
              <div class="text-3xl font-mono font-bold">{{ room.humidity }}%</div>
              <div class="flex items-center space-x-2 mt-1">
                <Fan :size="12" class="text-gray-400" />
                <span class="text-xs text-gray-400 font-mono">RPM: {{ room.fanSpeed }}%</span>
              </div>
            </div>
          </div>

          <div v-if="room.alerts.length > 0" class="mb-4">
            <div class="flex items-center space-x-2 mb-2">
              <AlertTriangle :size="16" class="text-yellow-400" />
              <span class="text-sm font-mono">ALERTAS ACTIVAS</span>
            </div>
            <div 
              v-for="(alert, index) in room.alerts" 
              :key="index"
              class="text-xs bg-red-900/50 text-red-300 px-2 py-1 mb-1 font-mono"
            >
              {{ alert }}
            </div>
          </div>

          <!-- Quick Charts -->
          <div class="mb-4">
            <div class="text-xs font-mono text-gray-400 mb-2">TENDENCIA 24H</div>
            <div class="flex items-end space-x-1 h-16">
              <div
                v-for="(data, index) in generateHourlyData().slice(-12)"
                :key="index"
                class="bg-blue-500 w-2 opacity-70"
                :style="{ height: `${(data.temp / 35) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Control Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="executeCommand(room.id, 'Aumentar ventilación')"
              class="bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Fan :size="16" class="mx-auto mb-1" />
              VENT+
            </button>
            <button
              @click="executeCommand(room.id, 'Abrir ventanas')"
              class="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Wind :size="16" class="mx-auto mb-1" />
              VENT
            </button>
            <button
              @click="executeCommand(room.id, 'Supresión fuego')"
              class="bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Droplets :size="16" class="mx-auto mb-1" />
              H2O
            </button>
            <button
              @click="executeCommand(room.id, 'Alarma evacuación')"
              class="bg-orange-600 hover:bg-orange-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Volume2 :size="16" class="mx-auto mb-1" />
              EVAC
            </button>
          </div>
        </div>
      </div>

      <!-- Command Log and System Status -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Command History -->
        <div class="bg-gray-800 border border-gray-700 p-4">
          <h3 class="font-mono font-bold mb-4 flex items-center">
            <Activity :size="16" class="mr-2 text-green-400" />
            REGISTRO COMANDOS
          </h3>
          <div class="space-y-2">
            <div 
              v-for="(cmd, index) in commands" 
              :key="index"
              class="flex justify-between items-center text-xs font-mono border-b border-gray-700 pb-2"
            >
              <div>
                <div class="text-gray-300">{{ cmd.timestamp }} - {{ cmd.room }}</div>
                <div class="text-gray-400">{{ cmd.action }}</div>
              </div>
              <div class="flex items-center">
                <CheckCircle v-if="cmd.status === 'success'" :size="12" class="text-green-400" />
                <XCircle v-else-if="cmd.status === 'error'" :size="12" class="text-red-400" />
                <div v-else class="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-gray-800 border border-gray-700 p-4">
          <h3 class="font-mono font-bold mb-4 flex items-center">
            <Settings :size="16" class="mr-2 text-blue-400" />
            ESTADO SISTEMA
          </h3>
          <div class="space-y-3 text-xs font-mono">
            <div class="flex justify-between">
              <span>Sensores activos:</span>
              <span class="text-green-400">3/4</span>
            </div>
            <div class="flex justify-between">
              <span>Conexión red:</span>
              <span class="text-green-400">ESTABLE</span>
            </div>
            <div class="flex justify-between">
              <span>Alertas activas:</span>
              <span class="text-yellow-400">2</span>
            </div>
            <div class="flex justify-between">
              <span>Última sincronización:</span>
              <span class="text-gray-400">10:35</span>
            </div>
            <div class="flex justify-between">
              <span>Modo operación:</span>
              <span class="text-blue-400">AUTOMÁTICO</span>
            </div>
            <div class="flex justify-between">
              <span>Registros totales:</span>
              <span class="text-cyan-400">1,552</span>
            </div>
          </div>
        </div>

        <!-- Emergency Controls -->
        <div class="bg-gray-800 border border-gray-700 p-4">
          <h3 class="font-mono font-bold mb-4 flex items-center">
            <AlertTriangle :size="16" class="mr-2 text-red-400" />
            CONTROLES EMERGENCIA
          </h3>
          <div class="space-y-2">
            <button class="w-full bg-red-700 hover:bg-red-600 py-3 text-sm font-mono font-bold transition-colors">
              🚨 EVACUACIÓN GENERAL
            </button>
            <button class="w-full bg-blue-700 hover:bg-blue-600 py-2 text-sm font-mono transition-colors">
              💨 VENTILACIÓN MÁXIMA
            </button>
            <button class="w-full bg-cyan-700 hover:bg-cyan-600 py-2 text-sm font-mono transition-colors">
              💧 SUPRESIÓN TOTAL
            </button>
            <button class="w-full bg-gray-700 hover:bg-gray-600 py-2 text-sm font-mono transition-colors">
              🔄 RESET SISTEMA
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Panel Modal -->
    <ExportPanel v-if="showExportPanel" @close="showExportPanel = false" />

    <!-- Threshold Configuration Modal -->
    <ThresholdConfig v-if="showThresholdConfig" @close="showThresholdConfig = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Thermometer, 
  Fan, 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Droplets,
  Volume2,
  Settings,
  Download,
  Sliders
} from 'lucide-vue-next'
import ExportPanel from './ExportPanel.vue'
import ThresholdConfig from './ThresholdConfig.vue'

interface RoomData {
  id: number
  name: string
  temperature: number
  humidity: number
  status: 'normal' | 'warning' | 'critical'
  sensorOnline: boolean
  lastUpdate: string
  fanSpeed: number
  alerts: string[]
}

interface Command {
  timestamp: string
  room: string
  action: string
  status: 'success' | 'error' | 'pending'
}

const rooms = ref<RoomData[]>([
  {
    id: 1,
    name: 'ALMACÉN A1',
    temperature: 22.5,
    humidity: 45,
    status: 'normal',
    sensorOnline: true,
    lastUpdate: '10:32',
    fanSpeed: 45,
    alerts: []
  },
  {
    id: 2,
    name: 'ALMACÉN B2',
    temperature: 28.1,
    humidity: 48,
    status: 'warning',
    sensorOnline: true,
    lastUpdate: '10:31',
    fanSpeed: 67,
    alerts: ['Temp. elevada']
  },
  {
    id: 3,
    name: 'ALMACÉN C3',
    temperature: 21.8,
    humidity: 42,
    status: 'normal',
    sensorOnline: false,
    lastUpdate: '09:58',
    fanSpeed: 30,
    alerts: ['Sensor offline']
  },
  {
    id: 4,
    name: 'ALMACÉN D4',
    temperature: 31.2,
    humidity: 53,
    status: 'critical',
    sensorOnline: true,
    lastUpdate: '10:35',
    fanSpeed: 95,
    alerts: ['Temp. crítica', 'Activar supresión']
  }
])

const commands = ref<Command[]>([
  { timestamp: '10:35', room: 'D4', action: 'Activar supresión fuego', status: 'success' },
  { timestamp: '10:32', room: 'B2', action: 'Aumentar ventilación', status: 'success' },
  { timestamp: '10:28', room: 'A1', action: 'Abrir ventanas', status: 'success' },
  { timestamp: '10:15', room: 'C3', action: 'Reset sensor', status: 'error' }
])

const showExportPanel = ref(false)
const showThresholdConfig = ref(false)
const currentTime = ref('')
const currentDate = ref('')

let timeInterval: number

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-ES')
  currentDate.value = now.toLocaleDateString('es-ES')
}

const executeCommand = (roomId: number, action: string) => {
  const room = rooms.value.find(r => r.id === roomId)
  if (!room) return

  const newCommand: Command = {
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    room: room.name,
    action,
    status: 'pending'
  }

  commands.value.unshift(newCommand)
  commands.value = commands.value.slice(0, 10)

  // Simulate command execution
  setTimeout(() => {
    const cmdIndex = commands.value.findIndex(cmd => cmd === newCommand)
    if (cmdIndex !== -1) {
      commands.value[cmdIndex].status = Math.random() > 0.1 ? 'success' : 'error'
    }
  }, 1000)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal': return 'text-green-400 bg-green-400/20'
    case 'warning': return 'text-yellow-400 bg-yellow-400/20'
    case 'critical': return 'text-red-400 bg-red-400/20'
    default: return 'text-gray-400 bg-gray-400/20'
  }
}

const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    temp: 20 + Math.random() * 15
  }))
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>