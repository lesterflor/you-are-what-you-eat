require('dotenv').config();

import '@testing-library/jest-dom';
import fetch, { Headers, Request, Response } from 'node-fetch';
import { TextDecoder, TextEncoder } from 'util';
//import 'whatwg-fetch';

// Mock ResizeObserver for jsdom
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

(global as any).ResizeObserver = ResizeObserver;

// Polyfill for libraries that expect these globals
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder as any;

(global as any).fetch = fetch;
(global as any).Request = Request;
(global as any).Response = Response;
(global as any).Headers = Headers;
