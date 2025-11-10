
export interface TaskLogEntry {
  id: string;
  taskName: string;
  category: string;
  duration: number; // in seconds
  timestamp: Date;
}

export interface AiReport {
    totalHours: number;
    totalMinutes: number;
    topCategory: string;
    summary: string;
}

export interface SheetTaskData {
  taskName: string;
  category: string;
  durationInMinutes: number;
  date: string;
  time: string;
}
