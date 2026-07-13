// js/transform.js — camelCase (frontend) ↔ snake_case (Laravel API)

function snakeToCamel(key) {
    return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(key) {
    return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function transformKeys(value, keyFn) {
    if (Array.isArray(value)) {
        return value.map((item) => transformKeys(item, keyFn));
    }
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [keyFn(key), transformKeys(nested, keyFn)])
        );
    }
    return value;
}

export function toCamelCase(value) {
    return transformKeys(value, snakeToCamel);
}

export function toSnakeCase(value) {
    return transformKeys(value, camelToSnake);
}

export function extractList(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return [];
}

export function normalizeRecipe(recipe) {
    return toCamelCase(recipe);
}

export function denormalizeRecipe(recipe) {
    const data = toSnakeCase(recipe);
    delete data.created_at;
    delete data.updated_at;
    return data;
}

export function normalizeOrder(order) {
    const normalized = toCamelCase(order);
    normalized.items = normalized.items || normalized.orderItems || [];
    delete normalized.orderItems;
    normalized.timestamp = normalized.timestamp
        || (normalized.createdAt ? new Date(normalized.createdAt).getTime() : Date.now());
    return normalized;
}

export function denormalizeOrder(order) {
    const data = toSnakeCase(order);
    delete data.items;
    delete data.timestamp;
    delete data.created_at;
    delete data.updated_at;
    return data;
}

export function normalizeTable(table) {
    return toCamelCase(table);
}

export function denormalizeTable(table) {
    const data = toSnakeCase(table);
    delete data.created_at;
    delete data.updated_at;
    return data;
}

export function normalizeInventory(item) {
    const normalized = toCamelCase(item);
    if (normalized.costPerUnit !== undefined && normalized.cost === undefined) {
        normalized.cost = parseFloat(normalized.costPerUnit);
    }
    return normalized;
}

export function denormalizeInventory(item) {
    const data = toSnakeCase(item);
    if (data.cost !== undefined) {
        data.cost_per_unit = data.cost;
        delete data.cost;
    }
    delete data.created_at;
    delete data.updated_at;
    delete data.deleted_at;
    return data;
}

export function normalizeSettings(settings) {
    return toCamelCase(settings);
}

export function denormalizeSettings(settings) {
    return toSnakeCase(settings);
}

export function normalizeEntity(url, entity) {
    if (url.includes('/recipes')) return normalizeRecipe(entity);
    if (url.includes('/orders')) return normalizeOrder(entity);
    if (url.includes('/tables')) return normalizeTable(entity);
    if (url.includes('/inventory')) return normalizeInventory(entity);
    if (url.includes('/settings')) return normalizeSettings(entity);
    return toCamelCase(entity);
}

export function denormalizeEntity(url, entity) {
    if (url.includes('/recipes')) return denormalizeRecipe(entity);
    if (url.includes('/orders')) return denormalizeOrder(entity);
    if (url.includes('/tables')) return denormalizeTable(entity);
    if (url.includes('/inventory')) return denormalizeInventory(entity);
    if (url.includes('/settings')) return denormalizeSettings(entity);
    return toSnakeCase(entity);
}

export function normalizeResponseData(url, data) {
    if (data === null || data === undefined) return data;

    const list = extractList(data);
    if (list.length > 0 && (url.match(/^\/(recipes|orders|tables|inventory|chefs|stations|suppliers|purchases|waste)/))) {
        const normalized = list.map((item) => normalizeEntity(url, item));
        if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
            return { ...toCamelCase(data), data: normalized };
        }
        return normalized;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
        return normalizeEntity(url, data);
    }

    return toCamelCase(data);
}
