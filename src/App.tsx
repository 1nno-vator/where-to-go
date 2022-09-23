import React, { useEffect, useState } from 'react';
import './App.scss';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBars } from '@fortawesome/free-solid-svg-icons';
import ListCard from './components/ListCard/ListCard';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { SET_MAP_INSTANCE } from './features/map/mapSlice';
import PathList from './components/PathList/PathList';
import {
	ADD_MARKER,
	ADD_PATH,
	CLEAR_MARKERS,
	CLEAR_PATH,
	CLEAR_POLYLINE,
	REORDER_PATH,
} from './features/path/pathSlice';

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

	const [showSearch, setShowSearch] = useState<boolean>(true);
	const [isShared, setIsShared] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>('');
	const [shareButtonDisabled, setSharedButtonDisabled] = useState<boolean>(true);
	const [render, setRender] = useState<JSX.Element[] | null>();

	const [shareSetCheck, setShareSetCheck] = useState<boolean>(false);

	// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
	const makeOverListener = (map: any, marker: any, infowindow: any) => {
		return () => {
			infowindow.open(map, marker);
		};
	};

	// 인포윈도우를 닫는 클로저를 만드는 함수입니다
	const makeOutListener = (infowindow: any) => {
		return () => {
			infowindow.close();
		};
	};

	useEffect(() => {
		const container = document.getElementById('map');
		if (!mapSelector) {
			const options = {
				center: new kakao.maps.LatLng(33.450701, 126.570667),
				level: 3,
			};
			dispatch(SET_MAP_INSTANCE(new kakao.maps.Map(container, options)));
		}
		console.log('ㅁ모지');
	}, [dispatch, kakao.maps.LatLng, kakao.maps.Map, mapSelector]);

	useEffect(() => {
		const searchParams = decodeURI(window.location.pathname);

		if (searchParams.indexOf('/', 1) > -1 && !shareSetCheck) {
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

			dispatch(REORDER_PATH(pathObjArr));

			for (let i = 0; i < pathObjArr.length; i++) {
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
						clickable: true,
					});
					// 마커에 표시할 인포윈도우를 생성합니다
					const iwContent = `<div style="padding: 10px;"><div>${markerProps.title}</div></div>`;
					const infowindow = new kakao.maps.InfoWindow({
						content: iwContent, // 인포윈도우에 표시할 내용
					});

					// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
					// 이벤트 리스너로는 클로저를 만들어 등록합니다
					// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
					kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(mapSelector, marker, infowindow));
					kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
					dispatch(ADD_MARKER(marker));
				} else {
					// 마커에 표시할 인포윈도우를 생성합니다
					const iwContent = `<div style="padding: 10px;"><div>${markerProps.title}</div></div>`;
					const infowindow = new kakao.maps.InfoWindow({
						content: iwContent, // 인포윈도우에 표시할 내용
					});

					// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
					// 이벤트 리스너로는 클로저를 만들어 등록합니다
					// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
					kakao.maps.event.addListener(find, 'mouseover', makeOverListener(mapSelector, find, infowindow));
					kakao.maps.event.addListener(find, 'mouseout', makeOutListener(infowindow));
					find.setMap(mapSelector);
				}

				setIsShared(true);
			}
		} else {
			setIsShared(false);
		}
	}, [
		dispatch,
		kakao.maps.InfoWindow,
		kakao.maps.LatLng,
		kakao.maps.Marker,
		kakao.maps.MarkerImage,
		kakao.maps.Size,
		kakao.maps.event,
		mapSelector,
		markersSelector,
		shareSetCheck,
	]);

	useEffect(() => {
		if (pathListSelector.length > 1) {
			setSharedButtonDisabled(false);
			setShareSetCheck(true);
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
		if (pathListSelector.length < 1) {
			alert('경로를 선택해주세요.');
			return;
		}

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
			<div className="sidetab">
				<div className="tab-buttons">
					<div
						className={`tab-button ${showSearch ? 'selected-tab' : ''}`}
						onClick={() => setShowSearch(true)}
						role="presentation"
					>
						<span>검색</span>
					</div>
					<div
						className={`tab-button ${!showSearch ? 'selected-tab' : ''}`}
						onClick={() => setShowSearch(false)}
						role="presentation"
					>
						<span>목록</span>
					</div>
				</div>
				<div id="search-zone" className="search-zone" style={{ display: showSearch ? 'block' : 'none' }}>
					<div className="search-input">
						<div className="input-container">
							<input
								type="text"
								name="search-text"
								placeholder="장소를 입력해주세요"
								value={searchText}
								onChange={searchTextHandler}
								onKeyDown={keyHandler}
							/>
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								style={{ padding: '5px', marginRight: '15px', cursor: 'pointer' }}
								onClick={search}
							/>
						</div>
					</div>
					<div className="search-list">{render}</div>
				</div>
				<PathList />
			</div>
			<div id="map" style={{ width: '100vw', height: '100vh' }} />

			<div className="footer">
				<Button
					className="footer-button"
					variant="contained"
					onClick={makeShareLink}
					style={{ color: 'white', background: '#6A97E4' }}
				>
					공유하기
				</Button>
				<Button
					className="footer-button"
					variant="contained"
					onClick={resetData}
					style={{ color: '#6A97E4', background: '#DDDDDD' }}
				>
					초기화
				</Button>
			</div>
		</div>
	);
}

export default App;
