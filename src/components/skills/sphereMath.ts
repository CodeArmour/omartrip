export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export type Connection = readonly [number, number];

export function createFibonacciSphere(count: number): Point3D[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / Math.max(1, count - 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = goldenAngle * index;

    return {
      x: Math.cos(angle) * radial,
      y,
      z: Math.sin(angle) * radial,
    };
  });
}

export function createNearestConnections(
  points: Point3D[],
  neighborsPerNode = 2,
): Connection[] {
  const unique = new Set<string>();

  points.forEach((point, index) => {
    points
      .map((candidate, candidateIndex) => ({
        index: candidateIndex,
        distance:
          (point.x - candidate.x) ** 2 +
          (point.y - candidate.y) ** 2 +
          (point.z - candidate.z) ** 2,
      }))
      .filter(({ index: candidateIndex }) => candidateIndex !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, neighborsPerNode)
      .forEach(({ index: candidateIndex }) => {
        const start = Math.min(index, candidateIndex);
        const end = Math.max(index, candidateIndex);
        unique.add(`${start}:${end}`);
      });
  });

  return Array.from(unique, (connection) => {
    const [start, end] = connection.split(":").map(Number);
    return [start, end] as const;
  });
}

export function rotatePoint(
  point: Point3D,
  yaw: number,
  pitch: number,
): Point3D {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const x = point.x * cosYaw + point.z * sinYaw;
  const yawedZ = -point.x * sinYaw + point.z * cosYaw;

  return {
    x,
    y: point.y * cosPitch - yawedZ * sinPitch,
    z: point.y * sinPitch + yawedZ * cosPitch,
  };
}
