import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLEAR_POLYLINE, DRAW_POLYLINE, Path } from '../../features/path/pathSlice';
import './PathList.scss';

type PathCardProps = {
	idx: number;
	pathData: Path;
};

function PathCard({ pathData, idx }: PathCardProps) {
	return (
		<div className="path-card">
			<div className="path-idx">{idx}</div>
			<div className="path-name">{pathData.place_name}</div>
		</div>
	);
}

function PathList() {
	const { kakao } = window;
	const dispatch = useAppDispatch();
	const mapSelector = useAppSelector((state) => state.map.mapInstance);
	const pathListSelector = useAppSelector((state) => state.path.path);

	useEffect(() => {
		dispatch(CLEAR_POLYLINE());

		if (pathListSelector.length < 2) {
			return;
		}

		const bounds = new kakao.maps.LatLngBounds();
		const linePathArr = pathListSelector.map((path: Path) => {
			const point = new kakao.maps.LatLng(Number(path.y), Number(path.x));
			bounds.extend(point);
			return point;
		});

		for (let i = 0; i < linePathArr.length - 1; i++) {
			const pathArr = [];
			const from = linePathArr[i];
			const to = linePathArr[i + 1];
			pathArr.push(from);
			pathArr.push(to);

			// 지도에 표시할 선을 생성합니다
			const polyline = new kakao.maps.Polyline({
				path: pathArr, // 선을 구성하는 좌표배열 입니다
				endArrow: true,
				strokeWeight: 5, // 선의 두께 입니다
				strokeColor: '#ff0000', // 선의 색깔입니다
				strokeOpacity: 0.6, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
				strokeStyle: 'solid', // 선의 스타일입니다
			});

			// 지도에 선을 표시합니다
			polyline.setMap(mapSelector);
			dispatch(DRAW_POLYLINE(polyline));
		}

		mapSelector?.setBounds(bounds);
	}, [dispatch, kakao.maps.LatLng, kakao.maps.LatLngBounds, kakao.maps.Polyline, mapSelector, pathListSelector]);

	const pathListRenderer = (): JSX.Element[] => {
		return pathListSelector.map((path: Path, idx: number) => {
			// eslint-disable-next-line react/no-array-index-key
			return <PathCard key={`${path.id}_${idx}`} pathData={path} idx={idx} />;
		});
	};

	return <div className="path-zone">{pathListRenderer()}</div>;
}

export default PathList;
