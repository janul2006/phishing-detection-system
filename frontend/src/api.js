import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const deployedBaseUrl =
  typeof window !== "undefined" &&
  /(^|\.)sentryurl\.dev$/i.test(window.location.hostname)
    ? `${window.location.origin}/api`
    : null;

const apiBaseUrl =
  configuredBaseUrl ||
  deployedBaseUrl ||
  "https://api.sentryurl.dev/api";

const API = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ""),
});

export default API;
