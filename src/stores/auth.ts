import { defineStore } from "pinia";
import instance from "@/http-common";
import { router } from "@/router";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    token: null as any,
    token_expiration: null as any,
    returnUrl: null as any,
    error: null as any,
  }),
  actions: {
    async login(username: String, password: String) {
      const data = JSON.stringify({ username: username, password: password });
      const user = await instance
        .post("/auth", data)
        .catch((error) => {
          console.error("There was an error!", error);
        });
      if (user == null) {
        this.error = "Could not find user.";
        return false;
      }

      // update pinia state
      this.error = null;
      this.token = user.data.access_token;
      this.token_expiration = user.data.expires;

      // store user details and jwt in local storage to keep user logged in between page refreshes
      localStorage.setItem("token", JSON.stringify(user.data.access_token));
      localStorage.setItem("token_expires", JSON.stringify(user.data.expires));

      // redirect to previous url or default to home page
      router.push(this.returnUrl || "/orders");
    },
    logout() {
      this.error = null;
      this.token = null;
      this.token_expiration = null;
      localStorage.removeItem("token");
      localStorage.removeItem("token_expires");
      router.push("/login");
    },
  },
});
