<template>
  <div class="h-screen flex justify-center items-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-xl font-semibold text-center mb-4">Enter Access Password</h2>
      <input type="password" v-model="password" placeholder="Enter password" class="border p-2 w-full rounded" />
      <button @click="checkPassword" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full">
        Submit
      </button>
      <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";

export default {
  data() {
    return {
      password: "",
      correctPassword: "1234", // Change this to the actual password
      errorMessage: "",
    };
  },
  created() {
    // Auto-redirect if the password cookie exists and is correct
    const savedPassword = Cookies.get("user_password");
    if (savedPassword === this.correctPassword) {
      this.$router.push("/Adminbookings");
    }
  },
  methods: {
    checkPassword() {
      if (this.password === this.correctPassword) {
        Cookies.set("user_password", this.password, { expires: 7 }); // Save for 7 days
        this.$router.push("/Adminbookings"); // Redirect to dashboard
      } else {
        this.errorMessage = "Incorrect password. Try again.";
      }
    }
  }
};
</script>
