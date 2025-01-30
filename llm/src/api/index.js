import axios from "axios";

const instance = axios.create({
  baseURL: "api",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer viSMGoufLRBfgvTzKrWS:jRGcrKPPguqZfgDPhZLp",
  },
  transformRequest: [
    function (data) {
      // console.log("transformRequest", data);
      return JSON.stringify(data);
    },
  ],
  responseType: "stream",
});

export default instance;
