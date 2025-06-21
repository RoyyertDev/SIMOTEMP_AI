import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface TemperatureRecord {
  timestamp: string;
  room: string;
  temperature: number;
  humidity: number;
  status: string;
  sensorOnline: boolean;
}

export interface CommandRecord {
  timestamp: string;
  room: string;
  action: string;
  status: 'success' | 'error' | 'pending';
  operator?: string;
}

export interface AlertRecord {
  timestamp: string;
  room: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolved: boolean;
}

export interface SystemRecord {
  timestamp: string;
  eventType: string;
  description: string;
  affectedRooms: string[];
  status: string;
}

// Generate sample data for demonstration
export const generateSampleData = () => {
  const rooms = ['ALMACÉN A1', 'ALMACÉN B2', 'ALMACÉN C3', 'ALMACÉN D4'];
  const now = new Date();
  
  // Temperature records (last 24 hours)
  const temperatureRecords: TemperatureRecord[] = [];
  for (let i = 0; i < 288; i++) { // Every 5 minutes for 24 hours
    const timestamp = new Date(now.getTime() - (i * 5 * 60 * 1000));
    rooms.forEach(room => {
      temperatureRecords.push({
        timestamp: timestamp.toISOString(),
        room,
        temperature: 18 + Math.random() * 15,
        humidity: 35 + Math.random() * 25,
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'warning' : 'critical') : 'normal',
        sensorOnline: Math.random() > 0.05
      });
    });
  }

  // Command records (last 7 days)
  const commandRecords: CommandRecord[] = [];
  const actions = ['Aumentar ventilación', 'Abrir ventanas', 'Supresión fuego', 'Alarma evacuación', 'Reset sensor'];
  for (let i = 0; i < 150; i++) {
    const timestamp = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
    commandRecords.push({
      timestamp: timestamp.toISOString(),
      room: rooms[Math.floor(Math.random() * rooms.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      status: Math.random() > 0.1 ? 'success' : 'error',
      operator: `OP${Math.floor(Math.random() * 10) + 1}`
    });
  }

  // Alert records (last 30 days)
  const alertRecords: AlertRecord[] = [];
  const alertTypes = ['Temperatura alta', 'Sensor offline', 'Humedad crítica', 'Fallo ventilación', 'Sistema desconectado'];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  for (let i = 0; i < 200; i++) {
    const timestamp = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    alertRecords.push({
      timestamp: timestamp.toISOString(),
      room: rooms[Math.floor(Math.random() * rooms.length)],
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Alerta automática del sistema de monitoreo`,
      resolved: Math.random() > 0.3
    });
  }

  // System records (last 30 days)
  const systemRecords: SystemRecord[] = [];
  const eventTypes = ['Inicio sistema', 'Mantenimiento', 'Actualización', 'Fallo red', 'Backup completado'];
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    systemRecords.push({
      timestamp: timestamp.toISOString(),
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      description: `Evento del sistema registrado automáticamente`,
      affectedRooms: rooms.slice(0, Math.floor(Math.random() * 4) + 1),
      status: Math.random() > 0.2 ? 'completado' : 'error'
    });
  }

  return {
    temperatureRecords: temperatureRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    commandRecords: commandRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    alertRecords: alertRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    systemRecords: systemRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  };
};

// Excel export functions
export const exportTemperaturesToExcel = (records: TemperatureRecord[], filename: string = 'temperaturas') => {
  const data = records.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Temperatura (°C)': record.temperature.toFixed(1),
    'Humedad (%)': record.humidity.toFixed(1),
    'Estado': record.status,
    'Sensor Online': record.sensorOnline ? 'SÍ' : 'NO'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Temperaturas');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCommandsToExcel = (records: CommandRecord[], filename: string = 'comandos') => {
  const data = records.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Acción': record.action,
    'Estado': record.status,
    'Operador': record.operator || 'SISTEMA'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Comandos');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAlertsToExcel = (records: AlertRecord[], filename: string = 'alertas') => {
  const data = records.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Tipo Alerta': record.alertType,
    'Severidad': record.severity,
    'Descripción': record.description,
    'Resuelto': record.resolved ? 'SÍ' : 'NO'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alertas');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportSystemToExcel = (records: SystemRecord[], filename: string = 'sistema') => {
  const data = records.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Tipo Evento': record.eventType,
    'Descripción': record.description,
    'Almacenes Afectados': record.affectedRooms.join(', '),
    'Estado': record.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sistema');
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// PDF export functions
export const exportTemperaturesToPDF = (records: TemperatureRecord[], filename: string = 'temperaturas') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text('REPORTE DE TEMPERATURAS - SISTEMA INDUSTRIAL', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
  doc.text(`Total de registros: ${records.length}`, 20, 35);

  // Table data
  const tableData = records.slice(0, 100).map(record => [
    new Date(record.timestamp).toLocaleString('es-ES'),
    record.room,
    `${record.temperature.toFixed(1)}°C`,
    `${record.humidity.toFixed(1)}%`,
    record.status.toUpperCase(),
    record.sensorOnline ? 'ONLINE' : 'OFFLINE'
  ]);

  doc.autoTable({
    head: [['Fecha/Hora', 'Almacén', 'Temp.', 'Humedad', 'Estado', 'Sensor']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportCommandsToPDF = (records: CommandRecord[], filename: string = 'comandos') => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('REPORTE DE COMANDOS - SISTEMA INDUSTRIAL', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
  doc.text(`Total de registros: ${records.length}`, 20, 35);

  const tableData = records.slice(0, 100).map(record => [
    new Date(record.timestamp).toLocaleString('es-ES'),
    record.room,
    record.action,
    record.status.toUpperCase(),
    record.operator || 'SISTEMA'
  ]);

  doc.autoTable({
    head: [['Fecha/Hora', 'Almacén', 'Acción', 'Estado', 'Operador']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [231, 76, 60] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportAlertsToPDF = (records: AlertRecord[], filename: string = 'alertas') => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('REPORTE DE ALERTAS - SISTEMA INDUSTRIAL', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
  doc.text(`Total de registros: ${records.length}`, 20, 35);

  const tableData = records.slice(0, 100).map(record => [
    new Date(record.timestamp).toLocaleString('es-ES'),
    record.room,
    record.alertType,
    record.severity.toUpperCase(),
    record.resolved ? 'RESUELTO' : 'PENDIENTE'
  ]);

  doc.autoTable({
    head: [['Fecha/Hora', 'Almacén', 'Tipo', 'Severidad', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [243, 156, 18] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSystemToPDF = (records: SystemRecord[], filename: string = 'sistema') => {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('REPORTE DEL SISTEMA - MONITOREO INDUSTRIAL', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, 30);
  doc.text(`Total de registros: ${records.length}`, 20, 35);

  const tableData = records.slice(0, 100).map(record => [
    new Date(record.timestamp).toLocaleString('es-ES'),
    record.eventType,
    record.description.substring(0, 30) + '...',
    record.affectedRooms.join(', '),
    record.status.toUpperCase()
  ]);

  doc.autoTable({
    head: [['Fecha/Hora', 'Evento', 'Descripción', 'Almacenes', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [46, 204, 113] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Combined export function
export const exportAllDataToExcel = () => {
  const data = generateSampleData();
  const wb = XLSX.utils.book_new();

  // Temperature sheet
  const tempData = data.temperatureRecords.slice(0, 1000).map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Temperatura (°C)': record.temperature.toFixed(1),
    'Humedad (%)': record.humidity.toFixed(1),
    'Estado': record.status,
    'Sensor Online': record.sensorOnline ? 'SÍ' : 'NO'
  }));
  const tempWs = XLSX.utils.json_to_sheet(tempData);
  XLSX.utils.book_append_sheet(wb, tempWs, 'Temperaturas');

  // Commands sheet
  const cmdData = data.commandRecords.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Acción': record.action,
    'Estado': record.status,
    'Operador': record.operator || 'SISTEMA'
  }));
  const cmdWs = XLSX.utils.json_to_sheet(cmdData);
  XLSX.utils.book_append_sheet(wb, cmdWs, 'Comandos');

  // Alerts sheet
  const alertData = data.alertRecords.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Almacén': record.room,
    'Tipo Alerta': record.alertType,
    'Severidad': record.severity,
    'Descripción': record.description,
    'Resuelto': record.resolved ? 'SÍ' : 'NO'
  }));
  const alertWs = XLSX.utils.json_to_sheet(alertData);
  XLSX.utils.book_append_sheet(wb, alertWs, 'Alertas');

  // System sheet
  const sysData = data.systemRecords.map(record => ({
    'Fecha/Hora': new Date(record.timestamp).toLocaleString('es-ES'),
    'Tipo Evento': record.eventType,
    'Descripción': record.description,
    'Almacenes Afectados': record.affectedRooms.join(', '),
    'Estado': record.status
  }));
  const sysWs = XLSX.utils.json_to_sheet(sysData);
  XLSX.utils.book_append_sheet(wb, sysWs, 'Sistema');

  XLSX.writeFile(wb, `reporte_completo_${new Date().toISOString().split('T')[0]}.xlsx`);
};