import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { VariantType as NotifType } from 'notistack';

export interface StoreNotification {
  status: NotifType;
  message: string | null;
}

const initialState: StoreNotification = {
  status: 'default',
  message: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    default: (state, action: PA<string>) => {
      state.status = 'default';
      state.message = action.payload;
    },
    error: (state, action: PA<string>) => {
      state.status = 'error';
      state.message = action.payload;
    },
    success: (state, action: PA<string>) => {
      state.status = 'success';
      state.message = action.payload;
    },
    warning: (state, action: PA<string>) => {
      state.status = 'warning';
      state.message = action.payload;
    },
    info: (state, action: PA<string>) => {
      state.status = 'info';
      state.message = action.payload;
    },
  },
});

const notificationsActions = notificationsSlice.actions;

export { notificationsActions };
export default notificationsSlice;
