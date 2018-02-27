export const pluck = (...rest) => {
  if (!rest.length) { return undefined; }
  const head = rest[0];
  const tail = rest.slice(1);
  if (!tail.length) { return o => o[head]; }
  const recurse = pluck(...tail);
  return o => o[head] && recurse(o[head]);
};
