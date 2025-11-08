// 景点类型定义
export interface Spot {
  id?: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'shopping' | 'transport' | 'other';
  lng?: number;
  lat?: number;
  visitTime?: string;
  description?: string;
  openingHours?: string;
  price?: number;
  rating?: number;
  address?: string;
  photos?: string[];
}

// 行程天数据
export interface TravelDay {
  day: number;
  date: string;
  spots: Spot[];
}

// 行程计划类型
export interface TravelPlan {
  id?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  days: TravelDay[];
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 预算相关类型
export interface Expense {
  id?: string;
  planId: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  spotId?: string;
}

// 用户相关类型
export interface User {
  id?: string;
  username: string;
  email: string;
  avatar?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 地图相关类型
export interface MapPosition {
  lng: number;
  lat: number;
  zoom?: number;
}

// 路线类型
export interface RoutePoint {
  lng: number;
  lat: number;
  name?: string;
  time?: string;
}

export interface Route {
  points: RoutePoint[];
  distance?: number;
  duration?: number;
}