
export const DELETE_MARKER = "__DELETE__";

/**
 * Calculates the difference between two objects.
 * Returns a generic object representing the changes needed to transform obj1 into obj2.
 * Note: Arrays and Dates are treated as atomic values (replaced entirely if different).
 * 
 * @param original The original object
 * @param modified The modified object
 * @returns An object representing the changes, or undefined if identical.
 */
export function getDiff(original: any, modified: any): any {
    if (original === modified) return undefined;

    // Treat as atomic if:
    // - One is primitive or null
    // - Types are different
    // - Arrays (treated atomically for replacement)
    // - Dates
    const isObj1Atomic = original === null || typeof original !== 'object' || Array.isArray(original) || original instanceof Date;
    const isObj2Atomic = modified === null || typeof modified !== 'object' || Array.isArray(modified) || modified instanceof Date;

    // If either is atomic, we replace the whole value
    if (isObj1Atomic || isObj2Atomic) {
        // structural check for Arrays/Dates/Objects that might be referentially different but value-equal
        try {
            if (JSON.stringify(original) === JSON.stringify(modified)) return undefined;
        } catch (e) {
            // Ignore stringify errors
        }
        return modified;
    }

    const diff: any = {};
    let hasChanges = false;

    // Check for modifications and additions in the new object
    for (const key in modified) {
        if (Object.prototype.hasOwnProperty.call(modified, key)) {
            const val1 = original[key];
            const val2 = modified[key];
            const change = getDiff(val1, val2);
            
            if (change !== undefined) {
                diff[key] = change;
                hasChanges = true;
            }
        }
    }

    // Check for deletions (keys present in original but missing in modified)
    for (const key in original) {
        if (Object.prototype.hasOwnProperty.call(original, key)) {
            if (!Object.prototype.hasOwnProperty.call(modified, key)) {
                diff[key] = DELETE_MARKER;
                hasChanges = true;
            }
        }
    }

    return hasChanges ? diff : undefined;
}

/**
 * Applies a difference structure to an object.
 * Returns a NEW object with the changes applied (does not mutate target).
 * 
 * @param target The object to apply changes to.
 * @param diff The difference structure.
 * @returns The resulting object.
 */
export function applyDiff(target: any, diff: any): any {
    if (diff === undefined) return target;

    // If diff is atomic, it replaces target entirely
    const isDiffAtomic = diff === null || typeof diff !== 'object' || Array.isArray(diff) || diff instanceof Date;
    if (isDiffAtomic) {
        return diff;
    }

    // If we are here, 'diff' is an object structure of changes.
    // We construct the result by cloning target or starting fresh.
    let result: any;
    if (target === null || typeof target !== 'object' || Array.isArray(target) || target instanceof Date) {
        result = {};
    } else {
        result = { ...target };
    }

    for (const key in diff) {
        if (Object.prototype.hasOwnProperty.call(diff, key)) {
            const value = diff[key];
            if (value === DELETE_MARKER) {
                delete result[key];
            } else {
                result[key] = applyDiff(result[key], value);
            }
        }
    }

    return result;
}
