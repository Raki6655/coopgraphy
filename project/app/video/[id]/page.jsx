"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Volume2, VolumeX, ArrowUpLeft, Pause, Play } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Mock video data (replace with your actual data fetching logic)
const videos = [
	{
		id: 3,
		title: "JASMINE SULLIVAN | LOST IN TIME",
		url: "/videos/video3.mp4",
		thumbnail:
			"https://images.unsplash.com/photo-1516726817505-f5ed825624b0?auto=format&fit=crop&w=300&q=80",
		year: 2024,
		description:
			"A mesmerizing visual experience that blends nostalgia with modern storytelling.",
		production: {
			company: "Blue Moon Studios",
			director: "Elijah Carter",
			photography: "Madison Rivera",
			camera: ["Sony FX9", "RED V-Raptor"],
			ge: ["ARRI Orbiter", "Aputure Nova P600C"],
		},
	},
	{
		id: 1,
		title: "FRANK OCEAN | WAVES",
		url: "/videos/video1.mp4",
		thumbnail:
			"https://images.unsplash.com/photo-1506166779243-65fce2b47cb2?auto=format&fit=crop&w=300&q=80",
		year: 2023,
		description:
			"A dreamy and immersive short film capturing the essence of solitude and longing.",
		production: {
			company: "Silver Light Films",
			director: "Isabella Chang",
			photography: "Noah Bennett",
			camera: ["ARRI Amira", "Sony FX3"],
			ge: ["Litepanels Astra", "Dedolight DLED4"],
		},
	},
	{
		id: 2,
		title: "H.E.R. | INNER LIGHT",
		url: "/videos/video2.mp4",
		thumbnail:
			"https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&w=300&q=80",
		year: 2022,
		description:
			"A poetic and visually striking piece that explores identity and transformation.",
		production: {
			company: "Luminous Motion",
			director: "Cameron Hayes",
			photography: "Lily Anderson",
			camera: ["Canon C700", "Panasonic EVA1"],
			ge: ["Godox VL300", "Astera AX1 Pixel Tubes"],
		},
	},
	{
		id: 4,
		title: "TYLER, THE CREATOR | IN BLOOM",
		url: "/videos/video4.mp4",
		thumbnail:
			"https://images.unsplash.com/photo-1470434767159-ac7bf1b43351?auto=format&fit=crop&w=300&q=80",
		year: 2021,
		description:
			"A bold, colorful, and surreal journey through sound and artistic expression.",
		production: {
			company: "Neon Visions",
			director: "Julian Ford",
			photography: "Sierra Collins",
			camera: ["Blackmagic Pocket 6K Pro", "Fujifilm GFX100"],
			ge: ["Nanlux Evoke 1200", "Kino Flo Diva-Lite"],
		},
	},
	{
		id: 5,
		title: "SZA | FADED MEMORIES",
		url: "/videos/video5.mp4",
		thumbnail:
			"https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=300&q=80",
		year: 2020,
		description:
			"A stunningly raw and emotional portrayal of love, loss, and self-discovery.",
		production: {
			company: "Eclipse Motion Pictures",
			director: "Valerie Brooks",
			photography: "Daniel Carter",
			camera: ["Sony A1", "RED Gemini 5K"],
			ge: ["Profoto B10X", "Westcott Ice Light 2"],
		},
	},
];

// Generate static paths for all videos
// export function generateStaticParams() {
//   return videos.map((video) => ({
//     id: video.id.toString(), // Convert ID to string (required for dynamic routes)
//   }));
// }

export default function VideoPage() {
	const router = useRouter();
	const params = useParams(); // Get the dynamic ID from the URL
	const videoId = Number(params.id); // Convert ID to a number
	const videoRef = useRef(null);
	const detailsRef = useRef(null);
	const [isMuted, setIsMuted] = useState(true);
	const [isPaused, setIsPaused] = useState(false);

	const progressRef = useRef(null);
	const blurRef = useRef(null);

	// Find the video data based on the ID
	const videoDetails = videos.find((video) => video.id === videoId);

	// If the video is not found, redirect to the home page
	useEffect(() => {
		if (!videoDetails) {
			router.push("/");
		}
	}, [videoDetails, router]);

	// GSAP ScrollTrigger setup
	useEffect(() => {
		const ctx = gsap.context(() => {
			// Pin the video section
			// ScrollTrigger.create({
			// 	trigger: ".video-section",
			// 	start: "top bottom",
			// 	end: "+=0%",
			// 	pin: true,
			// 	pinSpacing: false,
			// });

			// Animate the details section to scroll over the video
			gsap.fromTo(
				detailsRef.current,
				{ y: "100vh" }, // Start from below the viewport
				{
					y: 0.9,
					// opacity: 1,
					duration: 13.5,
					ease: "power4.out",
					scrollTrigger: {
						trigger: ".details-section",
						start: "top bottom", // Start animation when the top of the details section hits the bottom of the viewport
						end: "+=300%", // End animation when the top of the details section reaches the top of the viewport
						scrub: 1,
					},
				}
			);
		});

		return () => ctx.revert(); // Cleanup GSAP context
	}, []);

	if (!videoDetails) {
		return null; // Return nothing while redirecting
	}
	const [playbackTime, setPlaybackTime] = useState("00:00:00");

	useEffect(() => {
		const updatePlaybackTime = () => {
			if (videoRef.current) {
				const time = videoRef.current.currentTime;
				const hours = Math.floor(time / 3600);
				const minutes = Math.floor((time % 3600) / 60);
				const seconds = Math.floor(time % 60);
				setPlaybackTime(
					`${hours.toString().padStart(2, "0")}:${minutes
						.toString()
						.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
				);

				// Update progress bar
				if (progressRef.current && blurRef.current) {
					const progress = (time / videoRef.current.duration) * 100;
					progressRef.current.style.width = `${progress}%`;
					blurRef.current.style.width = `${progress}%`;
				}
			}
		};

		const video = videoRef.current;
		if (video) {
			video.addEventListener("timeupdate", updatePlaybackTime);
			return () => video.removeEventListener("timeupdate", updatePlaybackTime);
		}
	}, []);
	const handleVideoClick = () => {
		if (videoRef.current) {
			if (videoRef.current.paused) {
				videoRef.current.play();
				setIsPaused(false);
				// gsap.to(mainTitleRef.current, {
				// 	opacity: 0,
				// 	y: 20,
				// 	duration: 0.5,
				// });
			} else {
				videoRef.current.pause();
				setIsPaused(true);
				// gsap.to(mainTitleRef.current, {
				// 	opacity: 1,
				// 	y: 0,
				// 	duration: 0.5,
				// });
			}
		}
	};

	return (
		<div className="relative">
			{/* Video Section (Fixed) */}
			<section className="video-section fixed top-0 left-0 w-full h-screen bg-black z-10">
				<video
					ref={videoRef}
					src={videoDetails.url}
					className="absolute inset-0 w-full h-full object-cover cursor-pointer"
					autoPlay
					loop
					muted={isMuted}
					onClick={() => {
						videoRef.current?.paused
							? videoRef.current.play()
							: videoRef.current?.pause();
						setIsPaused(!isPaused);
					}}
				/>

				{/* Header */}
				<header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
					<button className="text-white" onClick={() => router.push("/")}>
						<ArrowUpLeft size={24} />
					</button>

					<button
						onClick={() => setIsMuted(!isMuted)}
						className="flex items-center gap-2 text-white"
					>
						{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
						<span className="font-mono text-sm">SOUND</span>
					</button>
				</header>

				{/* Left Menu */}
				<div className=" mt-4 relative top-[85%] w-5/6 left-1/2 -translate-x-1/2 z-20 h-[20rem]">
					<div className=" bottom-10 text-white flex items-center gap-12 mb-8">
						<h1 className="relative text-white z-40  text-2xl font-bold tracking-wide">
							{videoDetails.title}ttt
						</h1>
						<div
							className="h-10 w-10 rounded-full border-2 border-white p-2 flex items-center justify-center cursor-pointer"
							onClick={handleVideoClick}
						>
							{isPaused ? <Play size={28} /> : <Pause size={28} />}
						</div>
					</div>
					<div className="timeline">
						<div className=" bottom-10 text-white">
							<p className="relative text-white z-40">
								{videoDetails.title}ttt
							</p>
						</div>{" "}
						<div ref={blurRef} className="progress-blur" />
						<div ref={progressRef} className="timeline-progress" />
					</div>
				</div>
			</section>

			{/* Details Section (Scrolls Over Video) */}
			<section
				ref={detailsRef}
				className="details-section relative bg-black text-white z-20 pt-20 px-8 min-h-screen"
			>
				<div className="">
					<div className="flex gap-3 items-start mb-10">
						<h1 className="text-7xl font-bold mb-4">{videoDetails.title}</h1>
						<p className="text-lg mb-12">({videoDetails.year})</p>
					</div>

					<div className="space-y-8 mb-16 ">
						<p className="text-2xl font-medium mb-4">
							{videoDetails.description}
						</p>

						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="font-bold mb-4">PRODUCTION COMPANY</h3>
								<p>{videoDetails?.production?.company}</p>
							</div>

							<div>
								<h3 className="font-bold mb-4">DIRECTOR</h3>
								<p>{videoDetails.production?.director}</p>
							</div>
						</div>

						<div className="border-t border-white pt-8">
							<h3 className="font-bold mb-4">DIRECTOR OF PHOTOGRAPHY</h3>
							<p>{videoDetails.production?.photography}</p>
						</div>

						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="font-bold mb-4">CAMERA</h3>
								{videoDetails.production?.camera.map((name, i) => (
									<p key={i}>{name}</p>
								))}
							</div>

							<div>
								<h3 className="font-bold mb-4">G+E</h3>
								{videoDetails.production?.ge.map((name, i) => (
									<p key={i}>{name}</p>
								))}
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t border-white pt-8 flex justify-between">
						<div className="space-y-2">
							<p className="font-bold">AY</p>
							<p className="text-lg">GET IN TOUCH TODAY</p>
						</div>
						<div className="space-y-2 text-right">
							<p className="cursor-pointer hover:underline">BACK TO VIDEO</p>
							<p className="font-mono">PD 1n X 00005</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
