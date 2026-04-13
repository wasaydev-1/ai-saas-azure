import { apiClient } from "@/lib/api-client";
import { z } from "zod";

const kpiSchema = z.object({
  activeEmployees: z.number(),
  openAlerts: z.number(),
  onTimePercent: z.number().min(0).max(100),
  journeysToday: z.number(),
});

export type DashboardKpis = z.infer<typeof kpiSchema>;

export const dashboardApi = {
  async getKpis(): Promise<DashboardKpis> {
    const { data } = await apiClient.get<unknown>("/dashboard/kpis");
    return kpiSchema.parse(data);
  },
};
