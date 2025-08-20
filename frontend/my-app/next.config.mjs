/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		const backendOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:8000';
		return [
			{
				source: '/api-proxy/:path*',
				destination: `${backendOrigin}/:path*`,
			},
		];
	},
};

export default nextConfig;
