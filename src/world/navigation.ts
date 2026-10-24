export type Point = { x: number; y: number };
const blocked = new Set(["1,1", "5,1", "1,5", "5,5", "6,4", "7,1", "0,6"]);
export function pathTo(
  from: Point,
  to: Point,
  obstacles: Point[] = [],
): Point[] {
  const valid = (p: Point) =>
    Number.isInteger(p.x) &&
    Number.isInteger(p.y) &&
    p.x >= 0 &&
    p.x < 8 &&
    p.y >= 0 &&
    p.y < 8 &&
    !blocked.has(`${p.x},${p.y}`) &&
    !obstacles.some((b) => b.x === p.x && b.y === p.y);
  if (!valid(from) || !valid(to)) return [];
  const queue: Point[][] = [[from]],
    seen = new Set([`${from.x},${from.y}`]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i],
      p = path[path.length - 1];
    if (p.x === to.x && p.y === to.y) return path;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = { x: p.x + dx, y: p.y + dy },
        key = `${n.x},${n.y}`;
      if (valid(n) && !seen.has(key)) {
        seen.add(key);
        queue.push([...path, n]);
      }
    }
  }
  return [];
}
