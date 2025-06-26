<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
  >
    <div
      class="bg-gray-800 border border-gray-600 p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-mono font-bold text-blue-400">
            CONFIGURACIÓN DE UMBRALES
          </h2>
          <p class="text-sm text-gray-400 font-mono">
            PARÁMETROS CRÍTICOS DE TEMPERATURA Y HUMEDAD
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-white text-2xl font-mono"
        >
          ×
        </button>
      </div>

      <!-- Global Settings -->
      <!-- <div class="mb-6 p-4 bg-gray-700 border border-gray-600">
        <h3
          class="text-sm font-mono font-bold text-gray-300 mb-4 flex items-center"
        >
          <Settings :size="16" class="mr-2" />
          CONFIGURACIÓN GLOBAL
        </h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1"
              >AUTO-AJUSTE</label
            >
            <label class="flex items-center space-x-2">
              <input
                type="checkbox"
                v-model="globalSettings.autoAdjust"
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span class="text-xs font-mono text-gray-300">ACTIVADO</span>
            </label>
          </div>
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1"
              >DELAY ALERTA (min)</label
            >
            <input
              type="number"
              v-model="globalSettings.alertDelay"
              class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
              min="1"
              max="60"
            />
          </div>
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1"
              >DELAY CRÍTICO (min)</label
            >
            <input
              type="number"
              v-model="globalSettings.criticalAlertDelay"
              class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label class="block text-xs font-mono text-gray-400 mb-1"
              >HISTÉRESIS (°C)</label
            >
            <input
              type="number"
              step="0.1"
              v-model="globalSettings.hysteresis"
              class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
              min="0.1"
              max="2.0"
            />
          </div>
        </div>
      </div> -->

      <!-- Room Thresholds -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="room in rooms"
          :key="room.id"
          class="bg-gray-700 border border-gray-600 p-4"
        >
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-mono font-bold text-gray-200">{{ room.name }}</h3>
              <div
                :class="`inline-flex items-center px-2 py-1 rounded text-xs font-mono ${getStatusColor(
                  room.sensorOnline
                )}`"
              >
                <Activity :size="12" class="mr-1" />
                {{ room.sensorOnline ? "ACTIVO" : "INACTIVO" }}
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="resetToDefaults(room.id)"
                class="p-2 bg-gray-600 hover:bg-gray-500 text-gray-300 transition-colors"
                title="Restaurar valores por defecto"
              >
                <RotateCcw :size="16" />
              </button>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="room.sensorOnline"
                  class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          <!-- Temperature Thresholds -->
          <div class="mb-4">
            <h4
              class="text-xs font-mono font-bold text-red-400 mb-2 flex items-center"
            >
              <Thermometer :size="12" class="mr-1" />
              TEMPERATURA (°C)
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs font-mono text-gray-400 mb-1 flex items-center"
                >
                  <TrendingDown :size="12" class="mr-1" />
                  MÍNIMO NORMAL
                </label>
                <input
                  type="number"
                  step="0.1"
                  v-model="room.umbral['MÍNIMO NORMAL']"
                  class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
                  :disabled="!room.sensorOnline"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-mono text-gray-400 mb-1 flex items-center"
                >
                  <TrendingUp :size="12" class="mr-1" />
                  MÁXIMO NORMAL
                </label>
                <input
                  type="number"
                  step="0.1"
                  v-model="room.umbral['MÁXIMO NORMAL']"
                  class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
                  :disabled="!room.sensorOnline"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-mono text-red-400 mb-1 flex items-center"
                >
                  <AlertTriangle :size="12" class="mr-1" />
                  CRÍTICO BAJO
                </label>
                <input
                  type="number"
                  step="0.1"
                  v-model="room.umbral['CRÍTICO BAJO']"
                  class="w-full p-2 bg-red-900/30 border border-red-600 text-red-300 font-mono text-sm"
                  :disabled="!room.sensorOnline"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-mono text-red-400 mb-1 flex items-center"
                >
                  <AlertTriangle :size="12" class="mr-1" />
                  CRÍTICO ALTO
                </label>
                <input
                  type="number"
                  step="0.1"
                  v-model="room.umbral['CRÍTICO ALTO']"
                  class="w-full p-2 bg-red-900/30 border border-red-600 text-red-300 font-mono text-sm"
                  :disabled="!room.sensorOnline"
                />
              </div>
            </div>
          </div>

          <!-- Humidity Thresholds -->
          <!-- <div class="mb-4">
            <h4 class="text-xs font-mono font-bold text-blue-400 mb-2 flex items-center">
              💧 HUMEDAD (%)
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-mono text-gray-400 mb-1">MÍNIMO</label>
                <input
                  type="number"
                  v-model="room.humidityMin"
                  class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
                  min="0"
                  max="100"
                  :disabled="!room.enabled"
                />
              </div>
              <div>
                <label class="block text-xs font-mono text-gray-400 mb-1">MÁXIMO</label>
                <input
                  type="number"
                  v-model="room.humidityMax"
                  class="w-full p-2 bg-gray-600 border border-gray-500 text-gray-300 font-mono text-sm"
                  min="0"
                  max="100"
                  :disabled="!room.enabled"
                />
              </div>
            </div>
          </div> -->

          <!-- Current Status Indicator -->
          <div class="p-2 bg-gray-800 border border-gray-600">
            <div class="text-xs font-mono text-gray-400 mb-1">
              RANGO OPERATIVO ACTUAL
            </div>
            <div class="flex justify-between text-xs font-mono">
              <span class="text-blue-300">
                TEMP: {{ room.umbral["MÍNIMO NORMAL"] }}°C -
                {{ room.umbral["MÁXIMO NORMAL"] }}°C
              </span>
            </div>
            <div class="flex justify-between text-xs font-mono mt-1">
              <span class="text-red-300">
                CRÍTICO: {{ room.umbral["CRÍTICO BAJO"] }}°C -
                {{ room.umbral["CRÍTICO ALTO"] }}°C
              </span>
              <span
                :class="room.sensorOnline ? 'text-green-300' : 'text-gray-500'"
              >
                {{ room.sensorOnline ? "MONITOREO ACTIVO" : "DESHABILITADO" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-xs font-mono text-gray-400">
          <div>• Los cambios se aplicarán inmediatamente al sistema</div>
          <div>• Las alertas críticas tienen prioridad sobre las normales</div>
          <div>• La histéresis evita oscilaciones en los límites</div>
        </div>
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            class="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 font-mono text-sm transition-colors"
          >
            CANCELAR
          </button>
          <button
            @click="handleSave"
            :disabled="isSaving"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-mono text-sm transition-colors flex items-center"
          >
            <div
              v-if="isSaving"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            <Save v-else :size="16" class="mr-2" />
            {{ isSaving ? "GUARDANDO..." : "GUARDAR CONFIGURACIÓN" }}
          </button>
        </div>
      </div>

      <!-- System Status -->
      <!-- <div class="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-600">
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-green-400">
            {{ thresholds.filter((r) => r.enabled).length }}
          </div>
          <div class="text-xs font-mono text-gray-400">ALMACENES ACTIVOS</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-blue-400">
            {{ globalSettings.alertDelay }}min
          </div>
          <div class="text-xs font-mono text-gray-400">DELAY ALERTAS</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-red-400">
            {{ globalSettings.criticalAlertDelay }}min
          </div>
          <div class="text-xs font-mono text-gray-400">DELAY CRÍTICO</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-mono font-bold text-yellow-400">
            ±{{ globalSettings.hysteresis }}°C
          </div>
          <div class="text-xs font-mono text-gray-400">HISTÉRESIS</div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Settings,
  Thermometer,
  AlertTriangle,
  Save,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-vue-next";

interface Umbral {
  "CRÍTICO ALTO": number;
  "CRÍTICO BAJO": number;
  "MÁXIMO NORMAL": number;
  "MÍNIMO NORMAL": number;
}

defineProps<{
  rooms: {
    id: number;
    name: string;
    temperature: number;
    humidity: number;
    status: "cold" | "normal" | "warning" | "critical";
    sensorOnline: boolean;
    lastUpdate: string;
    fanSpeed: number;
    alerts: string[];
    ventanasAbiertas: boolean;
    h2oAbierto: boolean;
    alarmaActive: boolean;
    umbral: Umbral;
  }[];
}>();

defineEmits<{
  close: [];
}>();

interface RoomThresholds {
  id: number;
  name: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  criticalTempMin: number;
  criticalTempMax: number;
  enabled: boolean;
}

// const thresholds = ref<RoomThresholds[]>([
//   {
//     id: 1,
//     name: "ALMACÉN A1",
//     tempMin: 18.0,
//     tempMax: 25.0,
//     humidityMin: 40,
//     humidityMax: 60,
//     criticalTempMin: 15.0,
//     criticalTempMax: 30.0,
//     enabled: true,
//   },
//   {
//     id: 2,
//     name: "ALMACÉN B2",
//     tempMin: 20.0,
//     tempMax: 28.0,
//     humidityMin: 35,
//     humidityMax: 65,
//     criticalTempMin: 16.0,
//     criticalTempMax: 32.0,
//     enabled: true,
//   },
//   {
//     id: 3,
//     name: "ALMACÉN C3",
//     tempMin: 19.0,
//     tempMax: 26.0,
//     humidityMin: 38,
//     humidityMax: 62,
//     criticalTempMin: 14.0,
//     criticalTempMax: 31.0,
//     enabled: false,
//   },
//   {
//     id: 4,
//     name: "ALMACÉN D4",
//     tempMin: 17.0,
//     tempMax: 24.0,
//     humidityMin: 42,
//     humidityMax: 58,
//     criticalTempMin: 12.0,
//     criticalTempMax: 28.0,
//     enabled: true,
//   },
// ]);

const globalSettings = ref({
  autoAdjust: true,
  alertDelay: 5,
  criticalAlertDelay: 2,
  hysteresis: 0.5,
});

const isSaving = ref(false);

const resetToDefaults = (roomId: number) => {
  const defaultValues = {
    tempMin: 18.0,
    tempMax: 25.0,
    humidityMin: 40,
    humidityMax: 60,
    criticalTempMin: 15.0,
    criticalTempMax: 30.0,
  };

  // const roomIndex = thresholds.value.findIndex((room) => room.id === roomId);
  // if (roomIndex !== -1) {
  //   thresholds.value[roomIndex] = {
  //     ...thresholds.value[roomIndex],
  //     ...defaultValues,
  //   };
  // }
};

const handleSave = async () => {
  isSaving.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Here you would typically send the data to your backend
  // console.log("Saving thresholds:", thresholds.value);
  console.log("Global settings:", globalSettings.value);

  isSaving.value = false;
};

const getStatusColor = (enabled: boolean) => {
  return enabled
    ? "text-green-400 bg-green-400/20"
    : "text-gray-400 bg-gray-400/20";
};
</script>
