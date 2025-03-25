<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-4 rounded-lg shadow-lg w-80 text-center">
      <h2 class="text-lg font-bold">{{ formatTime(booking?.start) }}</h2>
      <h2 class="text-lg font-bold">{{ booking?.title || 'No Title' }}</h2>
      <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded" @click="$emit('close')">اغلاق</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    booking: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    formatTime(date) {
      if (!date) return '';
      // Format the time using toLocaleTimeString
      const time = new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Replace AM/PM with ص and م respectively
      return time.replace('AM', 'ص').replace('PM', 'م');
    },
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
