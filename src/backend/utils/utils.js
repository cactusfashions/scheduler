function toStringLower(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).toLowerCase();
}

function capitalizeFirstLetter(stringValue = '') {
  if (!stringValue) return '';
  return stringValue
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
