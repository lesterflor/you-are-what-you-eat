import type { NextConfig } from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
	experimental: {
		//ppr: 'incremental',
		serverActions: {
			bodySizeLimit: '5mb'
		},
		optimizePackageImports: ['react-icons', 'lucide-react']
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'utfs.io',
				port: ''
			},
			{
				protocol: 'http',
				hostname: 'lesterflor.com',
				port: ''
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				port: ''
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: ''
			}
		]
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY'
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin'
					}
				]
			},
			{
				source: '/sw.js',
				headers: [
					{
						key: 'Content-Type',
						value: 'application/javascript; charset=utf-8'
					},
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate'
					},
					{
						key: 'Content-Security-Policy',
						value: "default-src 'self'; script-src 'self'"
					}
				]
			}
		];
	}
};

export default withBundleAnalyzer(nextConfig);
