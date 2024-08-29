import { configureStore } from '@reduxjs/toolkit';
import followReducer from './followSlice';

const store = configureStore({
  reducer: {
    follow: followReducer,
  },
});

export default store;
