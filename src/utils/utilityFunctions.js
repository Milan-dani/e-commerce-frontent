export const renderItemsSummary = (items, limit = 3) => {
  const displayedItems = items.slice(0, limit).map((item) => item.name);
  const remaining = items.length - limit;
  return remaining > 0
    ? `${displayedItems.join(", ")}, +${remaining} more`
    : displayedItems.join(", ");
};


/**
 * Converts camelCase or PascalCase string to human readable format.
 * Example: "firstName" → "First Name"
 */
export const camelToHuman = (str)=> {
  return str
    .replace(/([A-Z])/g, ' $1') // insert space before capital letters
    .replace(/^./, s => s.toUpperCase()) // capitalize first letter
    .trim();
}

/**
 * Converts an object into an array of objects.
 * Each object will have user-defined key/value property names.
 *
 * @param {Object} obj - Input object
 * @param {string} keyName - The name for the key property (default: "key")
 * @param {string} valueName - The name for the value property (default: "value")
 * @param {boolean} humanizeKeys - Whether to convert camelCase keys to human readable format
 * @returns {Array<Object>}
 */
export const objectToArray =(obj, keyName = "key", valueName = "value", humanizeKeys = true)=> {
  // Validation: Ensure obj is a valid object
  if (obj === null || obj === undefined || typeof obj !== "object" || Array.isArray(obj)) {
    console.warn("objectToArray: Expected a non-null object.");
    return [];
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    console.warn("objectToArray: Provided object is empty.");
    return [];
  }

  return entries.map(([key, value]) => ({
    [keyName]: humanizeKeys ? camelToHuman(key) : key,
    [valueName]: value === undefined || value === null ? "" : value
  }));
}
