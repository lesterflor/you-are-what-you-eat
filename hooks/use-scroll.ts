'use client';

import { useEffect, useState } from 'react';

export const useScrolling = () => {
	const [scrollingUp, setIsScrollingUp] = useState(true);
	const [lastScrollTop, setLastScrollTop] = useState(0);
	const [currentScrollTop, setCurrentScrollTop] = useState(0);
	const [windowSize, setWindowSize] = useState({
		width: 0,
		height: 0
	});

	useEffect(() => {
		// Handler to call on window resize
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
		}

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Call handler right away to fix the initial values
		handleResize();

		// Remove event listener on cleanup
		return () => window.removeEventListener('resize', handleResize);
	}, []); // Empty array ensures that effect is only run on mount and unmount

	useEffect(() => {
		const handleScroll = () => {
			const st = window.pageYOffset || document.documentElement.scrollTop;
			setCurrentScrollTop(st);
			setIsScrollingUp(!(st < lastScrollTop));
			setLastScrollTop(st <= 0 ? 0 : st); // Update lastScrollTop
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollTop]);

	return {
		scrollingUp,
		currentScrollTop,
		windowSize,
		delta: Math.round(currentScrollTop)
	};
};
