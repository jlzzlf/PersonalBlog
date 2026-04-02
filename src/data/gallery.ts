const GALLERY_CDN_BASE = 'https://cdn.joylife-zhang.site/picture/';

const toGalleryImageUrl = (fileName: string) => encodeURI(`${GALLERY_CDN_BASE}${fileName}`);

export interface GalleryItem {
	id: string;
	src: string;
	alt: string;
}

export const galleryItems: GalleryItem[] = [
	{
		id: 'ai-kotoba-5',
		src: toGalleryImageUrl('爱言叶5.jpg'),
		alt: '图片库中的插画收藏图',
	},
	{
		id: 'ai-kotoba-5-crop',
		src: toGalleryImageUrl('爱言叶5-裁切.jpg'),
		alt: '图片库中的裁切插画',
	},
	{
		id: 'banner-7',
		src: toGalleryImageUrl('banner-7.jpg'),
		alt: '图片库中的横幅图',
	},
	{
		id: 'banner-4',
		src: toGalleryImageUrl('banner-4.jpg'),
		alt: '图片库中的淡色横幅图',
	},
	{
		id: 'banner-1',
		src: toGalleryImageUrl('banner-1.jpg'),
		alt: '图片库中的浅色风景图',
	},
	{
		id: 'banner-2',
		src: toGalleryImageUrl('banner-2.jpg'),
		alt: '图片库中的过渡背景图',
	},
	{
		id: 'banner-5',
		src: toGalleryImageUrl('banner-5.jpg'),
		alt: '图片库中的柔和背景图',
	},
	{
		id: 'dev-screenshot',
		src: toGalleryImageUrl('屏幕截图-2026-03-17-184358.png'),
		alt: '图片库中的开发截图',
	},
];
