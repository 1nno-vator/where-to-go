import React, { useEffect, useState } from 'react';
import './App.scss';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import ListCard from './components/ListCard/ListCard';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { SET_MAP_INSTANCE } from './features/map/mapSlice';
import PathList from './components/PathList/PathList';
import { ADD_MARKER, ADD_PATH, CLEAR_MARKERS, CLEAR_PATH, CLEAR_POLYLINE } from './features/path/pathSlice';

declare global {
	interface Window {
		kakao: any;
	}
}

type SearchResult = {
	address_name: string;
	category_group_code: string;
	category_group_name: string;
	category_name: string;
	distance: string;
	id: string;
	phone: string;
	place_name: string;
	place_url: string;
	road_address_name: string;
	x: string;
	y: string;
};

const DOMAIN = 'http://localhost:3000/';

function App() {
	const { kakao } = window;
	const ps = new kakao.maps.services.Places();

	const dispatch = useAppDispatch();
	const pathListSelector = useAppSelector((state) => state.path.path);
	const mapSelector = useAppSelector((state) => state.map.mapInstance);
	const markersSelector = useAppSelector((state) => state.path.markers);

	const [isShared, setIsShared] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>('');
	const [shareButtonDisabled, setSharedButtonDisabled] = useState<boolean>(true);
	const [render, setRender] = useState<JSX.Element[] | null>();

	useEffect(() => {
		const searchParams = decodeURI(window.location.pathname);

		if (markersSelector.length === 0) {
			if (searchParams.indexOf('/') > -1) {
				setIsShared(true);
				const pathObjArr = searchParams
					.split('/')
					.filter((v) => v)
					.map((pathStr) => {
						const path = pathStr.split(',');
						return {
							id: path[0],
							place_name: path[1],
							road_address_name: path[2],
							x: path[3],
							y: path[4],
						};
					});

				for (let i = 0; i < pathObjArr.length; i++) {
					dispatch(ADD_PATH(pathObjArr[i]));
					const markerProps = {
						id: pathObjArr[i].id,
						title: pathObjArr[i].place_name,
						latlng: new kakao.maps.LatLng(Number(pathObjArr[i].y), Number(pathObjArr[i].x)),
					};

					// 마커 이미지의 이미지 주소입니다
					const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';

					// 마커 이미지의 이미지 크기 입니다
					const imageSize = new kakao.maps.Size(24, 35);

					// 마커 이미지를 생성합니다
					const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

					const find = markersSelector.find((v) => v.getTitle() === pathObjArr[i].place_name);

					if (!find) {
						// 마커를 생성합니다
						const marker = new kakao.maps.Marker({
							map: mapSelector, // 마커를 표시할 지도
							position: markerProps.latlng, // 마커를 표시할 위치
							title: markerProps.title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
							image: markerImage, // 마커 이미지
						});
						dispatch(ADD_MARKER(marker));
					} else {
						//
					}
				}
			}
			setIsShared(false);
		}
	}, [
		dispatch,
		kakao.maps.LatLng,
		kakao.maps.Marker,
		kakao.maps.MarkerImage,
		kakao.maps.Size,
		mapSelector,
		markersSelector,
	]);

	useEffect(() => {
		if (pathListSelector.length > 1) {
			setSharedButtonDisabled(false);
		} else {
			setSharedButtonDisabled(true);
		}
	}, [pathListSelector]);

	const searchTabRender = (data: SearchResult[]) => {
		const renderData = data.map((v) => {
			// return <div key={v.id}>{v.place_name}</div>;
			return (
				<ListCard
					key={v.id}
					place_name={v.place_name}
					road_address_name={v.road_address_name}
					x={v.x}
					y={v.y}
					id={v.id}
				/>
			);
		});
		setRender(renderData);
	};

	useEffect(() => {
		const container = document.getElementById('map');
		const options = {
			center: new kakao.maps.LatLng(33.450701, 126.570667),
			level: 3,
		};

		dispatch(SET_MAP_INSTANCE(new kakao.maps.Map(container, options)));
	}, [dispatch, kakao.maps.LatLng, kakao.maps.Map]);

	const searchTextHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const search = () => {
		const keyword = searchText;

		if (!keyword.replace(/^\s+|\s+$/g, '')) {
			alert('키워드를 입력해주세요!');
			return;
		}

		ps.keywordSearch(keyword, searchTabRender);
		setSearchText('');
	};

	const searchBtnHandler = () => {
		search();
	};

	const keyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && e.nativeEvent.isComposing === false) {
			search();
		}
	};

	const resetData = () => {
		dispatch(CLEAR_POLYLINE());
		dispatch(CLEAR_MARKERS());
		dispatch(CLEAR_PATH());

		setSearchText('');
		setRender(null);
	};

	const makeShareLink = () => {
		const pathStr = pathListSelector
			.map((path) => {
				return `${path.id},${path.place_name},${path.road_address_name},${path.x},${path.y}`;
			})
			.join('/');
		const url = DOMAIN + pathStr;
		navigator.clipboard.writeText(url);
	};

	return (
		<div>
			<div className="top-bar">
				<Button className="top-bar-button" variant="contained" onClick={resetData}>
					초기화
				</Button>
			</div>
			<div id="search-zone" className="search-zone" style={{ display: render ? 'block' : 'block' }}>
				<div className="search-input">
					<input
						type="text"
						name="search-text"
						placeholder="장소검색"
						value={searchText}
						onChange={searchTextHandler}
						onKeyDown={keyHandler}
					/>
					<Button variant="contained" onClick={searchBtnHandler}>
						검색
					</Button>
				</div>
				<div className="search-list">{render}</div>
			</div>
			<div id="map" style={{ width: '100vw', height: '100vh' }} />
			<PathList />
			<div className="footer">
				<Button className="footer-button" variant="contained" onClick={makeShareLink} disabled={shareButtonDisabled}>
					공유하기
				</Button>
			</div>
		</div>
	);
}

export default App;
