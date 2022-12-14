import React, { useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { CLEAR_POLYLINE, DRAW_POLYLINE, Path, REORDER_PATH } from '../../features/path/pathSlice';
import './PathList.scss';

type PathCardProps = {
	idx: number;
	pathData: Path;
	isShared: boolean;
};

function PathCard({ pathData, idx, isShared }: PathCardProps) {
	const { kakao } = window;
	const mapSelector = useAppSelector((state) => state.map.mapInstance);

	const panToPath = (_data: Path) => {
		const convertX = Number(_data.x);
		const convertY = Number(_data.y);
		const moveLatLng = new kakao.maps.LatLng(convertY, convertX);
		mapSelector.panTo(moveLatLng);
	};

	return (
		<div
			role="button"
			tabIndex={idx}
			className="path-card"
			style={{ cursor: isShared ? 'pointer' : 'move' }}
			onClick={() => panToPath(pathData)}
			onKeyDown={() => panToPath(pathData)}
		>
			<div className="path-idx">{idx + 1}</div>
			<div className="path-name">{pathData.place_name}</div>
		</div>
	);
}

function PathList() {
	const { kakao } = window;
	const [isShared, setIsShared] = useState<boolean>(false);
	const dispatch = useAppDispatch();
	const mapSelector = useAppSelector((state) => state.map.mapInstance);
	const pathListSelector = useAppSelector((state) => state.path.path);

	useEffect(() => {
		const searchParams = decodeURI(window.location.pathname);

		if (searchParams.indexOf('/', 1) > -1) {
			setIsShared(true);
		}
	}, []);

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

			// ????????? ????????? ?????? ???????????????
			const polyline = new kakao.maps.Polyline({
				path: pathArr, // ?????? ???????????? ???????????? ?????????
				endArrow: true,
				strokeWeight: 5, // ?????? ?????? ?????????
				strokeColor: '#ff0000', // ?????? ???????????????
				strokeOpacity: 0.6, // ?????? ???????????? ????????? 1?????? 0 ????????? ????????? 0??? ??????????????? ???????????????
				strokeStyle: 'solid', // ?????? ??????????????????
			});

			// ????????? ?????? ???????????????
			polyline.setMap(mapSelector);
			dispatch(DRAW_POLYLINE(polyline));
		}

		mapSelector?.setBounds(bounds);
	}, [dispatch, kakao.maps.LatLng, kakao.maps.LatLngBounds, kakao.maps.Polyline, mapSelector, pathListSelector]);

	return (
		<div className="path-zone">
			<ReactSortable
				list={pathListSelector.map((x) => ({ ...x, chosen: true }))}
				setList={(newState) => dispatch(REORDER_PATH(newState))}
				animation={200}
			>
				{pathListSelector.map((path: Path, idx) => (
					<PathCard
						// eslint-disable-next-line react/no-array-index-key
						key={`${path.id}_${idx}`}
						pathData={path}
						idx={idx}
						isShared={isShared}
					/>
				))}
			</ReactSortable>
		</div>
	);
}

export default PathList;
