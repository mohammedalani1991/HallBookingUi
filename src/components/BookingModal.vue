<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-sm md:max-w-lg">
      <h2 class="text-xl md:text-2xl font-semibold mb-4 text-center">
        {{ isEditing ? "تعديل الحجز" : "إضافة حجز جديد" }}
      </h2>

      <div class="grid grid-cols-1 gap-2">
        <label class="text-sm">
          <textarea placeholder="عنوان الندوة او الدورة او المحاضرة: " v-model="localBooking.lecturerName"
            class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full">
          </textarea>
        </label>

        <label class="text-sm">
          <select v-model="localBooking.subject"
            class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full">
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
        </label>

        <!-- Date & Time Inputs in One Line -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label class="text-sm w-full">
            التاريخ:
            <input v-model="localBooking.startDate" type="date" @change="syncEndDate"
              class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
          </label>

          <label class="text-sm w-full">
            وقت البدء:
            <input v-model="localBooking.startTime" type="time"
              class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
          </label>

          <label class="text-sm w-full">
            وقت النهاية:
            <input v-model="localBooking.endTime" type="time"
              class="bg-gray-700 border border-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 w-full" />
          </label>
        </div>
      </div>

      <div class="mt-4 flex flex-col md:flex-row md:justify-between gap-2">
        <button @click="saveEvent" :disabled="loading"
          class="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          {{ isEditing ? "حفظ التعديلات" : "إضافة" }}
        </button>

        <button v-if="isEditing" @click="deleteEvent(localBooking.id)" :disabled="loading"
          class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 w-full md:w-auto"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          حذف
        </button>

        <button @click="closeModal" :disabled="loading"
          class="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 w-full md:w-auto"
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
      localBooking: this.cloneBooking(this.booking),
      loading: false,
    };
  },

  watch: {
    booking: {
      handler(newVal) {
        if (newVal) {
          this.localBooking = this.cloneBooking(newVal);

          // Split startTime
          if (newVal.startTime) {
            const [startDate, startTime] = newVal.startTime.split("T");
            this.localBooking.startDate = startDate;
            this.localBooking.startTime = startTime;
          }

          // Split endTime
          if (newVal.endTime) {
            const [endDate, endTime] = newVal.endTime.split("T");
            this.localBooking.endDate = endDate;
            this.localBooking.endTime = endTime;
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    syncEndDate() {
      this.localBooking.endDate = this.localBooking.startDate;
    },
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
      if (!this.localBooking.lecturerName || !this.localBooking.subject ||
        !this.localBooking.startDate || !this.localBooking.startTime ||
        !this.localBooking.endDate || !this.localBooking.endTime) {
        alert("يرجى ملء جميع الحقول المطلوبة.");
        return;
      }

      // Combine date and time before submitting
      this.localBooking.startTime = `${this.localBooking.startDate}T${this.localBooking.startTime}`;
      this.localBooking.endTime = `${this.localBooking.endDate}T${this.localBooking.endTime}`;

      this.loading = true;

      try {
        if (this.isEditing) {
          await axios.put(`https://hallbooking-production-1a31.up.railway.app/api/Booking/${this.localBooking.id}`, this.localBooking);
        } else {
          this.localBooking.id = 0;

          const response = await axios.post("https://hallbooking-production-1a31.up.railway.app/api/Booking", this.localBooking);
          this.localBooking.id = response.data.id;

          this.localBooking.status = "Pending";
        }

        this.$emit("submit", this.localBooking);
        this.closeModal();
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        this.loading = false;
      }
    },
  }
};
</script>
