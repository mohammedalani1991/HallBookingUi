<template>
  <div class="booking-container">
    <!-- Header -->
    <div class="booking-header">
      <img src="/src/Al-Maarif Logo.png" alt="University Logo">
      <h4>جامعة المعارف - حجز قاعة التعليم المستمر </h4>
    </div>

    <!-- Event Calendar -->
    <div class="booking-calendar">
      <EventCalendar @date-selected="handleDateSelected" class="w-full h-full" />
    </div>

    <!-- Booking Form -->

  </div>
</template>

<script>
import EventCalendar from '../components/EventCalendarUser.vue';
import { useToast } from 'vue-toastification';

export default {
  setup() {
    const toast = useToast();

    const showSuccess = () => {
      toast.success('تم الحجز بنجاح!');
    };

    return { showSuccess };
  },
  components: {
    EventCalendar,
  },
  data() {
    return {
      selectedDate: null,
      newBooking: {
        lecturer: '',
        topic: '',
        date: '',
        time: '',
      },
      bookings: [],
    };
  },
};
</script>
