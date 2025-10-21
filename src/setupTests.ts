// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Configure React Testing Library to suppress act() warnings
// @ts-ignore
global.IS_REACT_ACT_ENVIRONMENT = true;

// Provide a test-time shim for Vite's import.meta.env used throughout the codebase.
// The custom Jest transformer replaces `import.meta.env.` with `globalThis.__IMPORT_META_ENV__.`
// Ensure the object exists and contains sensible defaults for tests.
// @ts-ignore
(globalThis as any).__IMPORT_META_ENV__ = (globalThis as any).__IMPORT_META_ENV__ || {};
(globalThis as any).__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID = (globalThis as any).__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID || 'test-client-id';
(globalThis as any).__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT = (globalThis as any).__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT || 'https://example.com/spotify';

// Provide window.matchMedia for Ant Design and other libs that expect it
// @ts-ignore
if (typeof window !== 'undefined' && !window.matchMedia) {
	// @ts-ignore
	window.matchMedia = function (query: string) {
		return {
			matches: false,
			media: query,
			onchange: null,
			addListener: function () {}, // deprecated
			removeListener: function () {}, // deprecated
			addEventListener: function () {},
			removeEventListener: function () {},
			dispatchEvent: function () { return false; }
		} as any;
	};
}

// Provide a minimal global.fetch stub for services that call fetch (e.g., SpotifyService) so tests don't throw
if (typeof global !== 'undefined' && !(global as any).fetch) {
	// @ts-ignore
	(global as any).fetch = async (..._args: any[]) => {
		return {
			ok: true,
			status: 200,
			json: async () => ({})
		};
	};
}

// Some modules assume a global React variable is present during runtime (legacy transpilation).
// Ensure tests have a global React reference.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.React = global.React || require('react');

// Polyfill TextEncoder/TextDecoder for Node/Jest environment where they may be missing
if (typeof (global as any).TextEncoder === 'undefined') {
	// Minimal polyfill using util if available
	try {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const { TextEncoder, TextDecoder } = require('util');
		(global as any).TextEncoder = TextEncoder;
		(global as any).TextDecoder = TextDecoder;
	} catch (e) {
		// Provide extremely small fallback implementations
		(global as any).TextEncoder = class { encode(input: string) { return Buffer.from(input, 'utf8'); } };
		(global as any).TextDecoder = class { decode(input: Uint8Array) { return Buffer.from(input).toString('utf8'); } };
	}
}

// Minimal HTMLCanvasElement.getContext stub to avoid jsdom "not implemented" errors when
// modules read canvas context properties during render. This provides a harmless fake
// 2D context for basic operations used in tests.
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
	// @ts-ignore
	HTMLCanvasElement.prototype.getContext = function (type: string) {
		if (type === '2d') {
			return {
				fillRect: () => {},
				clearRect: () => {},
				getImageData: (x: number, y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
				putImageData: () => {},
				createImageData: () => [],
				setTransform: () => {},
				drawImage: () => {},
				save: () => {},
				fillText: () => {},
				restore: () => {},
				beginPath: () => {},
				moveTo: () => {},
				lineTo: () => {},
				closePath: () => {},
				stroke: () => {},
				translate: () => {},
				scale: () => {},
				rotate: () => {},
				measureText: () => ({ width: 0 }),
				transform: () => {},
			};
		}
		return null;
	};
}

// Suppress known noisy dev warnings that would otherwise surface as console.error
// during tests. We intentionally filter only specific, expected warnings so other
// real errors still surface.
const _origConsoleError = console.error;
console.error = (...args: any[]) => {
	try {
		const msg = String(args[0] || '');

		// Ignore Ant Design rc-collapse deprecation message
		if (msg.includes("[rc-collapse] `children` will be removed in next major version")) {
			return;
		}

		// Ignore React act() environment / not-wrapped-in-act warnings which can
		// be produced by async timers or effects during component mount in tests.
		// These are noisy in CI and many tests already account for the async
		// work; suppress the console error so the test runner doesn't treat it as
		// a hard failure while keeping other console.error output intact.
		if (msg.includes('not wrapped in act') || msg.includes('The current testing environment is not configured to support act')) {
			return;
		}

		// Some React warnings include a longer text starting with 'Warning: An update to'
		if (msg.startsWith('Warning: An update to') && msg.includes('inside a test') && msg.includes('not wrapped in act')) {
			return;
		}
	} catch (e) {
		// fall through to original
	}
	_origConsoleError.apply(console, args as any);
};
