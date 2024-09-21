import { configureStore } from '@reduxjs/toolkit';
import riskSlice, { riskActions, riskSelectors } from 'src/frontend/store/slices/riskSlice';
import { Risk } from 'src/shared/types/index';
import { RootState } from 'src/frontend/store/index';

const mockRisks: Risk[] = [
  {
    id: 1,
    title: "Risk 1",
    description: "Description 1",
    status: "IDENTIFIED",
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: 2,
    title: "Risk 2",
    description: "Description 2",
    status: "ASSESSED",
    createdAt: "2023-01-02T00:00:00Z"
  }
];

describe('Risk Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { risks: riskSlice }
    });
  });

  it('should handle initial state', () => {
    const state = store.getState().risks;
    expect(state).toEqual({
      risks: [],
      status: 'idle',
      error: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 10
    });
  });

  it('should handle fetchRisks.pending', () => {
    store.dispatch(riskActions.fetchRisks.pending(''));
    const state = store.getState().risks;
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('should handle fetchRisks.fulfilled', () => {
    store.dispatch(riskActions.fetchRisks.fulfilled({ items: mockRisks, total: mockRisks.length }, '', {}));
    const state = store.getState().risks;
    expect(state.risks).toEqual(mockRisks);
    expect(state.status).toBe('succeeded');
    expect(state.error).toBeNull();
    expect(state.totalCount).toBe(mockRisks.length);
  });

  it('should handle fetchRisks.rejected', () => {
    const errorMessage = 'Failed to fetch risks';
    store.dispatch(riskActions.fetchRisks.rejected(new Error(errorMessage), ''));
    const state = store.getState().risks;
    expect(state.status).toBe('failed');
    expect(state.error).toBe(errorMessage);
  });

  it('should handle createRisk.fulfilled', () => {
    const newRisk: Risk = {
      id: 3,
      title: "New Risk",
      description: "New Description",
      status: "IDENTIFIED",
      createdAt: "2023-01-03T00:00:00Z"
    };
    store.dispatch(riskActions.createRisk.fulfilled(newRisk, '', newRisk));
    const state = store.getState().risks;
    expect(state.risks).toContainEqual(newRisk);
  });

  it('should handle updateRisk.fulfilled', () => {
    const updatedRisk: Risk = { ...mockRisks[0], title: "Updated Risk 1" };
    store.dispatch(riskActions.updateRisk.fulfilled(updatedRisk, '', updatedRisk));
    const state = store.getState().risks;
    expect(state.risks.find(risk => risk.id === updatedRisk.id)).toEqual(updatedRisk);
  });

  it('should handle deleteRisk.fulfilled', () => {
    store.dispatch(riskActions.fetchRisks.fulfilled({ items: mockRisks, total: mockRisks.length }, '', {}));
    store.dispatch(riskActions.deleteRisk.fulfilled(mockRisks[0].id, '', mockRisks[0].id));
    const state = store.getState().risks;
    expect(state.risks).not.toContainEqual(mockRisks[0]);
  });

  it('should handle setCurrentPage', () => {
    const newPage = 2;
    store.dispatch(riskActions.setCurrentPage(newPage));
    const state = store.getState().risks;
    expect(state.currentPage).toBe(newPage);
  });

  it('should handle setPageSize', () => {
    const newPageSize = 20;
    store.dispatch(riskActions.setPageSize(newPageSize));
    const state = store.getState().risks;
    expect(state.pageSize).toBe(newPageSize);
  });

  // Test selectors
  it('should select all risks', () => {
    store.dispatch(riskActions.fetchRisks.fulfilled({ items: mockRisks, total: mockRisks.length }, '', {}));
    const risks = riskSelectors.selectAllRisks(store.getState() as RootState);
    expect(risks).toEqual(mockRisks);
  });

  it('should select risk by id', () => {
    store.dispatch(riskActions.fetchRisks.fulfilled({ items: mockRisks, total: mockRisks.length }, '', {}));
    const risk = riskSelectors.selectRiskById(store.getState() as RootState, 1);
    expect(risk).toEqual(mockRisks[0]);
  });

  it('should select risk status', () => {
    store.dispatch(riskActions.fetchRisks.pending(''));
    const status = riskSelectors.selectRiskStatus(store.getState() as RootState);
    expect(status).toBe('loading');
  });

  it('should select risk error', () => {
    const errorMessage = 'Failed to fetch risks';
    store.dispatch(riskActions.fetchRisks.rejected(new Error(errorMessage), ''));
    const error = riskSelectors.selectRiskError(store.getState() as RootState);
    expect(error).toBe(errorMessage);
  });

  it('should select risk pagination', () => {
    store.dispatch(riskActions.setCurrentPage(2));
    store.dispatch(riskActions.setPageSize(20));
    const pagination = riskSelectors.selectRiskPagination(store.getState() as RootState);
    expect(pagination).toEqual({
      currentPage: 2,
      pageSize: 20,
      totalCount: 0
    });
  });
});