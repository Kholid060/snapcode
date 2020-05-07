export function searchFilter(items, key, query) {
  return items.filter((item) => item[key].toLowerCase().match(query.toLowerCase()));
}

export function tagFilter(items, activeTag, key = 'tags') {
  return items.filter((item) => item[key].includes(activeTag));
}
