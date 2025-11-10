
export enum UserRole {
  OPERACIONAL = 'operacional',
  CONTROLE = 'controle',
  MANUTENCAO = 'manutencao',
}

export interface User {
  role: UserRole;
}

export interface ProductionOrder {
  id?: number;
  op: string;
  product: string;
  lot: string;
  startTime?: number;
  endTime?: number;
  plannedKg: number;
  actualKg: number;
  operator: string;
  notes: string;
  status: 'Pendente' | 'Ativa' | 'Concluída';
}

export enum StopCategory {
  MECANICA = 'Mecânica',
  ELETRICA = 'Elétrica',
  PROCESSO = 'Processo',
  QUALIDADE = 'Qualidade',
  INSUMO = 'Insumo',
  OUTROS = 'Outros',
}

export interface MachineStop {
  id?: number;
  productionOrderId: number;
  startTime: number;
  endTime: number;
  category: StopCategory;
  subCause: string;
  responsible: string;
  description: string;
}

export enum MaintenanceType {
  CORRETIVA = 'Corretiva',
  PREVENTIVA = 'Preventiva',
  PREDITIVA = 'Preditiva',
}

export interface MaintenanceIntervention {
  id?: number;
  machineStopId?: number;
  type: MaintenanceType;
  responsible: string;
  startTime: number;
  endTime: number;
  partsUsed: string; // Will store comma-separated part names
  description: string;
  status: 'Aberta' | 'Fechada';
}

export interface MaterialConsumption {
  id?: number;
  productionOrderId: number;
  material: string;
  lot: string;
  plannedQty: number;
  actualQty: number;
}

export interface WasteLog {
  id?: number;
  productionOrderId: number;
  wasteKg: number;
  reason: string;
  logTime: number;
}

export interface MaintenancePart {
  id?: number;
  name: string;
  code: string;
}

export interface PreventivePlanItem {
  id?: number;
  task: string;
  type: MaintenanceType;
  frequencyDays: number;
  lastDone?: number; // timestamp
  nextDueDate: number; // timestamp
}
