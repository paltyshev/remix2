import { json, LoaderFunction, HeadersFunction } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { useLocalCart } from '~/core/hooks/useLocalCart';
import { HttpCacheHeaderTaggerFromLoader, StoreFrontAwaretHttpCacheHeaderTagger } from '~/core/Http-Cache-Tagger';
import { getStoreFront } from '~/core/storefront/storefront.server';
import { ServiceAPI } from '~/core/use-cases/service-api';

export const headers: HeadersFunction = ({ loaderHeaders }) => {
    return HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers;
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const { shared } = await getStoreFront(request.headers.get('Host')!);
    return json(
        { cartId: params.id },
        StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', ['cart' + params.id], shared.config),
    );
};

export default function CartPlaced() {
    const { cart: localCart, empty } = useLocalCart();
    const { cartId } = useLoaderData();
    const [tryCount, setTryCount] = useState(0);
    const navigate = useNavigate();

    const [orderGuestId, setOrderGuestId] = useState('');

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        (async () => {
            try {
                if (localCart.cartId === cartId) {
                    empty();
                }
                const cart = await ServiceAPI.fetchCart(cartId);
                if (cart?.extra?.orderId) {
                    if (cart?.customer?.isGuest === true) {
                        setOrderGuestId(cart.extra.orderId);
                    } else {
                        navigate('/order/' + cart.extra.orderId);
                    }
                } else {
                    timeout = setTimeout(() => {
                        setTryCount(tryCount + 1);
                    }, 500 * tryCount);
                }
            } catch (exception) {
                timeout = setTimeout(() => {
                    setTryCount(tryCount + 1);
                }, 500 * tryCount);
            }
        })();
        return () => clearTimeout(timeout);
    }, [cartId, tryCount]);

    if (orderGuestId !== '') {
        return (
            <div className="lg:w-content mx-auto w-full">
                <div className="w-2/4 mx-auto">
                    <h1 className="font-bold text-3xl">Order Placed!</h1>
                    <div>
                        <div>
                            <p>
                                Your order has been placed successfully, as it is a Guest Order you won't see the
                                details here.
                            </p>
                            <p>Order Id is #{orderGuestId}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:w-content mx-auto w-full">
            <div className="w-2/4 mx-auto">
                <h1 className="font-bold text-3xl">Cart Placed!</h1>
                <div>
                    <div>
                        <h2>Cart {cartId}</h2>
                        <p>Your cart has been placed successfully, we're waiting for payment confirmation.</p>
                        <p>Redirecting....</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
