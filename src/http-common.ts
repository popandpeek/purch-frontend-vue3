import axios from "axios";

const instance = axios.create({
  baseURL: "http://0.0.0.0:8005/",
});

instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers.put["Content-Type"] = "application/json";
instance.interceptors.response.use(
  (response) => {
    if (
      response.status === 401 &&
      localStorage.getItem("token_expires") &&
      Date.parse(JSON.parse(localStorage.getItem("token_expires")!)) > Date.now()
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires");
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data) {
      //add your code
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
  }
);

export default instance;
