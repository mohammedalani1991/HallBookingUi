<template>
  <div class="flex justify-center py-2 px-2">
    <button @click="openCreateModal"
      class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:bg-blue-700 hover:scale-105 active:bg-blue-800">
      حجز جديد
    </button>

  </div>
  <BookingModal :show="showModal" :isEditing="isEditing" :booking="booking" @close="showModal = false"
    @delete="handleEventDelete" @submit="handleEventSave" />
  <FullCalendar :options="calendarOptions" />


</template>

<script>
import axios from "axios";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingModal from "./BookingModal.vue";
import { ref } from 'vue';
var eventInfo = null;

export default {
  setup() {
    const eventInfo = ref(null);

    return {
      eventInfo
    };
  },
  components: {
    FullCalendar,
    BookingModal,
  },
  data() {
    return {
      showModal: false,
      isEditing: false,
      selectedEvent: null,
      booking: {
        id: null,
        lecturerName: "",
        subject: "",
        startTime: "",
        endTime: "",
        status: "Pending",
      },
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        events: [],
        // dateClick: this.openCreateModal,
        eventClick: this.openEditModal,
        displayEventEnd: true,
        aspectRatio: 2,  // Adjust the value (lower value shrinks the cells)
        contentHeight: "auto", // Manually control height
        locale: "ar",
      },

    };
  },
  methods: {

    openCreateModal(info) {
      this.isEditing = false;
      this.selectedEvent = null;
      this.booking = {
        id: null,
        lecturerName: "",
        subject: "",
        startTime: info.dateStr, // Set start time to clicked date
        endTime: info.dateStr, // Set end time same as start (adjustable)
        status: "Pending",
      };
      this.showModal = true;
    },

    openEditModal(info) {
      this.isEditing = true;
      this.selectedEvent = info.event;
      // var x = this.calendarOptions.events[info.event.id]
      const toLocalISOString = (date) => {
        if (!date) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
      };
      let event = this.calendarOptions.events.find(e => e.id === Number(info.event.id));
      console.log(event);

      eventInfo = info;
      console.log("edit" + info);

      this.booking = {
        id: event.id,
        lecturerName: event.extendedProps.lecturerName || "",
        subject: event.extendedProps.subject || "",
        startTime: event.start ? toLocalISOString(new Date(event.start)) : "",
        endTime: event.end ? toLocalISOString(new Date(event.end)) : "",
        status: event.extendedProps.status || "Pending",
      };

      this.showModal = true;
    },
    handleEventDelete(eventId) {
      console.log("delete" + eventInfo);
      eventInfo.event.remove();
      let index = this.calendarOptions.events.findIndex(e => e.id === Number(eventId));
      if (index !== -1) {
        this.calendarOptions.events.splice(index, 1);
      }
    },
    handleEventSave(updatedBooking) {
      if (this.isEditing) {
        // Update the event in the calendar
        let event = this.calendarOptions.events.find(e => e.id === Number(updatedBooking.id));
        console.log(event);
        event.title = updatedBooking.lecturerName + " - " + updatedBooking.subject;
        event.extendedProps.lecturerName = updatedBooking.lecturerName;
        event.extendedProps.subject = updatedBooking.subject;
        event.start = updatedBooking.startTime;
        event.end = updatedBooking.endTime;
        this.selectedEvent.setProp("title", updatedBooking.lecturerName + " - " + updatedBooking.subject);
        this.selectedEvent.setDates(updatedBooking.startTime, updatedBooking.endTime);
        console.log(event);

      } else {
        // Add new event to the calendar
        this.calendarOptions.events.push({
          id: updatedBooking.id,
          title: `${updatedBooking.lecturerName} - ${updatedBooking.subject}`,
          start: updatedBooking.startTime,
          end: updatedBooking.endTime,
          color: "#C2185B",
          extendedProps: {
            subject: updatedBooking.subject,
            lecturerName: updatedBooking.lecturerName,
            status: updatedBooking.status,
          },
        });
      }
      this.showModal = false;
    },
  },
  async mounted() {
    try {
      const response = await axios.get("https://hallbooking-production-1a31.up.railway.app/api/Booking");
      this.calendarOptions.events = response.data.map((booking) => ({
        id: booking.id,
        title: `${booking.lecturerName} - ${booking.subject}`,
        start: booking.startTime,
        end: booking.endTime,
        color: "#C2185B",
        extendedProps: {
          subject: booking.subject,
          lecturerName: booking.lecturerName,
          status: booking.status,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  },
};
</script>
<style>
.fc-daygrid-event {
  display: flex;
  flex-direction: column;
  /* Stack time above the title */
  align-items: center;
  /* Center-align text */
  text-align: center;
  /* Ensure text stays centered */
}


.fc-event-title {
  white-space: normal;
  /* Ensure title wraps */
}
</style>
