let id = 0;

export default function (prefix = 'component') {
  id += 1;

  return `${prefix}__${id}`;
}
