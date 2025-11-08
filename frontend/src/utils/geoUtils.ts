/**
 * 地理计算工具类
 * 提供坐标计算、距离测量和路线规划等功能
 */

/**
 * 坐标接口
 */
export interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * 计算两点之间的距离（使用Haversine公式）
 * @param point1 第一个坐标点
 * @param point2 第二个坐标点
 * @returns 两点之间的距离（单位：公里）
 */
export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // 地球半径（单位：公里）
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  
  return distance;
}

/**
 * 角度转换为弧度
 * @param degrees 角度
 * @returns 弧度
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 计算多个点的中心点坐标
 * @param points 坐标点数组
 * @returns 中心点坐标
 */
export function calculateCenter(points: Coordinate[]): Coordinate {
  if (!points || points.length === 0) {
    throw new Error('坐标点数组不能为空');
  }

  if (points.length === 1 && points[0] !== undefined) {
    return points[0];
  }

  let x = 0;
  let y = 0;
  let z = 0;

  points.forEach(point => {
    const lat = toRad(point.lat);
    const lng = toRad(point.lng);
    x += Math.cos(lat) * Math.cos(lng);
    y += Math.cos(lat) * Math.sin(lng);
    z += Math.sin(lat);
  });

  x = x / points.length;
  y = y / points.length;
  z = z / points.length;

  const lng = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const lat = Math.atan2(z, hyp);

  return {
    lat: lat * (180 / Math.PI),
    lng: lng * (180 / Math.PI)
  };
}

/**
 * 计算坐标点数组的边界框
 * @param points 坐标点数组
 * @returns 边界框对象
 */
export function calculateBoundingBox(points: Coordinate[]): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  if (!points || points.length === 0) {
    throw new Error('坐标点数组不能为空');
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  points.forEach(point => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  });

  return {
    minLat,
    maxLat,
    minLng,
    maxLng
  };
}

/**
 * 简单的旅行商问题解决方案（最近邻算法）
 * 计算访问所有点的最短路径（近似解）
 * @param points 坐标点数组
 * @param startPoint 起始点（可选）
 * @returns 优化后的点顺序
 */
export function calculateOptimalRoute(points: (Coordinate | undefined)[], startPoint?: Coordinate): Coordinate[] {
  if (!points || points.length <= 1) return points.filter(Boolean) as Coordinate[];
  
  const validPoints = points.filter(Boolean) as Coordinate[];
  const remainingPoints = [...validPoints];
  const route: Coordinate[] = [];
  
  // 从第一个点开始
  let currentPoint = remainingPoints.shift();
  if (currentPoint) {
    route.push(currentPoint);
  }
  
  while (remainingPoints.length > 0 && currentPoint) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < remainingPoints.length; i++) {
      if (remainingPoints[i]) {
        const point = remainingPoints[i];
        if (point) {
          const distance = calculateDistance(currentPoint, point);
        if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        }
      }
    }

    if (nearestIndex !== -1) {
      currentPoint = remainingPoints[nearestIndex];
      if (currentPoint) {
        route.push(currentPoint);
        remainingPoints.splice(nearestIndex, 1);
      }
    } else {
      // 如果找不到最近点，跳出循环
      break;
    }
  }
  
  return route;
}

/**
 * 计算两点之间的方位角
 * @param point1 第一个坐标点
 * @param point2 第二个坐标点
 * @returns 方位角（0-360度）
 */
export function calculateBearing(point1: Coordinate, point2: Coordinate): number {
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = Math.atan2(y, x);

  // 将弧度转换为角度（0-360）
  return (bearing * 180 / Math.PI + 360) % 360;
}

/**
 * 根据方位角和距离计算目标坐标
 * @param startPoint 起始坐标点
 * @param bearing 方位角（度）
 * @param distance 距离（公里）
 * @returns 目标坐标点
 */
export function calculateDestination(startPoint: Coordinate, bearing: number, distance: number): Coordinate {
  const R = 6371; // 地球半径（公里）
  const lat1 = toRad(startPoint.lat);
  const lng1 = toRad(startPoint.lng);
  const brng = toRad(bearing);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: lat2 * (180 / Math.PI),
    lng: lng2 * (180 / Math.PI)
  };
}

/**
 * 判断点是否在多边形内部（射线法）
 * @param point 待判断的点
 * @param polygon 多边形顶点数组
 * @returns 是否在内部
 */
export function isPointInPolygon(point: Coordinate, polygon: (Coordinate | undefined)[]): boolean {
  let inside = false;
  const { lat, lng } = point;
  const validPolygon = polygon.filter(Boolean) as Coordinate[];

  for (let i = 0, j = validPolygon.length - 1; i < validPolygon.length; j = i++) {
    const pointI = validPolygon[i];
    const pointJ = validPolygon[j];
    if (!pointI || !pointJ) continue;
    const xi = pointI.lng;
    const yi = pointI.lat;
    const xj = pointJ.lng;
    const yj = pointJ.lat;

    const intersect = 
      ((yi > lat) !== (yj > lat)) && 
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * 根据坐标数组生成GeoJSON格式的LineString
 * @param points 坐标点数组
 * @returns GeoJSON对象
 */
export function generateGeoJSONLineString(points: Coordinate[]): any {
  const coordinates = points.map(point => [point.lng, point.lat]);
  
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates
    },
    properties: {
      length: calculateRouteDistance(points)
    }
  };
}

/**
 * 计算路线总距离
 * @param points 路线上的坐标点数组
 * @returns 总距离（公里）
 */
export function calculateRouteDistance(points: (Coordinate | undefined)[]): number {
  if (!points || points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i] && points[i + 1]) {
      const point1 = points[i];
      const point2 = points[i + 1];
      if (point1 && point2) {
        totalDistance += calculateDistance(point1, point2);
      }
    }
  }
  
  return totalDistance;
}

/**
 * 获取地图缩放级别，以适应指定边界框
 * @param bounds 边界框
 * @param mapWidth 地图容器宽度（像素）
 * @param mapHeight 地图容器高度（像素）
 * @param padding 边距（像素）
 * @returns 最佳缩放级别
 */
export function getOptimalZoomLevel(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  mapWidth: number,
  mapHeight: number,
  padding: number = 40
): number {
  // 计算边界框的宽度和高度（度数）
  const lngDiff = bounds.maxLng - bounds.minLng;
  const latDiff = bounds.maxLat - bounds.minLat;

  // 计算每个维度需要的缩放级别
  const lngZoom = Math.floor(Math.log(360 * (mapWidth - 2 * padding) / (lngDiff * 256)) / Math.LN2);
  const latZoom = Math.floor(Math.log(180 * (mapHeight - 2 * padding) / (latDiff * 256)) / Math.LN2);

  // 取较小的缩放级别确保完全显示，并限制在合理范围内
  return Math.min(Math.min(lngZoom, latZoom), 18);
}