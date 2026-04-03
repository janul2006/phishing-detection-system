import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const sentryUrlBackend =
  typeof window !== "undefined" &&
  /(^|\.)sentryurl\.dev$/i.test(window.location.hostname)
    ? "https://api.sentryurl.dev/api"
    : null;

const apiBaseUrl =
  configuredBaseUrl ||
  sentryUrlBackend ||
  "https://api.sentryurl.dev/api";

const API = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ""),
});

export default API;
