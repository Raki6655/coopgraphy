"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, Volume2, VolumeX, Instagram } from "lucide-react";
import { format } from "date-fns";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AboutModal from "../components/AboutModal";
import { videos } from "@/constants/videoData";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isMuted, setIsMuted] = useState(true);
	const [activeVideo, setActiveVideo] = useState(videos[0]);
	const [playbackTime, setPlaybackTime] = useState("00:00:00");
	const [isPaused, setIsPaused] = useState(false);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const videoRef = useRef(null);
	const mainTitleRef = useRef(null);
	const playTextRef = useRef(null);
	const progressRef = useRef(null);
	const blurRef = useRef(null);
	const carouselRef = useRef(null);
	const activeCardRef = useRef(null);
	const scrollSectionRef = useRef(null);
	const bannerRef = useRef(null);
	const [isAboutOpen, setIsAboutOpen] = useState(false);

	const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0); // Total duration of all videos
	const scrollHeight = 200; // Total scroll height in vh

	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = isMuted;
		}
	}, [isMuted]);

	useEffect(() => {
		const video = videoRef.current;

		ScrollTrigger.create({
			trigger: scrollSectionRef.current,
			start: "top top",
			end: "+=200%",
			pin: bannerRef.current,
			// markers: true,
			// pinSpacer: false,
			// pinSpacing: false,
			scrub: true,
			onUpdate: (self) => {
				if (!video.duration || isNaN(video.duration)) return;

				// Get the scroll speed (this will be negative when scrolling up and positive when scrolling down)
				const scrollSpeed = self.getVelocity();

				// Adjust scroll speed factor for better control
				const speedFactor = 0.01; // Modify this value for the speed of the seeking

				// Calculate the new currentTime based on scroll velocity
				let newTime = video.currentTime + scrollSpeed * speedFactor;

				// Ensure the newTime stays within the bounds of the video duration (0 to video.duration)
				newTime = Math.max(0, Math.min(video.duration, newTime));

				// Update the video's currentTime based on calculated scroll direction and speed
				video.currentTime = newTime;
			},
		});

		return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
	}, [activeVideo]);

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
	}, [activeVideo]);

	// useEffect(() => {
	// 	if (videoRef.current) {
	// 		const video = videoRef.current;

	// 		ScrollTrigger.create({
	// 			trigger: scrollSectionRef.current,
	// 			start: "top top",
	// 			end: "bottom bottom",
	// 			scrub: true, // Smooth scrubbing
	// 			// onUpdate: (self) => {
	// 			// 	if (!video.duration || isNaN(video.duration)) return;

	// 			// 	// Get the scroll speed (this will be negative when scrolling up and positive when scrolling down)
	// 			// 	const scrollSpeed = self.getVelocity();

	// 			// 	// Adjust scroll speed factor for better control
	// 			// 	const speedFactor = 0.01; // Modify this value for the speed of the seeking

	// 			// 	// Calculate the new currentTime based on scroll velocity
	// 			// 	let newTime = video.currentTime + scrollSpeed * speedFactor;

	// 			// 	// Ensure the newTime stays within the bounds of the video duration (0 to video.duration)
	// 			// 	newTime = Math.max(0, Math.min(video.duration, newTime));

	// 			// 	// Update the video's currentTime based on calculated scroll direction and speed
	// 			// 	video.currentTime = newTime;
	// 			// },
	// 		});
	// 	}
	// }, [activeVideo]);

	const [videoDurations, setVideoDurations] = useState({}); // Store durations

	const handleLoadedMetadata = (event, videoId) => {
		if (event.target && event.target.duration) {
			const duration = event.target.duration;
			setVideoDurations((prevDurations) => ({
				...prevDurations,
				[videoId]: formatDuration(duration),
			}));
		}
	};

	// Format time as MM:SS
	const formatDuration = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	// Debugging: Check if event fires
	useEffect(() => {
		console.log("Video Durations Updated:", videoDurations);
	}, [videoDurations]);

	// Ensuring Metadata Loads
	useEffect(() => {
		videos.forEach((video) => {
			const tempVideo = document.createElement("video");
			tempVideo.src = video.url;
			tempVideo.preload = "metadata";

			tempVideo.onloadedmetadata = () => {
				handleLoadedMetadata({ target: tempVideo }, video.id);
			};
		});
	}, []);

	const handleVideoEnd = () => {
		// Find the index of the current active video
		const currentIndex = videos.findIndex((v) => v.id === activeVideo.id);
		// Get the next video (loop back to the start if at the end)
		const nextVideo = videos[(currentIndex + 1) % videos.length];

		// Smoothly transition to next video using GSAP
		gsap.to(mainTitleRef.current, {
			opacity: 0,
			y: 20,
			duration: 0.5,
			onComplete: () => {
				setActiveVideo(nextVideo);
				gsap.to(mainTitleRef.current, {
					opacity: 0,
					y: 0,
					duration: 0.5,
					delay: 0.2,
				});
			},
		});
	};

	useEffect(() => {
		if (carouselRef.current) {
			const activeCard = carouselRef.current.querySelector(
				`[data-video-id="${activeVideo.id}"]`
			);
			if (activeCard) {
				const carousel = carouselRef.current;
				const cardRect = activeCard.getBoundingClientRect();
				const carouselRect = carousel.getBoundingClientRect();
				const scrollLeft =
					cardRect.left -
					carouselRect.left +
					carousel.scrollLeft -
					(carouselRect.width / 2 - cardRect.width / 2);

				gsap.to(carousel, {
					scrollLeft: scrollLeft,
					duration: 0.5,
					ease: "power3.out",
				});
			}
		}
	}, [activeVideo]);

	// Sync page scroll with carousel scroll
	useEffect(() => {
		if (carouselRef.current) {
			const carousel = carouselRef.current;
			const totalWidth = carousel.scrollWidth - carousel.clientWidth;

			ScrollTrigger.create({
				trigger: carousel,
				start: "top top",
				end: "+=200%",
				scrub: true,
				onUpdate: (self) => {
					const scrollProgress = self.progress;
					carousel.scrollLeft = scrollProgress * totalWidth;

					// Update active video based on scroll progress
					const totalDuration = videos.reduce(
						(sum, video) => sum + video.duration,
						0
					);
					const currentTime = scrollProgress * totalDuration;

					let accumulatedDuration = 0;
					for (const video of videos) {
						if (currentTime < accumulatedDuration + video.duration) {
							setActiveVideo(video);
							setPlaybackProgress(
								(currentTime - accumulatedDuration) / video.duration
							);
							break;
						}
						accumulatedDuration += video.duration;
					}
				},
			});
		}
	}, []);

	// Helper function to format duration (mm:ss)

	const handleMouseMove = (e) => {
		if (playTextRef.current) {
			const x = e.clientX;
			const y = e.clientY;
			setMousePosition({ x, y });
			gsap.to(playTextRef.current, {
				x: x,
				y: y,
				duration: 0.3,
				ease: "power2.out",
			});
		}
	};
	useEffect(() => {
		gsap.set(mainTitleRef.current, { zIndex: 0 });
	}, []);
	const handleVideoClick = () => {
		if (videoRef.current) {
			if (videoRef.current.paused) {
				videoRef.current.play();
				setIsPaused(false);
				gsap.set(mainTitleRef.current, { zIndex: 0 });
				gsap.to(mainTitleRef.current, {
					opacity: 0,
					y: 20,
					duration: 0.5,
				});
			} else {
				videoRef.current.pause();
				setIsPaused(true);
				gsap.set(mainTitleRef.current, { zIndex: 40 });
				gsap.to(mainTitleRef.current, {
					opacity: 1,
					y: 0,
					duration: 0.5,
				});
			}
		}
	};

	const router = useRouter();
	const handleVideoChange = (video) => {
		if (videoRef.current) {
			videoRef.current.pause();
			setIsPaused(true);
		}
		gsap.to(mainTitleRef.current, {
			opacity: 0,
			y: 20,
			duration: 0.5,
			onComplete: () => {
				setActiveVideo(video);
				gsap.to(mainTitleRef.current, {
					opacity: 1,
					y: 0,
					duration: 0.5,
					delay: 0.2,
				});
			},
		});
	};

	return (
		<div className="max-h-[100vh] overflow-hidden">
			<main
				className="relative h-screen w-full overflow-hidden main"
				onMouseMove={handleMouseMove}
				ref={bannerRef}
			>
				{/* Background Video */}

				<AboutModal
					isOpen={isAboutOpen}
					onClose={() => setIsAboutOpen(false)}
				/>

				<video
					ref={videoRef}
					src={activeVideo.url}
					className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer z-20"
					autoPlay
					loop={false}
					muted
					playsInline
					onClick={handleVideoClick}
					onEnded={handleVideoEnd}
				/>
				<div className="video-overlay absolute inset-0" />

				{/* Play Text */}
				<div
					ref={playTextRef}
					className="play-text fixed text-sm font-mono z-30 font-bold"
					style={{
						transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
					}}
				>
					{isPaused ? "PLAY" : "PAUSE"} {playbackTime}
				</div>

				{/* Header */}
				<header className="absolute top-0 left-0 right-0 p-6 flex bg-black/900 items-center justify-between z-20">
					<div className="flex items-center space-x-4 text-gray-100 w-[4rem]">
						{/* <span className="text-sm font-mono font-bold text-gray-100">
						{format(currentTime, "HH:mm:ss")} PST
					</span> */}
						<button
							onClick={() => setIsMuted(!isMuted)}
							className="sound-toggle flex items-center space-x-2"
						>
							<span className="text-sm lg:text-lg font-bold tracking-widest">
								SOUND:
							</span>
							{isMuted ? (
								<VolumeX size={20} className="font-bold" fontWeight={900} />
							) : (
								<Volume2 size={20} fontWeight={900} />
							)}
						</button>
					</div>

					<h1 className=" font-extrabold tracking-[0.5rem] lg:tracking-[1.5rem] text-2xl lg:text-5xl  ">
						COOPER
					</h1>

					<button
						className="menu-icon"
						onClick={() => setIsAboutOpen(!isAboutOpen)}
					>
						<Menu size={44} />
					</button>
				</header>

				{/* Main Title */}
				<div
					ref={mainTitleRef}
					className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-40  "
					style={{ opacity: isPaused ? 1 : 0 }}
				>
					<h2 className="text-[3rem] md:text-[5rem] font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-500">
						<span>{activeVideo.title.split("|")[0]}</span>
						<span className="text-blue-500">
							{" "}
							| {activeVideo.title.split("|")[1]}
						</span>
					</h2>
				</div>

				{/* Scroll Section for Video Seeking */}
				<section ref={scrollSectionRef} className="relative h-[200vh]">
					{/* This section is used for scroll-based video seeking */}
				</section>

				{/* Footer */}
				<footer className="absolute -bottom-[1.5rem] left-0 right-0 px-2 z-30">
					{/* Active Video Title and Duration */}

					{/* Video Carousel */}
					<div
						ref={carouselRef}
						className="video-carousel flex space-x-1   w-full justify-center mt-2"
					>
						{videos.map((video) => (
							<div className="relative max-w-[21vw] z-3" key={video.id}>
								{activeVideo.id === video.id && (
									<div className=" mb-4 absolute -top-4 z-3 w-full  ">
										<div className="absolute bottom-full left-2 right-0 flex justify-between items-center">
											<h3 className="text-xs font-bold">{activeVideo.title}</h3>
											<span className="text-xs font-bold">
												{videoDurations[activeVideo.id]}s
											</span>
										</div>
									</div>
								)}
								<Link href={`video/${video.id}`}>
									<button
										key={video.id}
										ref={video.id === activeVideo.id ? activeCardRef : null}
										// onClick={() => handleVideoChange(video)}
										className={`relative video-thumbnail w-full h-48 overflow-hidden rounded-lg transform transition-transform  ${
											activeVideo.id === video.id
												? "active border-4 border-white "
												: "border-2 border-transparent hover:scale-105"
										}`}
									>
										<video
											src={video.url}
											className="w-full h-full object-cover"
											loop
											muted
											playsInline
											onLoadedMetadata={(e) =>
												handleLoadedMetadata(e, video.id)
											}
											preload="metadata" // Ensures event fires properly
										/>
									</button>
								</Link>
							</div>
						))}
					</div>

					{/* Timeline */}
					<div className="timeline mt-4">
						<div ref={blurRef} className="progress-blur" />
						<div ref={progressRef} className="timeline-progress" />
					</div>
					<div className="flex justify-between items-center mb-8 px-2 lg:px-8 mt-8">
						<div className="flex items-center space-x-4">
							<a href="#" className="hover:text-blue-500 transition-colors">
								<Instagram size={20} />
							</a>
							<a
								href="#"
								className="hover:text-blue-500 transition-colors font-bold text-xs lg:text-md"
							>
								CINEMATOGRAPHY
							</a>
						</div>
						<span className="text-xs lg:text-sm font-bold">
							LOS ANGELES BASED DIRECTOR
						</span>
					</div>
				</footer>
			</main>
		</div>
	);
}
