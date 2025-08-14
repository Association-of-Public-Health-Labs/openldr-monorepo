import axios from "axios";

export const api = (token: string) => axios.create({
  baseURL: process.env.NEXT_PUBLIC_OPENLDR_API,
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

