import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Assessment, PaginatedResponse } from 'src/shared/types/index';
import { api } from 'src/frontend/services/api';
import { RootState } from '../index';

interface AssessmentState {
  assessments: Assessment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

const initialState: AssessmentState = {
  assessments: [],
  status: 'idle',
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
};

export const fetchAssessments = createAsyncThunk<
  PaginatedResponse<Assessment>,
  { page: number; pageSize: number; filters?: object }
>('assessments/fetchAssessments', async ({ page, pageSize, filters }) => {
  const response = await api.get<PaginatedResponse<Assessment>>('/assessments', {
    params: { page, pageSize, ...filters },
  });
  return response.data;
});

export const createAssessment = createAsyncThunk<Assessment, Omit<Assessment, 'id'>>(
  'assessments/createAssessment',
  async (assessment) => {
    const response = await api.post<Assessment>('/assessments', assessment);
    return response.data;
  }
);

export const updateAssessment = createAsyncThunk<Assessment, Assessment>(
  'assessments/updateAssessment',
  async (assessment) => {
    const response = await api.put<Assessment>(`/assessments/${assessment.id}`, assessment);
    return response.data;
  }
);

export const deleteAssessment = createAsyncThunk<void, string>(
  'assessments/deleteAssessment',
  async (assessmentId) => {
    await api.delete(`/assessments/${assessmentId}`);
  }
);

export const assessmentSlice = createSlice({
  name: 'assessments',
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
      .addCase(fetchAssessments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assessments = action.payload.items;
        state.totalCount = action.payload.total;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch assessments';
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.assessments.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateAssessment.fulfilled, (state, action) => {
        const index = state.assessments.findIndex((assessment) => assessment.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.assessments = state.assessments.filter((assessment) => assessment.id !== action.meta.arg);
        state.totalCount -= 1;
      });
  },
});

export const { setCurrentPage, setPageSize } = assessmentSlice.actions;

export const assessmentSelectors = {
  selectAllAssessments: (state: RootState) => state.assessments.assessments,
  selectAssessmentById: (state: RootState, assessmentId: string) =>
    state.assessments.assessments.find((assessment) => assessment.id === assessmentId),
  selectAssessmentStatus: (state: RootState) => state.assessments.status,
  selectAssessmentError: (state: RootState) => state.assessments.error,
  selectAssessmentPagination: (state: RootState) => ({
    currentPage: state.assessments.currentPage,
    pageSize: state.assessments.pageSize,
    totalCount: state.assessments.totalCount,
  }),
};

export default assessmentSlice.reducer;