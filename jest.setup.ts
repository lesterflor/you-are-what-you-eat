require('dotenv').config();

import '@testing-library/jest-dom';

// Mock ResizeObserver for jsdom
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

(global as any).ResizeObserver = ResizeObserver;
