const formatterCache = new Map();

const getFormatter = (minimumFractionDigits, maximumFractionDigits) => {
    const cacheKey = `${minimumFractionDigits}-${maximumFractionDigits}`;

    if (!formatterCache.has(cacheKey)) {
        formatterCache.set(
            cacheKey,
            new Intl.NumberFormat("en-NP", {
                minimumFractionDigits,
                maximumFractionDigits,
            })
        );
    }

    return formatterCache.get(cacheKey);
};

const formatCurrency = (value, options = {}) => {
    const minimumFractionDigits = options.minimumFractionDigits ?? 2;
    const maximumFractionDigits = options.maximumFractionDigits ?? 2;
    const formatter = getFormatter(
        minimumFractionDigits,
        maximumFractionDigits
    );
    const fallback = `NRS ${formatter.format(0)}`;
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return fallback;
    }

    return `NRS ${formatter.format(amount)}`;
};

export { formatCurrency };
