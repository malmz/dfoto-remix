import {
	index,
	layout,
	prefix,
	route,
	type RouteConfig,
} from '@react-router/dev/routes';

export default [
	...prefix('api', [
		route('upload', './routes/api/upload.ts'),
		route('image/:id', './routes/api/image.ts'),
	]),
	...prefix('auth', [
		route('callback', './routes/auth/callback.tsx'),
		route('sign-in', './routes/auth/sign-in.tsx'),
		route('sign-out', './routes/auth/sign-out.tsx'),
	]),
	layout('./routes/layout.tsx', [
		index('./routes/index.tsx'),
		route('about', './routes/about.tsx'),
		route('album/:id', './routes/album/layout.tsx', [
			index('./routes/album/index.tsx'),
			route(':imageId', './routes/album/image.tsx'),
		]),
		route('admin', './routes/admin/layout.tsx', [
			index('./routes/admin/index/route.tsx'),
			route('create', './routes/admin/create.tsx'),
			route(':id', './routes/admin/gallery/layout.tsx', [
				index('./routes/admin/gallery/index/route.tsx'),
				route(':imageId', './routes/admin/gallery/image.tsx'),
			]),
		]),
	]),
] satisfies RouteConfig;
