import { createRouter, createWebHistory } from 'vue-router'
import PasswordPage from '../views/PasswordPage.vue'
import Dashboard from '../views/Dashboard.vue'
import BookingPage from '../views/BookingPage.vue'
import Booking from '../views/Booking.vue'

import Cookies from 'js-cookie'

const routes = [
  { path: '/', component: PasswordPage },
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      const savedPassword = Cookies.get('user_password')
      if (savedPassword === '1234') {
        next()
      } else {
        next('/')
      }
    },
  },
  {
    path: '/Adminbookings',
    component: BookingPage,
    beforeEnter: (to, from, next) => {
      const savedPassword = Cookies.get('user_password')
      if (savedPassword === '1234') {
        next()
      } else {
        next('/')
      }
    },
  },
  {
    path: '/bookings',
    component: Booking,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
