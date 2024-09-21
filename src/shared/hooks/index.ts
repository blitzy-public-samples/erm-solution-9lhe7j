import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ApiResponse, PaginatedResponse, User } from 'src/shared/types/index';
import { api } from 'src/frontend/services/api';
import { AuthContext } from 'src/frontend/contexts/AuthContext';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants/index';

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  return authContext;
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<T>>(url, options);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const usePagination = <T>(
  fetchFunction: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  initialPageSize: number = DEFAULT_PAGE_SIZE
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFunction(page, pageSize);
      setData(response.items);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, pageSize]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const changePage = (newPage: number) => setPage(newPage);
  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return { data, loading, error, page, pageSize, totalCount, changePage, changePageSize };
};

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validate: (values: T) => Record<string, string>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues(prevValues => ({ ...prevValues, [name]: value }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
  };

  const handleSubmit = (onSubmit: (values: T) => void) => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  useEffect(() => {
    setErrors(validate(values));
  }, [values]);

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};