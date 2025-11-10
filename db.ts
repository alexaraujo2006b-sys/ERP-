
import Dexie, { Table } from 'dexie';
import type { ProductionOrder, MachineStop, MaintenanceIntervention, MaterialConsumption, WasteLog, MaintenancePart, PreventivePlanItem } from './types';

export class MySubClassedDexie extends Dexie {
  productionOrders!: Table<ProductionOrder>;
  machineStops!: Table<MachineStop>;
  maintenanceInterventions!: Table<MaintenanceIntervention>;
  materialConsumptions!: Table<MaterialConsumption>;
  wasteLogs!: Table<WasteLog>;
  maintenanceParts!: Table<MaintenancePart>;
  preventivePlans!: Table<PreventivePlanItem>;

  constructor() {
    super('erpExtrusoraDB');
    // FIX: Dexie schema declaration must be done inside the constructor when subclassing.
    // This is the correct Dexie upgrade pattern.
    // Declare the schema for version 1.
    this.version(1).stores({
      productionOrders: '++id, op, product, status, startTime',
      machineStops: '++id, productionOrderId, startTime',
      maintenanceInterventions: '++id, machineStopId, startTime, type',
      materialConsumptions: '++id, productionOrderId, material',
      wasteLogs: '++id, productionOrderId, logTime',
    });

    // FIX: Dexie schema declaration must be done inside the constructor when subclassing.
    // Upgrade to version 2, redefining all previous stores and adding the new ones.
    this.version(2).stores({
      productionOrders: '++id, op, product, status, startTime',
      machineStops: '++id, productionOrderId, startTime',
      maintenanceInterventions: '++id, machineStopId, startTime, type',
      materialConsumptions: '++id, productionOrderId, material',
      wasteLogs: '++id, productionOrderId, logTime',
      maintenanceParts: '++id, name, code',
      preventivePlans: '++id, nextDueDate',
    });
  }
}

export const db = new MySubClassedDexie();
