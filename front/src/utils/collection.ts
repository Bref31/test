export const lexicographicCompare = (lhs: any[], rhs: any[]) => {
  if (lhs.length != rhs.length) {
    return lhs.length - rhs.length;
  }

  for (let i = 0; i < lhs.length; ++i) {
    if (lhs[i] < rhs[i]) {
      return -1;
    } else if (lhs[i] > rhs[i]) {
      return 1;
    }
  }

  return 0;
};
