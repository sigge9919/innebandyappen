// Quadratic bezier interpolation helper
export const quadBezier = (p0: number, p1: number, p2: number, t: number) => {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
};
