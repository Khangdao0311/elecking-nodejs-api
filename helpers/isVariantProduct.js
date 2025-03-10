function isVariantProduct(arr) {
    return Array.isArray(arr) && arr.length > 0 && arr.every(obj =>
        Boolean(obj) &&
        typeof obj === 'object' &&
        Array.isArray(obj.property_ids) &&
        obj.property_ids.length > 0 &&
        obj.property_ids.every(id => typeof id === 'string') &&
        typeof obj.price === 'number' &&
        typeof obj.price_sale === 'number' &&
        Array.isArray(obj.colors) &&
        obj.colors.length > 0 &&
        obj.colors.every(color =>
            typeof color?.name === 'string' &&
            typeof color?.image === 'string' &&
            typeof color?.price_extra === 'number' &&
            typeof color?.status === 'number' &&
            typeof color?.quantity === 'number'
        )
    );
}

module.exports = { isVariantProduct };
