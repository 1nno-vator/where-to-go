import React from 'react';
import './ListCard.scss';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FlagIcon from '@mui/icons-material/Flag';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ADD_MARKER, ADD_PATH } from '../../features/path/pathSlice';

const DOMAIN = 'http://localhost:3000/';

type ListCardProp = {
	id: string;
	place_name: string;
	road_address_name: string;
	x: string;
	y: string;
};

function ListCard(prop: ListCardProp) {
	const { kakao } = window;

	const data = { ...prop };
	const dispatch = useAppDispatch();
	const mapSelector = useAppSelector((state) => state.map.mapInstance);
	const pathListSelector = useAppSelector((state) => state.path.path);
	const markersSelector = useAppSelector((state) => state.path.markers);

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

	const addMarkerData = (_data: ListCardProp) => {
		const markerProps = {
			id: _data.id,
			title: _data.place_name,
			latlng: new kakao.maps.LatLng(Number(_data.y), Number(_data.x)),
		};

		// 마커 이미지의 이미지 주소입니다
		const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';

		// 마커 이미지의 이미지 크기 입니다
		const imageSize = new kakao.maps.Size(24, 35);

		// 마커 이미지를 생성합니다
		const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

		const find = markersSelector.find((v) => v.getTitle() === _data.place_name);

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
			//
		}
	};

	const panToLocation = (_data: ListCardProp) => {
		const convertX = Number(_data.x);
		const convertY = Number(_data.y);
		const moveLatLng = new kakao.maps.LatLng(convertY, convertX);
		mapSelector.panTo(moveLatLng);
		dispatch(ADD_PATH(_data));

		addMarkerData(_data);
	};

	return (
		<List dense sx={{ cursor: 'pointer', width: '95%', margin: '0 auto' }} onClick={() => panToLocation(data)}>
			<ListItem>
				<ListItemIcon>
					<FlagIcon />
				</ListItemIcon>
				<ListItemText primary={data.place_name} secondary={data.road_address_name} />
			</ListItem>
		</List>
	);
}

export default ListCard;
