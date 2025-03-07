"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function AboutModal({ isOpen, onClose }) {
	const modalRef = useRef(null);
	const leftPanelRef = useRef(null);
	const rightPanelRef = useRef(null);

	useEffect(() => {
		gsap.set(modalRef.current, {
			zIndex: 100,
		});
		if (isOpen) {
			gsap.fromTo(
				modalRef.current,
				{ x: "100%", opacity: 0 },
				{ x: "0%", opacity: 0.9, duration: 0.8, ease: "power3.out" }
			);
			gsap.fromTo(
				leftPanelRef.current,
				{ x: -20, opacity: 0 },
				{ x: 0, opacity: 0.9, delay: 0.2, duration: 0.6 }
			);
			gsap.fromTo(
				rightPanelRef.current,
				{ x: 20, opacity: 0 },
				{ x: 0, opacity: 0.9, delay: 0.4, duration: 0.6 }
			);
		} else {
			gsap.to(modalRef.current, {
				x: "100%",
				opacity: 0,
				duration: 0.6,
				ease: "power3.in",
			});
		}
	}, [isOpen]);

	return (
		<div
			ref={modalRef}
			className="fixed inset-0 bg-black overflow-hidden opacity-60 z-0"
		>
			{/* Left Fixed Panel */}
			<div
				ref={leftPanelRef}
				className="fixed left-0 top-0 w-1/3 h-full bg-gray-800 p-12"
			>
				<h1 className="text-6xl font-bold mb-8">About</h1>
				<h2 className="text-4xl font-bold mb-12">COOPER</h2>
				<p className="text-lg leading-relaxed">
					Cooper is a visionary filmmaker and creative director from Brooklyn,
					New York. His work blends raw storytelling with striking
					cinematography to craft immersive visual narratives that push the
					boundaries of reality and fantasy.
				</p>
			</div>

			{/* Right Scrollable Content */}
			<div
				ref={rightPanelRef}
				className="ml-[33.33%] w-2/3 h-full overflow-y-auto p-12"
			>
				<div className="max-w-2xl mx-auto">
					<p className="text-lg mb-12 leading-relaxed">
						With a focus on authenticity and emotion, Cooper's artistry is
						dedicated to showcasing diverse perspectives and capturing human
						connection in its purest form.
					</p>

					<div className="space-y-12">
						<div>
							<h3 className="text-xl font-bold mb-4">Worked With:</h3>
							<ul className="space-y-2 text-lg">
								<li>Netflix</li>
								<li>Apple Music</li>
								<li>Gucci</li>
								<li>Universal Pictures</li>
								<li>ESPN</li>
								<li>Disney</li>
								<li>MTV</li>
								<li>Vogue</li>
								<li>Mercedes-Benz</li>
								<li>Rolling Stone</li>
							</ul>
						</div>

						<div>
							<h3 className="text-xl font-bold mb-4">Education:</h3>
							<p className="text-lg">
								New York University, BFA in Film & Television
								<br />
								Columbia University, MFA in Directing
							</p>
						</div>

						<div>
							<h3 className="text-xl font-bold mb-4">Awards & Recognition:</h3>
							<p className="text-lg">
								Sundance Film Festival - Best Cinematography Award
								<br />
								Official selections: TIFF, SXSW, Tribeca Film Festival, Cannes
								Short Film Corner
							</p>
						</div>

						<div className="space-y-4">
							<h3 className="text-xl font-bold">Get In Touch:</h3>
							<p className="text-lg">Email: contact@cooperfilms.com</p>
							<p className="text-lg">Instagram: @cooper.visuals</p>
						</div>
					</div>

					<div className="mt-24 pt-8 border-t border-black">
						<p className="text-lg">Brooklyn, New York</p>
						<p className="text-lg">United States</p>
					</div>
				</div>
			</div>

			{/* Close Button */}
			<button
				onClick={onClose}
				className="fixed top-8 right-8 text-2xl p-2 hover:bg-gray-100 rounded-full"
			>
				×
			</button>
		</div>
	);
}
