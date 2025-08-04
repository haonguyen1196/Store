export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    pictureUrl: string;
    type: string;
    brand: string;
    quantityInStock: number;
    images?: ProductImage[];
};

export type ProductImage = {
    id: number;
    url: string;
    order: number;
    publicId: string;
    productId: number;
};
