import axios from "axios";

const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("EchozChat-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        localStorage.removeItem("EchozChat-token");
        localStorage.removeItem("EchozChat-user");
        localStorage.removeItem("whatapp-selectedchat");

        window.location.href = "/auth";
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
