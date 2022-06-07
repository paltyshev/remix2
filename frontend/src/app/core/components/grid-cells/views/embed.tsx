import { Image } from '@crystallize/reactjs-components/dist/image';
import { Link } from '@remix-run/react';
import { TileViewComponentProps } from '~/lib/grid-tile/types';

export const Embed: React.FC<TileViewComponentProps> = ({ tile, options }) => {
    console.log(tile);
    const { title, description, content, background, ctas, styling } = tile;
    if (!content.items || content.items.length === 0) {
        return <p>Nothing has been embed.</p>;
    }
    const firstItem = content.items[0];
    const firstItemImage = firstItem.components.find((component: any) => component.id === 'media')?.content
        ?.selectedComponent?.content;

    return (
        <Link to={firstItem.path} prefetch="intent">
            <div
                className="flex flex-col justify-between items-stretch h-full overflow-hidden"
                style={{ background: styling?.background.color }}
            >
                <div className="px-20 pt-20 h-1/3 ">
                    {title && <h2 className="text-2xl font-bold mb-3">{title}</h2>}
                    {description && <p className="embed-text">{description}</p>}
                    {ctas &&
                        ctas.map((cta) => (
                            <button className="bg-ctaBlue px-8 py-4 rounded font-medium" key={cta.link}>
                                <Link to={cta.link} prefetch="intent">
                                    {cta.text}
                                </Link>
                            </button>
                        ))}
                </div>
                <div className="pl-10 pt-10 max-w-full h-full img-container img-cover grow">
                    <Image
                        {...firstItemImage?.firstImage}
                        sizes="300px"
                        loading="lazy"
                        className="overflow-hidden rounded-tl-md "
                    />
                </div>
            </div>
        </Link>
    );
};
