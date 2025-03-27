<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-center text-gray-100 mb-6">📅 إدارة الأحداث</h1>

    <!-- Controls Section -->
    <div class="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <!-- Add Event Button -->
      <div>
        <button @click="openModal()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition">
          ➕ إضافة حدث جديد
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="relative">
          <input v-model="searchQuery" @input="resetPagination"
            class="pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ابحث عن الأحداث..." />
          <span class="absolute left-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>

        <!-- Status Filter -->
        <select v-model="statusFilter" @change="resetPagination"
          class="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">كل الحالات</option>
          <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>
    </div>

    <!-- Events Table for Larger Screens -->
    <div class="hidden md:block">
      <div class="overflow-x-auto bg-gray-800 shadow-md rounded-lg p-4">
        <table class="table-auto w-full text-gray-300">
          <thead>
            <tr class="bg-gray-700">
              <th class="px-4 py-2">📌 العنوان</th>
              <th class="px-4 py-2">📚 القسم</th>
              <th class="px-4 py-2">🚦 الحالة</th>
              <th class="px-4 py-2">⚙️ التحكم</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in paginatedEvents" :key="event.id"
              class="border-b border-gray-600 hover:bg-gray-700 transition">
              <td class="px-4 py-2">{{ event.lecturerName }}</td>
              <td class="px-4 py-2">{{ event.subject }}</td>
              <td class="px-4 py-2">
                <select v-model="event.status" @change="updateEventStatus(event)"
                  class="bg-gray-700 text-white px-2 py-1 rounded">
                  <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
                </select>
              </td>
              <td class="px-4 py-2 space-x-2">
                <button @click="openEditModal(event)"
                  class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">✏️ تعديل</button>
                <button @click="deleteEvent(event.id)"
                  class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">🗑️ حذف</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4 text-gray-300">
          <div>
            عرض {{ (currentPage - 1) * itemsPerPage + 1 }} إلى {{ Math.min(currentPage * itemsPerPage,
              filteredEvents.length) }} من {{ filteredEvents.length }} حدث
          </div>
          <div class="flex space-x-2">
            <button @click="prevPage" :disabled="currentPage === 1"
              class="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">
              السابق
            </button>
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
              :class="['px-3 py-1 rounded', page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700']">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Responsive Cards for Small Screens -->
    <div class="md:hidden space-y-4">
      <div v-for="event in paginatedEvents" :key="event.id" class="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 class="text-lg text-white font-semibold">📌 {{ event.lecturerName }}</h3>
        <p class="text-gray-300">📚 {{ event.subject }}</p>
        <div class="mt-2 flex justify-between items-center">
          <select v-model="event.status" @change="updateEventStatus(event)"
            class="bg-gray-700 text-white px-2 py-1 rounded">
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
          </select>
          <div class="space-x-2">
            <button @click="openEditModal(event)"
              class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">✏️ تعديل</button>
            <button @click="deleteEvent(event.id)" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded">🗑️
              حذف</button>
          </div>
        </div>
      </div>

      <!-- Pagination for Mobile -->
      <div class="flex justify-between items-center mt-4 text-gray-300">
        <button @click="prevPage" :disabled="currentPage === 1"
          class="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">
          السابق
        </button>
        <span>الصفحة {{ currentPage }} من {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-3 py-1 bg-gray-700 rounded disabled:opacity-50">
          التالي
        </button>
      </div>
    </div>

    <!-- BookingModal Component -->
    <BookingModal :show="showModal" :isEditing="isEditing" :booking="booking" @close="showModal = false"
      @submit="handleEventSave" />
  </div>
</template>

<script>
import axios from "axios";
import BookingModal from "../components/BookingModal.vue";

export default {
  components: {
    BookingModal,
  },
  data() {
    return {
      isEditing: false,
      events: [],
      statuses: ["Pending", "Approved", "Completed", "Cancelled"],
      showModal: false,
      selectedEvent: null,
      booking: {
        id: null,
        lecturerName: "",
        subject: "",
        startTime: "",
        endTime: "",
        status: "Pending",
      },
      // Search and Filter
      searchQuery: "",
      statusFilter: "",
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      maxVisiblePages: 5,
    };
  },
  computed: {
    filteredEvents() {
      let filtered = this.events;

      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(event => event.status === this.statusFilter);
      }

      // Apply search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(event =>
          event.lecturerName.toLowerCase().includes(query) ||
          event.subject.toLowerCase().includes(query))
      }

      return filtered;
    },
    paginatedEvents() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredEvents.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    },
    visiblePages() {
      const range = [];
      const half = Math.floor(this.maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

      // Adjust if we're at the end
      if (end - start + 1 < this.maxVisiblePages) {
        start = Math.max(1, end - this.maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      return range;
    }
  },
  methods: {
    resetPagination() {
      this.currentPage = 1;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    openEditModal(info) {
      this.isEditing = true;
      const toLocalISOString = (date) => {
        if (!date) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 16);
      };

      let event = this.events.find(e => e.id === info.id);

      this.selectedEvent = event;

      this.booking = {
        id: event.id,
        lecturerName: event.lecturerName || "",
        subject: event.subject || "",
        startTime: event.startTime ? toLocalISOString(new Date(event.startTime)) : "",
        endTime: event.endTime ? toLocalISOString(new Date(event.endTime)) : "",
        status: event.status || "Pending",
      };

      this.showModal = true;
    },
    handleEventSave(updatedBooking) {
      console.log("Saved event:", updatedBooking);

      if (this.isEditing) {
        let eventIndex = this.events.findIndex(e => e.id === updatedBooking.id);
        if (eventIndex !== -1) {
          this.events[eventIndex] = { ...updatedBooking };
        }
      } else {
        this.events.push({
          id: updatedBooking.id,
          lecturerName: updatedBooking.lecturerName,
          subject: updatedBooking.subject,
          startTime: updatedBooking.startTime,
          endTime: updatedBooking.endTime,
          status: updatedBooking.status || "Pending",
        });
      }

      this.showModal = false;
    },
    async fetchEvents() {
      try {
        const response = await axios.get("https://hallbooking-production-1a31.up.railway.app/api/Booking");
        this.events = response.data;
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },
    openModal() {
      this.isEditing = false;
      this.selectedEvent = null;
      this.booking = {
        id: null,
        lecturerName: "",
        subject: "",
        startTime: "",
        endTime: "",
        status: "Approved",
      };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async handleSave(event) {
      try {
        if (event.id) {
          await axios.put(
            `https://hallbooking-production-1a31.up.railway.app/api/Booking`,
            event
          );
        } else {
          await axios.post(
            "https://hallbooking-production-1a31.up.railway.app/api/Booking",
            event
          );
        }
        this.closeModal();
        this.fetchEvents();
      } catch (error) {
        console.error("Error saving event:", error);
      }
    },
    async updateEventStatus(event) {
      try {
        await axios.put(`https://hallbooking-production-1a31.up.railway.app/api/Booking/${event.id}`, event);
      } catch (error) {
        console.error("Error updating status:", error);
      }
    },
    async deleteEvent(id) {
      if (confirm("هل أنت متأكد من حذف هذا الحدث؟")) {
        try {
          await axios.delete(
            `https://hallbooking-production-1a31.up.railway.app/api/Booking/${id}`
          );
          this.fetchEvents();
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      }
    },
  },
  mounted() {
    this.fetchEvents();
  },
};
</script>

<style scoped>
/* Styling */
.btn {
  padding: 8px 12px;
  margin-right: 8px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
}

.table-auto th,
.table-auto td {
  padding: 12px;
  border: 1px solid #ddd;
}
</style>
