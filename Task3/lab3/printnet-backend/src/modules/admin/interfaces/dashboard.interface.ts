export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeMachines: number;
  maintenanceRequired: number;
}

export interface MachineMetrics {
  id: string;
  serialNumber: string;
  location: string;
  status: string;
  lastMaintenance: Date;
  totalOrders: number;
  revenue: number;
  uptime: number;
}
