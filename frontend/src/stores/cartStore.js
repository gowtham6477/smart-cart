import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      bookingDraft: null,
      selectedService: null,
      selectedPackage: null,
      selectedDate: null,
      selectedTime: null,
      address: null,
      couponCode: null,
      discount: 0,

      // Set booking draft
      setBookingDraft: (draft) => set({ bookingDraft: draft }),

      // Set service
      setSelectedService: (service) => set({ selectedService: service }),

      // Set package
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),

      // Set date and time
      setDateTime: (date, time) => set({ selectedDate: date, selectedTime: time }),

      // Set address
      setAddress: (address) => set({ address }),

      // Apply coupon
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),

      // Remove coupon
      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      // Get total price
      getTotalPrice: () => {
        const { selectedPackage, discount } = get();
        if (!selectedPackage) return 0;
        const price = selectedPackage.price || 0;
        return Math.max(0, price - discount);
      },

      // Clear cart
      clearCart: () => set({
        bookingDraft: null,
        selectedService: null,
        selectedPackage: null,
        selectedDate: null,
        selectedTime: null,
        address: null,
        couponCode: null,
        discount: 0,
      }),

      // Get booking data for API
      getBookingData: () => {
        const state = get();
        return {
          serviceId: state.selectedService?.id,
          packageId: state.selectedPackage?.id,
          serviceDate: state.selectedDate,
          serviceTime: state.selectedTime,
          serviceAddress: state.address?.fullAddress || state.address,
          city: state.address?.city,
          pincode: state.address?.pincode,
          customerNote: state.bookingDraft?.note,
          couponCode: state.couponCode,
        };
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;

