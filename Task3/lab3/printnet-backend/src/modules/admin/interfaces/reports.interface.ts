export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  machineId?: string;
  reportType: ReportType;
}

export enum ReportType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export interface Report {
  id: string;
  type: ReportType;
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  data: any;
  format: "PDF" | "CSV" | "JSON";
}
