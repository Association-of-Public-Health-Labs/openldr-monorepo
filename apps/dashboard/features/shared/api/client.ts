import axios, { type AxiosInstance } from "axios";

type CreateApiClientOptions = {
  token?: string | null;
};

const baseURL = process.env.NEXT_PUBLIC_OPENLDR_API;

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return axios.create({
    baseURL,
    headers,
    timeout: 60000,
  });
}

export const apiClient = createApiClient();
