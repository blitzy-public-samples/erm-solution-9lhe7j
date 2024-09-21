import { configureStore } from '@reduxjs/toolkit';
import riskReducer from 'src/frontend/store/slices/riskSlice';
import assessmentReducer from 'src/frontend/store/slices/assessmentSlice';
import reportReducer from 'src/frontend/store/slices/reportSlice';
import userReducer from 'src/frontend/store/slices/userSlice';

const rootReducer = {
  risks: riskReducer,
  assessments: assessmentReducer,
  reports: reportReducer,
  user: userReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;