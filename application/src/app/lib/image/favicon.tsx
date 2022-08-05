import sharp from 'sharp';
import { getHost } from '~/core-server/http-utils.server';
import { getStoreFront } from '~/core-server/storefront.server';

export const SIZES = [16, 32, 64, 128];

const QUERY_TENANT_LOGO = `query TENANT_LOGO ($identifier: String!) {
    tenant {
        get(identifier: $identifier) {
            logo {
                url
                mimeType
            }
        }
    }
}`;

export const getLogoForRequestTenant = async (request: Request): Promise<string | undefined> => {
    const { secret } = await getStoreFront(getHost(request));
    const result = await secret.apiClient.pimApi(QUERY_TENANT_LOGO, { identifier: secret.config.tenantIdentifier });
    return result?.tenant?.get?.logo?.url;
};

export const fetchImageBuffer = async (url: string): Promise<ArrayBuffer> => {
    return fetch(url).then(async (res) => res.arrayBuffer());
};

type FaviconOptions = {
    size: typeof SIZES[number];
    compressionLevel: number;
    quality: number;
};
export const generateFavicon = async (original: sharp.Sharp, options: Partial<FaviconOptions>): Promise<Buffer> => {
    const opts: FaviconOptions = {
        compressionLevel: 8,
        quality: 80,
        size: SIZES[0],
        ...options,
    };
    return original
        .resize(opts.size)
        .png({
            compressionLevel: opts.compressionLevel,
            quality: opts.quality,
        })
        .toBuffer();
};
