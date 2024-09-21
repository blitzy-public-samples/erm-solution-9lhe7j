import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Risk, RiskStatus, PaginatedResponse } from 'src/shared/types/index';
import { api } from 'src/frontend/services/api';

// Define the state interface
interface RiskState {
  risks: Risk[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// Define initial state
const initialState: RiskState = {
  risks: [],
  status: 'idle',
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
};

// Async thunks
export const fetchRisks = createAsyncThunk<
  PaginatedResponse<Risk>,
  { page: number; pageSize: number; filters?: object }
>('risks/fetchRisks', async ({ page, pageSize, filters }) => {
  const response = await api.get<PaginatedResponse<Risk>>('/risks', { params: { page, pageSize, ...filters } });
  return response.data;
});

export const createRisk = createAsyncThunk<Risk, Omit<Risk, 'id'>>('risks/createRisk', async (risk) => {
  const response = await api.post<Risk>('/risks', risk);
  return response.data;
});

export const updateRisk = createAsyncThunk<Risk, Risk>('risks/updateRisk', async (risk) => {
  const response = await api.put<Risk>(`/risks/${risk.id}`, risk);
  return response.data;
});

export const deleteRisk = createAsyncThunk<void, string>('risks/deleteRisk', async (riskId) => {
  await api.delete(`/risks/${riskId}`);
});

// Create the slice
export const riskSlice = createSlice({
  name: 'risks',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRisks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRisks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.risks = action.payload.items;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchRisks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch risks';
      })
      .addCase(createRisk.fulfilled, (state, action) => {
        state.risks.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateRisk.fulfilled, (state, action) => {
        const index = state.risks.findIndex((risk) => risk.id === action.payload.id);
        if (index !== -1) {
          state.risks[index] = action.payload;
        }
      })
      .addCase(deleteRisk.fulfilled, (state, action) => {
        state.risks = state.risks.filter((risk) => risk.id !== action.meta.arg);
        state.totalCount -= 1;
      });
  },
});

// Export actions
export const { setCurrentPage, setPageSize } = riskSlice.actions;

// Selectors
export const riskSelectors = {
  selectAllRisks: (state: { risks: RiskState }) => state.risks.risks,
  selectRiskById: (state: { risks: RiskState }, riskId: string) =>
    state.risks.risks.find((risk) => risk.id === riskId),
  selectRiskStatus: (state: { risks: RiskState }) => state.risks.status,
  selectRiskError: (state: { risks: RiskState }) => state.risks.error,
  selectRiskPagination: (state: { risks: RiskState }) => ({
    currentPage: state.risks.currentPage,
    pageSize: state.risks.pageSize,
    totalCount: state.risks.totalCount,
  }),
};

export default riskSlice.reducer;