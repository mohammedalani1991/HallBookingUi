<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold">Welcome to the Booking App</h1>
    <button @click="logout" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">
      Logout
    </button>
  </div>
</template>

<script>
import Cookies from "js-cookie";

export default {
  methods: {
    logout() {
      Cookies.remove("user_password"); // Remove the stored password
      this.$router.push("/"); // Redirect to password page
    }
  }
};
</script>
