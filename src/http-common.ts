import axios from "axios";

export default axios.create({
  baseURL: "http://0.0.0.0:8007/",
  headers: {
    "Content-type": "application/json"
  }
});