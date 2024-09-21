import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api, setAuthToken } from 'src/frontend/services/api';
import { API_BASE_URL, TOKEN_STORAGE_KEY } from 'src/shared/constants/index';

describe('API service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  it('should make a GET request successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    mock.onGet(`${API_BASE_URL}/test`).reply(200, mockData);

    const response = await api.get('/test');
    expect(response.data).toEqual(mockData);
    expect(mock.history.get[0].url).toBe(`${API_BASE_URL}/test`);
  });

  it('should make a POST request successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const postData = { name: 'Test' };
    mock.onPost(`${API_BASE_URL}/test`, postData).reply(201, mockData);

    const response = await api.post('/test', postData);
    expect(response.data).toEqual(mockData);
    expect(mock.history.post[0].url).toBe(`${API_BASE_URL}/test`);
    expect(JSON.parse(mock.history.post[0].data)).toEqual(postData);
  });

  it('should make a PUT request successfully', async () => {
    const mockData = { id: 1, name: 'Updated Test' };
    const putData = { name: 'Updated Test' };
    mock.onPut(`${API_BASE_URL}/test/1`, putData).reply(200, mockData);

    const response = await api.put('/test/1', putData);
    expect(response.data).toEqual(mockData);
    expect(mock.history.put[0].url).toBe(`${API_BASE_URL}/test/1`);
    expect(JSON.parse(mock.history.put[0].data)).toEqual(putData);
  });

  it('should make a DELETE request successfully', async () => {
    mock.onDelete(`${API_BASE_URL}/test/1`).reply(204);

    const response = await api.delete('/test/1');
    expect(response.status).toBe(204);
    expect(mock.history.delete[0].url).toBe(`${API_BASE_URL}/test/1`);
  });

  it('should handle API errors correctly', async () => {
    const errorResponse = { message: 'Not Found' };
    mock.onGet(`${API_BASE_URL}/nonexistent`).reply(404, errorResponse);

    await expect(api.get('/nonexistent')).rejects.toThrow('Request failed with status code 404');
    try {
      await api.get('/nonexistent');
    } catch (error) {
      expect(error.response.data).toEqual(errorResponse);
    }
  });

  it('should set authentication token correctly', async () => {
    const token = 'test-token';
    setAuthToken(token);

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(token);

    mock.onGet(`${API_BASE_URL}/auth-test`).reply(200);
    await api.get('/auth-test');

    expect(mock.history.get[0].headers['Authorization']).toBe(`Bearer ${token}`);
  });

  it('should remove authentication token correctly', async () => {
    const token = 'test-token';
    setAuthToken(token);
    setAuthToken(null);

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();

    mock.onGet(`${API_BASE_URL}/auth-test`).reply(200);
    await api.get('/auth-test');

    expect(mock.history.get[0].headers['Authorization']).toBeUndefined();
  });
});