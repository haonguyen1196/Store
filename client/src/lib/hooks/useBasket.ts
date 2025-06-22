import type { Item } from "../../app/models/basket";
import {
    useClearBasketMutation,
    useFetchBasketQuery,
} from "../../features/basket/basketApi";

export const useBasket = () => {
    const { data: basket } = useFetchBasketQuery();
    const [clearBasket] = useClearBasketMutation();

    const subtotal =
        basket?.items.reduce(
            (sum: number, item: Item) => sum + item.price * item.quantity,
            0
        ) || 0;
    const deliveryFee = subtotal > 10000 ? 0 : 500;

    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, basket, total, clearBasket };
};
