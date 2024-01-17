import axios from "axios";

const jwtAxios = axios.create({
  baseURL: process.env.REACT_APP_BASEURL, // YOUR_API_URL HERE
  headers: {
    "Content-Type": "application/json",
  },
});
jwtAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.data.msg === "Token is not valid") {
    }
    return Promise.reject(err);
  }
);
export const setAuthToken = (token?: string) => {
  if (token) {
    jwtAxios.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete jwtAxios.defaults.headers.common.Authorization;
  }
};

export default jwtAxios;
