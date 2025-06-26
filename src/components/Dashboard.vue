<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  computed,
  watchEffect,
  normalizeClass,
} from "vue";
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
  Sliders,
} from "lucide-vue-next";
import ExportPanel from "./ExportPanel.vue";
import ThresholdConfig from "./ThresholdConfig.vue";

interface Umbral {
  "CRÍTICO ALTO": number;
  "CRÍTICO BAJO": number;
  "MÁXIMO NORMAL": number;
  "MÍNIMO NORMAL": number;
}

interface RoomData {
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
}

interface Command {
  id: number;
  timestamp: string;
  room: string;
  action: string;
  status: "success" | "error" | "pending";
}

const rooms = ref<RoomData[]>([
  {
    id: 1,
    name: "ALMACÉN A1",
    temperature: 100,
    humidity: 45,
    status: "normal",
    sensorOnline: false,
    lastUpdate: "10:32",
    fanSpeed: Math.floor(Math.random() * (50 - 40 + 1)) + 40,
    alerts: [],
    ventanasAbiertas: false,
    h2oAbierto: false,
    alarmaActive: false,
    umbral: {
      "CRÍTICO ALTO": 60,
      "CRÍTICO BAJO": 10,
      "MÁXIMO NORMAL": 38,
      "MÍNIMO NORMAL": 20,
    },
  },
  {
    id: 2,
    name: "ALMACÉN B2",
    temperature: 100,
    humidity: 48,
    status: "warning",
    sensorOnline: false,
    lastUpdate: "10:31",
    fanSpeed: Math.floor(Math.random() * (50 - 40 + 1)) + 40,
    alerts: [],
    ventanasAbiertas: false,
    h2oAbierto: false,
    alarmaActive: false,
    umbral: {
      "CRÍTICO ALTO": 60,
      "CRÍTICO BAJO": 10,
      "MÁXIMO NORMAL": 38,
      "MÍNIMO NORMAL": 20,
    },
  },
  {
    id: 3,
    name: "ALMACÉN C3",
    temperature: 100,
    humidity: 42,
    status: "normal",
    sensorOnline: false,
    lastUpdate: "09:58",
    fanSpeed: Math.floor(Math.random() * (50 - 40 + 1)) + 40,
    alerts: [],
    ventanasAbiertas: false,
    h2oAbierto: false,
    alarmaActive: false,
    umbral: {
      "CRÍTICO ALTO": 60,
      "CRÍTICO BAJO": 10,
      "MÁXIMO NORMAL": 38,
      "MÍNIMO NORMAL": 20,
    },
  },
  {
    id: 4,
    name: "ALMACÉN D4",
    temperature: 100,
    humidity: 53,
    status: "critical",
    sensorOnline: true,
    lastUpdate: "10:35",
    fanSpeed: Math.floor(Math.random() * (50 - 40 + 1)) + 40,
    alerts: [],
    ventanasAbiertas: false,
    h2oAbierto: false,
    alarmaActive: false,
    umbral: {
      "CRÍTICO ALTO": 60,
      "CRÍTICO BAJO": 10,
      "MÁXIMO NORMAL": 38,
      "MÍNIMO NORMAL": 20,
    },
  },
]);

const findContAlerts = () => {
  let contAlerts = 0;
  rooms.value.forEach((room) => {
    if (room.alerts.length > 0) contAlerts += room.alerts.length;
  });
  return contAlerts;
};

const commands = ref<Command[]>([
  // {
  //   timestamp: "10:35",
  //   room: "D4",
  //   action: "Activar supresión fuego",
  //   status: "success",
  // },
  // {
  //   timestamp: "10:32",
  //   room: "B2",
  //   action: "Aumentar ventilación",
  //   status: "success",
  // },
  // {
  //   timestamp: "10:28",
  //   room: "A1",
  //   action: "Abrir ventanas",
  //   status: "success",
  // },
  // { timestamp: "10:15", room: "C3", action: "Reset sensor", status: "error" },
]);

const showExportPanel = ref(false);
const showThresholdConfig = ref(false);
const currentTime = ref("");
const currentDate = ref("");

let timeInterval: number;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("es-ES");
  currentDate.value = now.toLocaleDateString("es-ES");
};

const executeCommandLoops = (action: string) => {
  rooms.value.forEach((room) => {
    executeCommand(room.id, action);
  });
};

const executeCommand = (roomId: number, action: string) => {
  const room = rooms.value.find((r) => r.id === roomId);
  if (!room) return;

  const newCommand: Command = {
    id: Math.floor(Math.random() * 10000),
    timestamp: new Date().toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    room: room.name,
    action,
    status: "pending",
  };

  switch (action) {
    case "Aumentar ventilación":
      room.fanSpeed >= 100 ? (room.fanSpeed = 100) : (room.fanSpeed += 1);
      break;
    case "Decrementar ventilación":
      room.fanSpeed <= 0 ? (room.fanSpeed = 0) : (room.fanSpeed -= 1);
      break;
    case "Toggle ventanas":
      const toggleWindow = room.h2oAbierto ? "Cerrar Ventana" : "Abrir Ventana";
      newCommand.action = toggleWindow;
      room.ventanasAbiertas = !room.ventanasAbiertas;
      break;
    case "Toggle h2o":
      const prop = room.h2oAbierto ? "Cerrar H2O" : "Abrir H2O";
      newCommand.action = prop;
      room.h2oAbierto = !room.h2oAbierto;
      break;
    case "Toggle evacuación":
      const evac = room.alarmaActive
        ? "Desactivar Evacuación"
        : "Activar Evacuación";
      newCommand.action = evac;
      room.alarmaActive = !room.alarmaActive;
      break;
    default:
      break;
  }

  commands.value.unshift(newCommand);
  // Simulate command execution
  setTimeout(() => {
    commands.value.map((cmd) => {
      if (cmd.id === newCommand.id) {
        cmd.status = Math.random() > 0.1 ? "success" : "error";
      }
    });
  }, 1000);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "normal":
      return "text-green-400 bg-green-400/20";
    case "warning":
      return "text-yellow-400 bg-yellow-400/20";
    case "critical":
      return "text-red-400 bg-red-400/20";
    default:
      return "text-blue-400 bg-blue-400/20";
  }
};

const getStatusColor2 = (status: string) => {
  switch (status) {
    case "normal":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "critical":
      return "text-red-400";
    default:
      return "text-blue-400";
  }
};

const generateHourlyData = (roomName: string) => {
  const temps = allTemperatures?.value[roomName] || [];
  return temps.map((temp, i) => ({
    hour: i,
    temp: Math.round(temp),
  }));
};

const updateTemperature = computed(() => {
  return rooms.value.map((room) => {
    let temp = room.temperature;
    temp -= room.fanSpeed * 1.5;
    if (room.ventanasAbiertas) temp -= 1.5;
    if (room.h2oAbierto) temp -= 40;

    return Math.max(temp, 15);
  });
});

const updateStateRoom = computed(() => {
  return rooms.value.map((room, index) => {
    let temperature = temperatures.value[index];
    if (temperature >= room.umbral["CRÍTICO ALTO"]) {
      room.status = "critical";
      room.alerts.unshift("Temperatura critica");
    } else if (temperature >= room.umbral["MÁXIMO NORMAL"]) {
      room.status = "warning";
      room.alerts.unshift("Temperatura elevada");
    } else if (temperature >= room.umbral["MÍNIMO NORMAL"]) {
      room.status = "normal";
      room.alerts.unshift("Temperatura normal");
    } else if (temperature <= room.umbral["CRÍTICO BAJO"]) {
      room.status = "cold";
      room.alerts.unshift("Temperatura excelente");
    } else {
      room.status = "normal";
      room.alerts.unshift("Temperatura muy baja");
    }
    return room.status;
  });
});

const updateHumidity = computed(() => {
  return rooms.value.map((room, index) => {
    let humidity = 100 - (temperatures.value[index] / 40) * 80;
    room.humidity = Math.max(20, Math.min(100, humidity));
    return room.humidity;
  });
});

const temperatures = ref<number[]>([]);
const allTemperatures = ref<Record<string, number[]>>({});

onMounted(() => {
  updateTime();
  timeInterval = setInterval(updateTime, 1000);

  rooms.value.forEach((room) => {
    allTemperatures.value[room.name] = [];
  });

  temperatures.value = rooms.value.map((room) => room.temperature);

  setInterval(() => {
    temperatures.value = rooms.value.map((room) => {
      let baseTemp = room.temperature;
      baseTemp -= room.fanSpeed * 1.5;
      if (room.ventanasAbiertas) baseTemp -= 1.5;
      if (room.h2oAbierto) baseTemp -= 40;

      const ruido = Math.random() * 4 - 2;
      let newTemp = baseTemp + ruido;

      allTemperatures.value[room.name].push(parseFloat(newTemp.toFixed(2)));
      return Math.max(newTemp, 15);
    });
  }, 2000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

const lastAction = ref<Record<number, Set<string>>>({});

watchEffect(() => {
  rooms.value.forEach((room, index) => {
    const temp = temperatures.value[index];

    if (!lastAction.value[room.id]) {
      lastAction.value[room.id] = new Set();
    }

    if (temp > 45 && !room.alarmaActive) {
      executeCommand(room.id, "Toggle evacuación");
      rememberAction(room.id, "Evacuación");
    } else if (temp > 40 && !room.h2oAbierto) {
      executeCommand(room.id, "Toggle h2o");
      rememberAction(room.id, "H2O");
    } else if (temp > 35 && !room.ventanasAbiertas) {
      executeCommand(room.id, "Toggle ventanas");
      rememberAction(room.id, "Ventana");
    } else if (temp > 30) {
      executeCommand(room.id, "Aumentar ventilación");
    } else if (temp < 20) {
      executeCommand(room.id, "Decrementar ventilación");
    } else if (temp < 18 && room.ventanasAbiertas) {
      executeCommand(room.id, "Toggle ventanas");
      rememberAction(room.id, "Ventana");
    } else if (temp < 16 && room.h2oAbierto) {
      executeCommand(room.id, "Toggle h2o");
      rememberAction(room.id, "H2O");
    } else if (temp < 15 && room.alarmaActive) {
      executeCommand(room.id, "Toggle evacuación");
      rememberAction(room.id, "Evacuación");
    }
  });
});

function rememberAction(roomId: number, action: string) {
  const key = normalizeAction(action);
  const set = lastAction.value[roomId];
  if (!set.has(key)) {
    set.add(key);
  }
}

function normalizeAction(action: string) {
  if (action.includes("Ventana")) return "Ventana";
  if (action.includes("H2O")) return "H2O";
  if (action.includes("Evacuación")) return "Evacuación";
  return action;
}

const countAllTemperatures = () => {
  return Object.values(allTemperatures.value).reduce(
    (total, temps) => total + temps.length,
    0
  );
};

interface AlertRecord {
  timestamp: string;
  room: string;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  resolved: boolean;
}

const generateAlertRecordsFromRooms = (): AlertRecord[] => {
  const alertRecords: AlertRecord[] = [];

  rooms.value.forEach((room) => {
    room.alerts.forEach((alert) => {
      alertRecords.push({
        timestamp: new Date().toISOString(),
        room: room.name,
        alertType: alert,
        severity: "medium",
        description: `Alerta detectada: ${alert} en ${room.name}`,
        resolved: false,
      });
    });
  });
  return alertRecords;
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4">
    <div class="max-w-[2000px] mx-auto">
      <!-- Header -->
      <header class="mb-6 pb-4 border-b border-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <img src="../../public/img/logo.png" alt="Logo" class="w-32" />
            <h1 class="text-lg font-mono font-bold text-green-400">
              Sistema Inteligente de Monitoreo de Temperaturas para Entornos
              Empresariales
            </h1>
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
          v-for="(room, index) in rooms"
          :key="room.id"
          class="bg-gray-800 border border-gray-700 p-6 flex flex-col"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-mono font-bold">{{ room.name }}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <div
                  :class="`w-2 h-2 rounded-full ${
                    room.sensorOnline ? 'bg-green-400' : 'bg-red-400'
                  }`"
                ></div>
                <span class="text-xs text-gray-400 font-mono">
                  {{ room.sensorOnline ? "SENSOR ONLINE" : "SENSOR OFFLINE" }}
                </span>
              </div>
            </div>
            <div
              :class="`px-3 py-1 rounded text-xs font-mono ${getStatusColor(
                room.status
              )}`"
            >
              {{ updateStateRoom[index].toUpperCase() }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Thermometer
                  :size="16"
                  :class="`${getStatusColor2(room.status)}`"
                />
                <span class="text-sm font-mono">TEMPERATURA</span>
              </div>
              <div class="text-3xl font-mono font-bold">
                {{ temperatures[index]?.toFixed(2) ?? "0.00" }}°C
              </div>
              <div class="text-xs text-gray-400 font-mono">
                Última: {{ room.lastUpdate }}
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <Droplets :size="16" class="text-blue-400" />
                <span class="text-sm font-mono">HUMEDAD</span>
              </div>
              <div class="text-3xl font-mono font-bold">
                {{ updateHumidity[index].toFixed(2) }}%
              </div>
              <div class="flex items-center space-x-2 mt-1">
                <Fan :size="12" class="text-gray-400" />
                <span class="text-xs text-gray-400 font-mono"
                  >RPM: {{ room.fanSpeed }}%</span
                >
              </div>
            </div>
          </div>

          <div class="mb-4 max-h-28 overflow-auto">
            <div
              class="flex items-center space-x-2 mb-2 sticky top-0 bg-gray-800"
            >
              <AlertTriangle :size="16" class="text-yellow-400" />
              <span class="text-sm font-mono">ALERTAS ACTIVAS</span>
            </div>
            <div
              v-if="room.alerts.length > 0"
              v-for="(alert, index) in room.alerts"
              :key="index"
              class="text-xs px-2 py-1 mb-1 font-mono"
              :class="{
                'bg-red-900/50 text-red-300': alert === 'Temperatura critica',
                'bg-orange-900/50 text-orange-300':
                  alert === 'Temperatura elevada',
                'bg-green-900/50 text-green-300':
                  alert === 'Temperatura normal',
                'bg-cyan-900/50 text-cyan-300':
                  alert === 'Temperatura excelente',
                'bg-blue-900/50 text-blue-300':
                  alert === 'Temperatura muy baja',
              }"
            >
              {{ index + 1 }}. {{ alert }}
            </div>
            <div
              v-else
              class="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 mb-1 font-mono"
            >
              Sin novedades
            </div>
          </div>

          <!-- Quick Charts -->
          <div class="mb-4 mt-auto">
            <div class="text-xs font-mono text-gray-400 mb-2">
              TENDENCIA 24H
            </div>
            <div class="flex items-end space-x-1 h-16">
              <div
                v-for="(data, index) in generateHourlyData(room.name)"
                :key="index"
                class="bg-blue-500 w-2 opacity-70"
                :style="{ height: `${(data.temp / 90) * 100}%` }"
                :title="data.temp + '°C'"
              ></div>
            </div>
          </div>

          <!-- Control Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="executeCommand(room.id, 'Decrementar ventilación')"
                class="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-xs font-mono transition-colors"
              >
                <Fan :size="16" class="mx-auto mb-1" />
                VENTILADOR RPM-
              </button>
              <button
                @click="executeCommand(room.id, 'Aumentar ventilación')"
                class="bg-green-600 hover:bg-green-500 px-3 py-2 text-xs font-mono transition-colors"
              >
                <Fan :size="16" class="mx-auto mb-1" />
                VENTILADOR RPM+
              </button>
            </div>
            <button
              @click="executeCommand(room.id, 'Toggle ventanas')"
              class="bg-orange-600 hover:bg-orange-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Wind :size="16" class="mx-auto mb-1" />
              {{ room.ventanasAbiertas ? "CERRAR" : "ABRIR" }} VENTANAS
            </button>
            <button
              @click="executeCommand(room.id, 'Toggle h2o')"
              class="bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Droplets :size="16" class="mx-auto mb-1" />
              {{ room.h2oAbierto ? "DESACTIVAR" : "ACTIVAR" }} H2O
            </button>
            <button
              @click="executeCommand(room.id, 'Toggle evacuación')"
              class="bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-mono transition-colors"
            >
              <Volume2 :size="16" class="mx-auto mb-1" />
              {{ room.alarmaActive ? "DESACTIVAR" : "ACTIVAR" }} EVACUACIÓN
            </button>
          </div>
        </div>
      </div>

      <!-- Command Log and System Status -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Command History -->
        <div
          class="bg-gray-800 border border-gray-700 p-4 pt-0 overflow-auto h-64"
        >
          <h3
            class="font-mono font-bold mb-4 flex items-center sticky top-0 bg-gray-800 pt-4 w-full"
          >
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
                <div class="text-gray-300">
                  {{ cmd.timestamp }} - {{ cmd.room }}
                </div>
                <div class="text-gray-400">{{ cmd.action }}</div>
              </div>
              <div class="flex items-center">
                <CheckCircle
                  v-if="cmd.status === 'success'"
                  :size="12"
                  class="text-green-400"
                />
                <XCircle
                  v-else-if="cmd.status === 'error'"
                  :size="12"
                  class="text-red-400"
                />
                <div
                  v-else
                  class="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"
                ></div>
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
              <span class="text-green-400"
                >{{ rooms.filter((r) => r.sensorOnline).length }}/{{
                  rooms.length
                }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>Conexión red:</span>
              <span class="text-green-400">ESTABLE</span>
            </div>
            <div class="flex justify-between">
              <span>Alertas activas:</span>
              <span class="text-yellow-400">{{ findContAlerts() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Última sincronización:</span>
              <span class="text-gray-400">{{ currentTime }}</span>
            </div>
            <div class="flex justify-between">
              <span>Modo operación:</span>
              <span class="text-blue-400">AUTOMÁTICO</span>
            </div>
            <div class="flex justify-between">
              <span>Registros totales:</span>
              <span class="text-cyan-400">{{ commands.length }}</span>
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
            <button
              @click="executeCommandLoops('Toggle evacuación')"
              class="w-full bg-red-700 hover:bg-red-600 py-3 text-sm font-mono font-bold transition-colors"
            >
              🚨 EVACUACIÓN GENERAL
            </button>
            <button
              @click="executeCommandLoops('Aumentar ventilación')"
              class="w-full bg-blue-700 hover:bg-blue-600 py-2 text-sm font-mono transition-colors"
            >
              💨 AUMENTAR RPM
            </button>
            <button
              @click="executeCommandLoops('Decrementar ventilación')"
              class="w-full bg-gray-700 hover:bg-gray-600 py-2 text-sm font-mono transition-colors"
            >
              💨 DECREMENTAR RPM
            </button>
            <button
              @click="executeCommandLoops('Toggle h2o')"
              class="w-full bg-cyan-700 hover:bg-cyan-600 py-2 text-sm font-mono transition-colors"
            >
              💧 SUPRESIÓN TOTAL
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Panel Modal -->
    <ExportPanel
      v-if="showExportPanel"
      @close="showExportPanel = false"
      :commands="commands"
      :alerts="findContAlerts()"
      :temperatures="countAllTemperatures()"
      :alertsAll="generateAlertRecordsFromRooms()"
    />

    <!-- Threshold Configuration Modal -->
    <ThresholdConfig
      v-if="showThresholdConfig"
      @close="showThresholdConfig = false"
      :rooms="rooms"
    />
  </div>
</template>
