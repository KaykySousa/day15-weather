import axios from "axios"
import { useEffect, useState } from "react"
import DeveloperInfo from "./components/DeveloperInfo"
import { Weather } from "./types/api"

export default function App() {
	const [error, setError] = useState("")
	const [weather, setWeather] = useState<Weather | null>(null)
	const [coords, setCoords] = useState<GeolocationCoordinates | null>(null)
	const date = new Date()

	const navigatorSucessCallback: PositionCallback = ({ coords }) => {
		setCoords(coords)
	}

	const navigatorErrorCallback: PositionErrorCallback = (error) => {
		setError("Unable to retrieve your location")
		console.error(error.message)
	}

	function getGeoPosition() {
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser")
			return
		}

		navigator.geolocation.getCurrentPosition(
			navigatorSucessCallback,
			navigatorErrorCallback
		)
	}

	async function getWeather() {
		try {
			const res = await axios.get(
				`https://api.openweathermap.org/data/2.5/weather?lat=${
					coords?.latitude
				}&lon=${coords?.longitude}&units=metric&appid=${
					import.meta.env.VITE_API_KEY
				}`
			)

			setWeather(res.data)
			setError("")
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			}
			console.error(error)
		}
	}

	useEffect(() => {
		getGeoPosition()
	}, [])

	useEffect(() => {
		if (!coords) return

		getWeather()
	}, [coords])

	return (
		<div className="min-h-screen w-full bg-slate-700 flex flex-col justify-center items-center p-6">
			<h1 className="text-white font-semibold mb-6 text-3xl">Weather</h1>
			<div className="max-w-sm w-full bg-slate-800 rounded flex flex-col items-center text-white p-6 mb-6">
				{!error && !weather ? (
					<>
						<p>Loading...</p>
						<p>Allow access to your location</p>
					</>
				) : error ? (
					<p>{error}</p>
				) : (
					<>
						<div className="flex justify-between items-center w-full mb-8 border-b border-slate-700 pb-4">
							<p>
								{date.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
							<p>{date.toLocaleDateString()}</p>
						</div>
						<img
							src={`https://openweathermap.org/img/wn/${weather?.weather[0].icon}@4x.png`}
							alt={`${weather?.weather[0].description} icon`}
							className="-mt-12 -mb-12"
						/>
						<div className="flex justify-start items-start mt-6">
							<p className="text-5xl">
								{Math.round(weather?.main.temp!)}
							</p>
							<span className="text-2xl ml-1">°C</span>
						</div>
						<p className="capitalize mt-1">
							{weather?.weather.map(({ description }, index) => {
								return (
									description +
									(weather.weather.length >= 2 &&
									index !== weather.weather.length - 1
										? ", "
										: "")
								)
							})}
						</p>
						<div className="flex justify-between items-center w-full mt-8 border-t border-slate-700 pt-4">
							<p>{weather?.name}</p>
							<p>{weather?.sys.country}</p>
						</div>
					</>
				)}
			</div>
			<DeveloperInfo />
		</div>
	)
}
