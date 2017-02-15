export const getDateString = (d) => {
  const two = v => v <= 9 ? `0${v}` : v;
  return `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
};

export const getLongDateString = (dt) => {
  const [a, b, d, Y, HMS, ...args] = dt.toString().split(' ');
  return `${a} ${d} ${b} ${Y} ${HMS} +0000`;
};
