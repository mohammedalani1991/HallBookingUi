<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 h-screen">
    <div class="bg-gray-800 text-white rounded-lg shadow-lg p-8 w-full max-w-lg">
      <h2 class="text-2xl font-semibold mb-6 text-center">
        {{ isEditing ? "تعديل الحجز" : "إضافة حجز جديد" }}
      </h2>

      <div class="grid grid-cols-1 gap-4">
        <textarea v-model="localBooking.lecturerName" placeholder="عنوان الندوة او الدورة او المحاضرة"
          class="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>

        <select v-model="localBooking.subject"
          class="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>اختر القسم</option>
          <option value="طب الأسنان">طب الأسنان</option>
          <option value="الصيدلة">الصيدلة</option>
          <option value="تقنيات المختبرات الطبية">تقنيات المختبرات الطبية</option>
          <option value="التمريض">التمريض</option>
          <option value="الهندسة المدني">الهندسة المدني</option>
          <option value="هندسة تقنيات الحاسوب">هندسة تقنيات الحاسوب</option>
          <option value="هندسة تقنيات الأجهزة الطبية">هندسة تقنيات الأجهزة الطبية</option>
          <option value="علوم الحاسوب">علوم الحاسوب</option>
          <option value="التربية البدنية وعلوم الرياضة">التربية البدنية وعلوم الرياضة</option>
          <option value="القانون">القانون</option>
          <option value="اللغة الانجليزية">اللغة الانجليزية</option>
          <option value="اللغة العربية">اللغة العربية</option>
          <option value="العلوم المالية والمصرفية">العلوم المالية والمصرفية</option>
          <option value="قسم إدارة الأعمال">قسم إدارة الأعمال</option>
        </select>

        <label class="text-sm">وقت البدء:</label>
        <input v-model="localBooking.startTime" type="datetime-local"
          class="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500" />
        <label class="text-sm">وقت النهاية:</label>
        <input v-model="localBooking.endTime" type="datetime-local"
          class="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500" />

      </div>

      <select v-model="localBooking.status"
        class="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 hidden">
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Cancelled</option>
      </select>
      <div class="mt-6 flex justify-between">
        <button @click="saveEvent" :disabled="loading"
          class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          {{ isEditing ? "حفظ التعديلات" : "إضافة" }}
        </button>

        <button v-if="isEditing" @click="deleteEvent(localBooking.id)" :disabled="loading"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          حذف
        </button>

        <button @click="closeModal" :disabled="loading"
          class="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          إغلاق
        </button>
      </div>
    </div>


  </div>

</template>

<script>
import axios from "axios";

export default {
  props: {
    show: Boolean,
    isEditing: Boolean,
    booking: Object,
  },
  emits: ["close", "submit"],
  data() {
    return {
      localBooking: this.cloneBooking(this.booking), // Ensure deep copy
      loading: false, // Loading state to disable buttons
    };
  },
  watch: {
    booking: {
      handler(newVal) {
        this.localBooking = this.cloneBooking(newVal);
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {

    async deleteEvent(eventId) {
      this.loading = true; // Set loading to true
      try {
        await axios.delete(`https://hallbooking-production-1a31.up.railway.app/api/Booking/${eventId}`);
        this.closeModal();
        this.$emit("delete", eventId); // Emit localBooking instead of booking
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        this.loading = false; // Set loading back to false after the operation completes
      }
    },

    closeModal() {
      this.$emit("close");
    },

    cloneBooking(booking) {
      return booking ? JSON.parse(JSON.stringify(booking)) : {}; // Deep copy to avoid mutation
    },

    async saveEvent() {
      // Validate required fields
      if (!this.localBooking.lecturerName || !this.localBooking.subject || !this.localBooking.startTime || !this.localBooking.endTime) {
        alert("يرجى ملء جميع الحقول المطلوبة."); // You can change the alert message if needed
        return;
      }

      this.loading = true; // Set loading to true

      try {
        if (this.isEditing) {
          // Edit existing event
          await axios.put(`https://hallbooking-production-1a31.up.railway.app/api/Booking/${this.localBooking.id}`, this.localBooking);
        } else {
          this.localBooking.id = 0;
          // Create new event
          const response = await axios.post("https://hallbooking-production-1a31.up.railway.app/api/Booking", this.localBooking);
          this.localBooking.id = response.data.id;
        }

        this.$emit("submit", this.localBooking); // Emit localBooking instead of booking
        this.closeModal();
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        this.loading = false; // Set loading back to false after the operation completes
      }
    },
  }
};
</script>
