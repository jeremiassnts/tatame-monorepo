export function isNeitherUndefinedNorNull<T>(value: T): value is T {
    return value !== undefined && value !== null;
}