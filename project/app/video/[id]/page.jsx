"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Volume2, VolumeX, ArrowUpLeft, Pause, Play } from "lucide-react";
import { videos } from "@/constants/videoData";

gsap.registerPlugin(ScrollTrigger);

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
					playsInline
					muted={isMuted}
					onClick={() => {
						videoRef.current?.paused
							? videoRef.current.play()
							: videoRef.current?.pause();
						setIsPaused(!isPaused);
					}}
					onFullscreenChange={(e) => document.exitFullscreen()}
					onWebkitBeginFullscreen={(e) => e.preventDefault()}
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
					<div className="flex  items-start mb-10 gap-8">
						<h1 className="text-3xl lg:text-7xl font-bold mb-4">
							{videoDetails.title}
						</h1>
						<p className="text-lg mb-12">({videoDetails.year})</p>
					</div>

					<div className="space-y-16 mb-16 ">
						<p className="text-md lg:text-2xl font-medium mb-4">
							{videoDetails.description}
						</p>

						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="font-bold mb-4">PRODUCTION COMPANY</h3>
								<p className="text-gray-400">
									{videoDetails?.production?.company}
								</p>
							</div>

							<div>
								<h3 className="font-bold mb-4">DIRECTOR</h3>
								<p className="text-gray-400">
									{videoDetails.production?.director}
								</p>
							</div>
						</div>

						<div className="border-t border-white pt-8">
							<h3 className="font-bold mb-4">DIRECTOR OF PHOTOGRAPHY</h3>
							<p className="text-gray-400">
								{videoDetails.production?.photography}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="font-bold mb-4">CAMERA</h3>
								{videoDetails.production?.camera.map((name, i) => (
									<p key={i} className="text-gray-400">
										{name}
									</p>
								))}
							</div>

							<div>
								<h3 className="font-bold mb-4">G+E</h3>
								{videoDetails.production?.ge.map((name, i) => (
									<p key={i} className="text-gray-400">
										{name}
									</p>
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
