const nameBinding = require('./nameBinding');

const pluck = (...rest) => {
  if (!rest.length) { return undefined; }
  const head = rest[0];
  const tail = rest.slice(1);
  if (!tail.length) { return o => o[head]; }
  const recurse = pluck(...tail);
  return o => o[head] && recurse(o[head]);
};

const normalizeTag = (player) => {
  const temp = player.toLowerCase().replace(/\*/g,'')
  if(nameBinding[temp]){return nameBinding[temp]};
  if(temp.indexOf('|') !== -1) { return temp.split('|')[1].trim()}
  return temp
}
const idMatched = id => pl => id && pl && pl.id.toString()===id.toString();

//replace item in array with v if pred is true, else add to end of list
const findAndReplace = arr => (pred,v) => {
  const index = arr.findIndex(pred)
  return index != -1
    ? [...arr.slice(0,index),v,...arr.slice(index+1,arr.length)]
    : [...arr,v]
  }

module.exports = {
  pluck,
  normalizeTag,
  idMatched,
  findAndReplace
}
