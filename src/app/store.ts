import { configureStore } from '@reduxjs/toolkit';
import mapSlice from '../features/map/mapSlice';
import pathSlice from '../features/path/pathSlice';

export const store = configureStore({
	reducer: {
		map: mapSlice,
		path: pathSlice,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
