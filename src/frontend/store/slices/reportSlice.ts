import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Report, ReportConfig, PaginatedResponse } from 'src/shared/types/index';
import { api } from 'src/frontend/services/api';

interface ReportState {
  reports: Report[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  generatingReport: boolean;
  generatedReportUrl: string | null;
}

const initialState: ReportState = {
  reports: [],
  status: 'idle',
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  generatingReport: false,
  generatedReportUrl: null,
};

export const fetchReports = createAsyncThunk<
  PaginatedResponse<Report>,
  { page: number; pageSize: number; filters?: object }
>('reports/fetchReports', async ({ page, pageSize, filters }) => {
  const response = await api.get<PaginatedResponse<Report>>('/reports', { params: { page, pageSize, ...filters } });
  return response.data;
});

export const createReport = createAsyncThunk<Report, ReportConfig>(
  'reports/createReport',
  async (reportConfig) => {
    const response = await api.post<Report>('/reports', reportConfig);
    return response.data;
  }
);

export const updateReport = createAsyncThunk<Report, Report>(
  'reports/updateReport',
  async (report) => {
    const response = await api.put<Report>(`/reports/${report.id}`, report);
    return response.data;
  }
);

export const deleteReport = createAsyncThunk<void, string>(
  'reports/deleteReport',
  async (reportId) => {
    await api.delete(`/reports/${reportId}`);
  }
);

export const generateReport = createAsyncThunk<string, string>(
  'reports/generateReport',
  async (reportId) => {
    const response = await api.post<{ url: string }>(`/reports/${reportId}/generate`);
    return response.data.url;
  }
);

export const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    clearGeneratedReport: (state) => {
      state.generatedReportUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload.items;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.push(action.payload);
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex((report) => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((report) => report.id !== action.meta.arg);
      })
      .addCase(generateReport.pending, (state) => {
        state.generatingReport = true;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generatingReport = false;
        state.generatedReportUrl = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generatingReport = false;
        state.error = action.error.message || 'Failed to generate report';
      });
  },
});

export const { setCurrentPage, setPageSize, clearGeneratedReport } = reportSlice.actions;

export const reportSelectors = {
  selectAllReports: (state: { reports: ReportState }) => state.reports.reports,
  selectReportById: (state: { reports: ReportState }, reportId: string) =>
    state.reports.reports.find((report) => report.id === reportId),
  selectReportStatus: (state: { reports: ReportState }) => state.reports.status,
  selectReportError: (state: { reports: ReportState }) => state.reports.error,
  selectReportPagination: (state: { reports: ReportState }) => ({
    currentPage: state.reports.currentPage,
    pageSize: state.reports.pageSize,
    totalCount: state.reports.totalCount,
  }),
  selectGeneratingReportStatus: (state: { reports: ReportState }) => state.reports.generatingReport,
  selectGeneratedReportUrl: (state: { reports: ReportState }) => state.reports.generatedReportUrl,
};

export default reportSlice.reducer;