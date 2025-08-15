import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

export default function Map() {
	return (
		<div className="h-64 w-full overflow-hidden rounded border">
			<MapContainer center={[0,0]} zoom={2} scrollWheelZoom={false} className="h-full w-full">
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={[0,0]}>
					<Popup>Witnessing the world</Popup>
				</Marker>
			</MapContainer>
		</div>
	)
}