// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Provide a test-time shim for Vite's import.meta.env used throughout the codebase.
// The custom Jest transformer replaces `import.meta.env.` with `globalThis.__IMPORT_META_ENV__.`
// Ensure the object exists and contains sensible defaults for tests.
// @ts-ignore
globalThis.__IMPORT_META_ENV__ = globalThis.__IMPORT_META_ENV__ || {};
globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID = globalThis.__IMPORT_META_ENV__.VITE_GOOGLE_CLIENT_ID || 'test-client-id';
globalThis.__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT = globalThis.__IMPORT_META_ENV__.VITE_SPOTIFY_API_ENDPOINT || 'https://example.com/spotify';

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
