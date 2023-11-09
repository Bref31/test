import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import reducers from './slices';

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ephemeris/addOne', 'eligibilities/setOne', 'eligibilities/setLoading'],
        ignoredPaths: ['ephemeris.data'],
        ignoredActionPaths: ['payload.horizon', 'payload.ephemeris', 'payload.eligibilities'],
      },
    }),
});

export default store;
export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
