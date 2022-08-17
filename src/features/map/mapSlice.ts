import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type MapManager = {
	mapInstance: any;
};

const initialState: MapManager = {
	mapInstance: null,
};

export const mapSlice = createSlice({
	name: 'map',
	initialState,
	reducers: {
		SET_MAP_INSTANCE: (state, action: PayloadAction<any>) => {
			state.mapInstance = action.payload;
		},
	},
});

export const { SET_MAP_INSTANCE } = mapSlice.actions;

export default mapSlice.reducer;
