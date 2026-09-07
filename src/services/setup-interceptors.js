import axios from "axios";
import EventBus from "../common/EventBus";

export const SERVICE_UNAVAILABLE_MESSAGE =
  "Service is unavailable. Please check your connection and try again.";

// True when the request never reached the server (offline, DNS failure,
// CORS block, connection refused, timeout) or the server returned 5xx.
export const isServiceUnavailable = (error) => {
  if (!error) return false;
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") return true;
  if (error.code === "ECONNABORTED") return true; // timeout
  if (!error.response) return true;
  return error.response.status >= 500;
};

// Converts any axios/JS error into a message safe to show the user.
export const getFriendlyErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (isServiceUnavailable(error)) return SERVICE_UNAVAILABLE_MESSAGE;
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
};

// Attaches a global response interceptor so that:
//  - an expired / invalid session (HTTP 401 / 403) logs the user out
//  - a network / server-down error is normalised to a friendly message
const setupInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        // Session expired or token rejected -> force logout.
        EventBus.dispatch("logout");
      }

      if (isServiceUnavailable(error)) {
        error.friendlyMessage = SERVICE_UNAVAILABLE_MESSAGE;
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
