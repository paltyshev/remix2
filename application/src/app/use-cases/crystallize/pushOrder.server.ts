import {
    ClientInterface,
    createOrderPusher,
    CustomerInputRequest,
    OrderCreatedConfirmation,
    PaymentInputRequest,
} from '@crystallize/js-api-client';
import { CartItem, CartWrapper } from '@crystallize/node-service-api-request-handlers';
import { cartWrapperRepository } from '~/core-server/services.server';

export const pushOrderSubHandler = async (
    apiClient: ClientInterface,
    cartWrapper: CartWrapper,
    customer: CustomerInputRequest,
    payment: PaymentInputRequest,
): Promise<OrderCreatedConfirmation> => {
    const cart = cartWrapper.cart;
    if (cartWrapper?.extra?.orderId) {
        throw {
            message: `Order '${cartWrapper.extra.orderId}' already exists.`,
            status: 403,
        };
    }
    const pusher = createOrderPusher(apiClient);
    const orderCreatedConfirmation = await pusher({
        customer,
        cart: cart.cart.items.map((item: CartItem) => {
            return {
                sku: item.variant.sku,
                name: item.variant.name || item.variant.sku,
                quantity: item.quantity,
                imageUrl: item.variant.firstImage?.url || '',
                price: {
                    gross: item.price.gross,
                    net: item.price.net,
                    currency: item.price.currency,
                    tax: {
                        name: 'VAT',
                        percent: (item.price.net / item.price.gross - 1) * 100,
                    },
                },
            };
        }),
        total: {
            currency: cart.total.currency,
            gross: cart.total.gross,
            net: cart.total.net,
            tax: {
                name: 'VAT',
                percent: (cart.total.net / cart.total.gross - 1) * 100,
            },
        },
        payment: [payment],
    });
    cartWrapperRepository.attachOrderId(cartWrapper, orderCreatedConfirmation.id);
    return orderCreatedConfirmation;
};

export const buildCustomer = (cartWrapper: CartWrapper): CustomerInputRequest => {
    const firstName = cartWrapper?.customer?.firstname || '';
    const lastName = cartWrapper?.customer?.lastname || '';
    const customerIdentifier = cartWrapper?.customer?.customerIdentifier || cartWrapper?.customer?.email || '';
    return {
        identifier: customerIdentifier,
        firstName,
        lastName,
        addresses: [
            {
                //@ts-ignore
                type: 'billing',
                firstName,
                lastName,
                email: cartWrapper?.customer?.email || '',
                street: cartWrapper?.customer?.streetAddress || '',
                city: cartWrapper?.customer?.city || '',
                country: cartWrapper?.customer?.country || '',
                postalCode: cartWrapper?.customer?.zipCode || '',
            },
            {
                //@ts-ignore
                type: 'delivery',
                firstName,
                lastName,
                email: cartWrapper?.customer?.email || '',
                street: cartWrapper?.customer?.streetAddress || '',
                city: cartWrapper?.customer?.city || '',
                country: cartWrapper?.customer?.country || '',
                postalCode: cartWrapper?.customer?.zipCode || '',
            },
        ],
    };
};