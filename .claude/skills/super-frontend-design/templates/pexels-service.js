/**
 * Pexels API 轻量封装
 * 用于在生成的前端项目中获取专业配图
 */

const API_KEY = process.env.PEXELS_API_KEY;
const BASE_URL = 'https://api.pexels.com/v1';

/**
 * 搜索 Pexels 图片
 * @param {string} query 搜索关键词
 * @param {Object} options
 * @param {number} [options.perPage=6]
 * @param {'landscape'|'portrait'|'square'} [options.orientation]
 * @returns {Promise<{photos: Array}>}
 */
export async function searchPhotos(query, { perPage = 6, orientation } = {}) {
  if (!API_KEY) {
    console.warn('[Pexels] 未配置 PEXELS_API_KEY，返回空结果');
    return { photos: [] };
  }

  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
  });

  if (orientation) {
    params.set('orientation', orientation);
  }

  const response = await fetch(`${BASE_URL}/search?${params}`, {
    headers: {
      Authorization: API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API 请求失败: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取单张最佳匹配图片
 * @param {string} query
 * @param {Object} options
 * @param {'landscape'|'portrait'|'square'} [options.orientation]
 * @returns {Promise<Object|null>}
 */
export async function getBestPhoto(query, options = {}) {
  const data = await searchPhotos(query, { ...options, perPage: 1 });
  return data.photos?.[0] ?? null;
}

/**
 * 获取指定尺寸的图片 URL
 * @param {Object} photo Pexels 返回的 photo 对象
 * @param {'original'|'large2x'|'large'|'medium'|'small'|'portrait'|'landscape'|'tiny'} [size='large']
 * @returns {string|undefined}
 */
export function getPhotoUrl(photo, size = 'large') {
  return photo?.src?.[size] || photo?.src?.original;
}

/**
 * 生成带响应式 srcset 的图片属性
 * @param {Object} photo
 * @returns {{src: string, srcset: string, sizes: string}}
 */
export function getResponsivePhotoAttrs(photo) {
  if (!photo?.src) return { src: '', srcset: '', sizes: '' };

  const { original, large2x, large, medium, small } = photo.src;

  return {
    src: large || medium || original,
    srcset: [
      small && `${small} 640w`,
      medium && `${medium} 1280w`,
      large && `${large} 1920w`,
      large2x && `${large2x} 3840w`,
    ]
      .filter(Boolean)
      .join(', '),
    sizes: '(max-width: 768px) 100vw, 50vw',
  };
}
