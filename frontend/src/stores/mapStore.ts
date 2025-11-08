import { defineStore } from 'pinia';
import { mapApi } from '../services/apiService';

export interface Place {
  id: string;
  name: string;
  lng: number;
  lat: number;
  address: string;
  category: string;
  rating?: number;
  photos?: string[];
}

export interface Route {
  distance: number;
  duration: number;
  steps: {
    distance: number;
    duration: number;
    instruction: string;
    startLocation: { lng: number; lat: number };
    endLocation: { lng: number; lat: number };
  }[];
  path: { lng: number; lat: number }[];
}

export interface MapState {
  center: { lng: number; lat: number };
  zoom: number;
  selectedPlace: Place | null;
  searchResults: Place[];
  currentRoute: Route | null;
  markers: Array<{
    id: string;
    lng: number;
    lat: number;
    title?: string;
    icon?: string;
    data?: any;
  }>;
  loading: boolean;
  error: string | null;
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    center: { lng: 116.404, lat: 39.915 }, // 北京作为默认中心
    zoom: 12,
    selectedPlace: null,
    searchResults: [],
    currentRoute: null,
    markers: [],
    loading: false,
    error: null,
  }),
  
  getters: {
    // 获取所有标记
    allMarkers: (state) => state.markers,
    
    // 获取当前选中的地点
    getSelectedPlace: (state) => state.selectedPlace,
    
    // 搜索结果数量
    searchResultsCount: (state) => state.searchResults.length,
  },
  
  actions: {
    // 设置地图中心
    setCenter(lng: number, lat: number) {
      this.center = { lng, lat };
    },
    
    // 设置缩放级别
    setZoom(zoom: number) {
      this.zoom = zoom;
    },
    
    // 搜索地点
    async searchPlaces(keyword: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mapApi.searchPlace(keyword);
        const results = response.data;
        this.searchResults = results;
        return results;
      } catch (error: any) {
        this.error = error.response?.data?.message || '搜索地点失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取地点详情
    async fetchPlaceDetail(placeId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mapApi.getPlaceDetail(placeId);
        const place = response.data;
        this.selectedPlace = place;
        // 移动地图到该地点
        this.setCenter(place.lng, place.lat);
        this.setZoom(15);
        return place;
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取地点详情失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 规划路线
    async calculateRoute(start: string, end: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await mapApi.getRoute(start, end);
        const route = response.data;
        this.currentRoute = route;
        // 调整地图视野以显示整个路线
        if (route.path.length > 0) {
          // 简单实现：以路线中点为中心
          const midPoint = route.path[Math.floor(route.path.length / 2)];
          this.setCenter(midPoint.lng, midPoint.lat);
          this.setZoom(13);
        }
        return route;
      } catch (error: any) {
        this.error = error.response?.data?.message || '路线规划失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 添加标记
    addMarker(id: string, lng: number, lat: number, title?: string, icon?: string, data?: any) {
      // 检查是否已存在相同ID的标记
      const existingIndex = this.markers.findIndex(marker => marker.id === id);
      if (existingIndex !== -1) {
        this.markers[existingIndex] = { id, lng, lat, title, icon, data };
      } else {
        this.markers.push({ id, lng, lat, title, icon, data });
      }
    },
    
    // 移除标记
    removeMarker(id: string) {
      this.markers = this.markers.filter(marker => marker.id !== id);
    },
    
    // 清除所有标记
    clearMarkers() {
      this.markers = [];
    },
    
    // 清除搜索结果
    clearSearchResults() {
      this.searchResults = [];
    },
    
    // 清除当前路线
    clearRoute() {
      this.currentRoute = null;
    },
    
    // 清除选中地点
    clearSelectedPlace() {
      this.selectedPlace = null;
    },
    
    // 清除错误
    clearError() {
      this.error = null;
    },
  },
});