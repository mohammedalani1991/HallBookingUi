<template>
  <div class="flex justify-center py-2 px-2">

  </div>

  <FullCalendar :options="calendarOptions" />

  <BookingModal :show="showModal" :booking="selectedEvent" @close="showModal = false" />
</template>

<script>
import axios from "axios";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import BookingModal from "./EventTitleModal.vue";
import { ref } from "vue";

export default {
  setup() {
    const eventInfo = ref(null);
    return { eventInfo };
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
      screenWidth: window.innerWidth,
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        events: [],
        // displayEventEnd: true,
        aspectRatio: 2,
        contentHeight: "auto",
        locale: "ar",
        eventClick: this.openEventModal,
        eventDidMount: this.modifyEventTitle,
      },
    };
  },
  methods: {
    openEventModal(event) {
      this.selectedEvent = event.event;
      this.booking = {
        id: event.event.id,
        lecturerName: event.event.extendedProps.lecturerName,
        subject: event.event.extendedProps.subject,
        startTime: event.event.start,
        endTime: event.event.end,
        status: event.event.extendedProps.status,
      };
      this.showModal = true;
    },
    modifyEventTitle(info) {
      if (this.screenWidth < 1100) {
        info.el.querySelector(".fc-event-title").style.display = "none";
        info.el.querySelector(".fc-event-time").style.fontSize = "xx-small";


        info.el.innerHTML += "<span class='dot-event'>... </span>"; // Show a dot instead
      }
    },
    updateScreenWidth() {
      this.screenWidth = window.innerWidth;
    },
  },
  async mounted() {
    try {
      const response = await axios.get("https://hallbooking-production-1a31.up.railway.app/api/Booking");
      this.calendarOptions.events = response.data
        .filter(booking => booking.status === "Aproved" || "Completed") // Filtering step
        .map(booking => ({
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

    // Listen for screen resize
    window.addEventListener("resize", this.updateScreenWidth);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
  },
};
</script>

<style>
/* Style for the dot */
.dot-event {
  font-size: 20px;
  font-weight: bold;
  display: block;
  text-align: center;
}
</style>
