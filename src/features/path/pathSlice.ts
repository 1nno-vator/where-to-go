import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Path = {
	id: string;
	place_name: string;
	road_address_name: string;
	x: string;
	y: string;
};

export type PathProps = {
	path: Path[];
	markers: any[];
	polyLines: any[];
};

const initialState: PathProps = {
	path: [],
	markers: [],
	polyLines: [],
};

export const pathSlice = createSlice({
	name: 'path',
	initialState,
	reducers: {
		ADD_PATH: (state, action: PayloadAction<Path>) => {
			state.path = [...state.path, action.payload];
		},
		CLEAR_PATH: (state) => {
			state.path = [];
		},
		REORDER_PATH: (state, action: PayloadAction<Path[]>) => {
			state.path = action.payload;
		},
		ADD_MARKER: (state, action: PayloadAction<any>) => {
			state.markers = [...state.markers, action.payload];
		},
		CLEAR_MARKERS: (state) => {
			state.markers?.forEach((marker) => {
				marker.setMap(null);
			});
			state.markers = [];
		},
		DRAW_POLYLINE: (state, action: PayloadAction<any>) => {
			state.polyLines = [...state.polyLines, action.payload];
		},
		CLEAR_POLYLINE: (state) => {
			state.polyLines?.forEach((line) => {
				line.setMap(null);
			});
			state.polyLines = [];
		},
	},
});

export const { ADD_PATH, CLEAR_PATH, REORDER_PATH, ADD_MARKER, CLEAR_MARKERS, DRAW_POLYLINE, CLEAR_POLYLINE } =
	pathSlice.actions;

export default pathSlice.reducer;
