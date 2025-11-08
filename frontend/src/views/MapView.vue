<template>
  <div class="map-container-page">
    <h1>行程地图</h1>
    
    <!-- 主要内容区域 - 左右布局 -->
    <div class="main-content">
      <!-- 左侧地图区域 -->
      <div class="map-section">
        <div id="mapContainer" class="map-container"></div>
        <div v-if="loading" class="loading-overlay">
          加载中...
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      
      <!-- 右侧行程详情和筛选栏 -->
      <div class="sidebar-section">
        <!-- 筛选栏 -->
        <div class="filter-section">
          <h3>筛选</h3>
          <div class="filter-group">
            <label>天数：</label>
            <select v-model="selectedDay" @change="onDayChange">
              <option v-for="day in travelPlan.days || []" :key="day.day" :value="day.day">
                第{{ day.day }}天
              </option>
            </select>
          </div>
        </div>
        
        <!-- 行程详情 -->
        <div class="travel-details">
          <h3>{{ travelPlan.title || '未命名行程' }}</h3>
        
          
          <!-- 每日行程 -->
          <div v-for="day in travelPlan.days || []" :key="day.day" class="day-section" :class="{ 'active': selectedDay === day.day }">
            <h4>第{{ day.day }}天 ({{ day.date }})</h4>
            <div class="spots-list">
              <div 
                v-for="spot in day.spots || []" 
                :key="spot.id || spot.name"
                class="spot-item"
                :class="{ 'active-spot': selectedSpot === spot.name }"
                @click="onSpotClick(spot)"
              >
                <div class="spot-type" :class="spot.type">{{ getTypeName(spot.type) }}</div>
                <div class="spot-info">
                  <h5>{{ spot.name }}</h5>
                  <p v-if="spot.visitTime" class="visit-time">{{ spot.visitTime }}</p>
                  <p v-if="spot.address" class="address">{{ spot.address }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 调试信息区域 -->
    <div class="debug-info">
      <h3>调试日志</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mapApi } from '../services/apiService'
import type { TravelPlan, TravelDay, Spot } from '../types'

// 状态管理
const loading = ref(true)
const error = ref('')
const mapStatus = ref('初始化中')
let map: any = null
let markers: any[] = []

// 路由
const route = useRoute()
const planId = route.params.planId as string || '1' // 默认ID

// 响应式行程数据
const travelPlan = ref<TravelPlan>({
  title: '上海三日游',
  destination: '上海',
  startDate: '2024-01-15',
  endDate: '2024-01-17',
  days: []
})

// 筛选和选中状态
const selectedDay = ref(1)
const selectedSpot = ref('')

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any
  }
}


// 调试信息
const debugInfo = ref('')
const addDebugInfo = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  debugInfo.value += `${timestamp}: ${message}\n`
  console.log(`[调试] ${message}`)
}

// 从API获取景点数据
const fetchSpots = async () => {
  try {
    addDebugInfo(`开始获取行程数据，planId: ${planId}`)
    loading.value = true
    
    const response = await mapApi.getSpots(planId)
    addDebugInfo(`获取行程数据成功，响应数据: ${JSON.stringify(response)}`)
    
    // 适配不同的响应结构
    if (response && typeof response === 'object') {
      // 获取景点数组
      let spotsArray = []
      
      // 处理API返回的格式 {code: 1, msg: null, data: [景点数组]}
      if (Array.isArray(response.data)) {
        spotsArray = response.data
      } else if (Array.isArray(response)) {
        spotsArray = response
      }
      
      if (spotsArray.length > 0) {
        // 按day分组景点
        const daysMap = new Map()
        spotsArray.forEach(spot => {
          const dayNum = spot.day || 1
          if (!daysMap.has(dayNum)) {
            daysMap.set(dayNum, {
              day: dayNum,
              date: new Date().toISOString().split('T')[0],
              spots: []
            })
          }
          daysMap.get(dayNum).spots.push({
            name: spot.name,
            type: spot.type || 'attraction',
            lng: spot.lng,
            lat: spot.lat,
            visitTime: spot.visitTime || '',
            address: spot.address || spot.description || '',
            id: spot.id
          })
        })
        
        // 转换为数组并按day排序
        const daysArray = Array.from(daysMap.values()).sort((a, b) => a.day - b.day)
        
        // 更新行程数据
        travelPlan.value = {
          title: `行程计划`,
          destination: '宁夏',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[1],
          days: daysArray
        }
        
        addDebugInfo(`行程数据更新成功，共${travelPlan.value.days.length}天，景点总数: ${spotsArray.length}`)
      } else {
        // 没有景点数据时使用空数组
        travelPlan.value.days = []
        addDebugInfo('未获取到景点数据')
      }
    } else {
      throw new Error('无效的响应格式')
    }
    
    return true
  } catch (err: any) {
    const errorMsg = err.message || '获取行程数据失败'
    addDebugInfo(`获取行程数据失败: ${errorMsg}`)
    error.value = errorMsg
    
    // 错误时使用默认数据
    addDebugInfo('使用默认行程数据')
    
    return false
  } finally {
    loading.value = false
  }
}

// 默认行程数据（作为后备）
const defaultTravelPlan: TravelPlan = {
  title: '上海三日游',
  destination: '上海',
  startDate: '2024-01-15',
  endDate: '2024-01-17',
  days: [
    {
      day: 1,
      date: '2024-01-15',
      spots: [
        {
          name: '外滩',
          type: 'attraction',
          lng: 121.490175,
          lat: 31.239741,
          visitTime: '09:00-11:00',
          address: '上海市黄浦区中山东一路'
        },
        {
          name: '南京路步行街',
          type: 'shopping',
          lng: 121.474653,
          lat: 31.234107,
          visitTime: '11:30-13:30',
          address: '上海市黄浦区南京东路'
        },
        {
          name: '上海博物馆',
          type: 'attraction',
          lng: 121.472644,
          lat: 31.231706,
          visitTime: '14:00-16:00',
          address: '上海市黄浦区人民大道201号'
        },
        {
          name: '人民广场',
          type: 'attraction',
          lng: 121.471846,
          lat: 31.233572,
          visitTime: '16:30-17:30',
          address: '上海市黄浦区人民大道'
        },
        {
          name: '上海大酒店',
          type: 'hotel',
          lng: 121.477335,
          lat: 31.233186,
          address: '上海市黄浦区九江路595号'
        }
      ]
    },
    {
      day: 2,
      date: '2024-01-16',
      spots: [
        {
          name: '上海迪士尼乐园',
          type: 'attraction',
          lng: 121.667428,
          lat: 31.143401,
          visitTime: '08:00-21:00',
          address: '上海市浦东新区川沙新镇黄赵路310号'
        },
        {
          name: '玩具总动员酒店',
          type: 'hotel',
          lng: 121.663715,
          lat: 31.143477,
          address: '上海市浦东新区川沙新镇申迪北路753号'
        }
      ]
    },
    {
      day: 3,
      date: '2024-01-17',
      spots: [
        {
          name: '东方明珠',
          type: 'attraction',
          lng: 121.499765,
          lat: 31.239823,
          visitTime: '10:00-12:00',
          address: '上海市浦东新区世纪大道1号'
        },
        {
          name: '陆家嘴金融中心',
          type: 'shopping',
          lng: 121.504865,
          lat: 31.237735,
          visitTime: '12:30-15:00',
          address: '上海市浦东新区陆家嘴环路'
        },
        {
          name: '田子坊',
          type: 'shopping',
          lng: 121.471078,
          lat: 31.206868,
          visitTime: '15:30-18:00',
          address: '上海市黄浦区泰康路210弄'
        }
      ]
    }
  ]
}

// 获取类型名称
const getTypeName = (type: string): string => {
  // 直接返回中文类型名称，因为API返回的已经是中文
  return type || '其他'
}

// 不再需要景点类型筛选函数

// 跳转到指定景点
const jumpToSpot = (spot: Spot) => {
  if (!spot.lng || !spot.lat || !map) return
  
  addDebugInfo(`跳转到景点: ${spot.name} (${spot.lng}, ${spot.lat})`)
  map.setCenter([spot.lng, spot.lat])
  map.setZoom(15)
  selectedSpot.value = spot.name
  
  // 高亮对应标记
  markers.forEach(marker => {
    if (marker.getTitle() === spot.name) {
      marker.setAnimation('AMAP_ANIMATION_BOUNCE')
      setTimeout(() => {
        marker.setAnimation('AMAP_ANIMATION_NONE')
      }, 2000)
    }
  })
}

// 景点点击事件
const onSpotClick = (spot: Spot) => {
  addDebugInfo(`点击景点: ${spot.name}`)
  if (!spot.lng || !spot.lat) {
    ElMessage.warning('该景点没有坐标信息')
    return
  }
  jumpToSpot(spot)
}

// 天数变化事件
const onDayChange = () => {
  addDebugInfo(`切换到第${selectedDay.value}天`)
  const currentDay = travelPlan.value.days.find(d => d.day === selectedDay.value)
  if (currentDay && currentDay.spots && currentDay.spots.length > 0) {
    const firstSpot = currentDay.spots.find((spot: any) => spot.lng && spot.lat)
    if (firstSpot) {
      jumpToSpot(firstSpot)
    }
  }
}

// 不再需要景点类型筛选函数

// 渲染所有标记
const renderMarkers = () => {
  if (!map) return
  
  // 清除现有标记
  markers.forEach(marker => map.remove(marker))
  markers = []
  
  // 添加新标记
  travelPlan.value.days.forEach(day => {
    if (day.spots && Array.isArray(day.spots)) {
      day.spots.forEach((spot: any) => {
        // 不再需要类型筛选
        
        if (spot.lng && spot.lat) {
          const marker = new window.AMap.Marker({
            position: [spot.lng, spot.lat],
            title: spot.name,
            icon: new window.AMap.Icon({
              size: new window.AMap.Size(36, 36),
              imageSize: new window.AMap.Size(36, 36),
              image: getMarkerIcon(spot.type)
            }),
            extData: { spot }
          })
          
          // 添加标记点击事件
          marker.on('click', () => {
            onSpotClick(spot)
          })
          
          markers.push(marker)
          marker.setMap(map)
        }
      })
    }
  })
}

// 获取标记图标
const getMarkerIcon = (type: string): string => {
  // 统一使用历史文化类型的蓝色标记图标
  return 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
}

// 初始化地图
const initMap = async () => {
  try {
    addDebugInfo('开始初始化地图')
    loading.value = true
    mapStatus.value = '初始化中'
    
    await nextTick()
    
    const container = document.getElementById('mapContainer')
    if (!container) {
      throw new Error('地图容器未找到')
    }
    
    // 强制设置容器尺寸
    Object.assign(container.style, {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      position: 'relative',
      zIndex: '1'
    })
    
    // 加载AMap SDK
    addDebugInfo('开始加载AMap SDK')
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://webapi.amap.com/maps?v=1.4.15&key=e99dd91dd2b26b83aba04ab7544f0033'
    
    script.onload = () => {
      try {
        addDebugInfo('AMap SDK加载成功')
        
        if (!window.AMap) {
          throw new Error('AMap对象不可用')
        }
        
        // 创建地图实例
        addDebugInfo('创建地图实例')
        map = new window.AMap.Map(container, {
          zoom: 12,
          viewMode: '2D',
          showBuildingBlock: false,
          pitch: 0,
          rotation: 0
        })
        
        // 监听完成事件
        map.on('complete', () => {
          addDebugInfo('地图加载完成')
          mapStatus.value = '加载完成'
          loading.value = false
          
          // 渲染标记
          renderMarkers()
          
          // 初始定位到第一天第一个景点
          const firstDay = travelPlan.value.days[0]
          if (firstDay && firstDay.spots && firstDay.spots.length > 0) {
            const firstSpot = firstDay.spots.find((spot: any) => spot.lng && spot.lat)
            if (firstSpot) {
              jumpToSpot(firstSpot)
            } else {
              // 如果没有坐标，使用默认中心
              map.setCenter([121.4737, 31.2304]) // 上海中心
            }
          }
          
          ElMessage.success('地图加载成功')
        })
        
        // 监听错误事件
        map.on('error', (e: any) => {
          const errorMsg = e.error || '未知地图错误'
          addDebugInfo(`地图加载错误: ${errorMsg}`)
          mapStatus.value = '加载失败'
          error.value = `地图渲染错误: ${errorMsg}`
          loading.value = false
          ElMessage.error('地图加载失败')
        })
        
      } catch (err: any) {
        const errorMsg = err.message || '地图初始化异常'
        addDebugInfo(`地图初始化失败: ${errorMsg}`)
        mapStatus.value = '初始化失败'
        error.value = errorMsg
        loading.value = false
        ElMessage.error('地图初始化失败')
      }
    }
    
    script.onerror = () => {
      addDebugInfo('AMap SDK加载失败')
      mapStatus.value = 'SDK加载失败'
      error.value = '无法加载高德地图SDK'
      loading.value = false
      ElMessage.error('高德地图SDK加载失败')
    }
    
    document.head.appendChild(script)
    
  } catch (err: any) {
    const errorMsg = err.message || '未知初始化错误'
    addDebugInfo(`初始化过程出错: ${errorMsg}`)
    mapStatus.value = '初始化失败'
    error.value = errorMsg
    loading.value = false
    ElMessage.error('地图初始化失败')
  }
}

// 监听路由参数变化
watch(
  () => route.params.planId,
  (newPlanId) => {
    if (newPlanId) {
      addDebugInfo(`路由参数变化，新的planId: ${newPlanId}`)
      planId = newPlanId as string
      // 重新获取数据并渲染
      fetchSpots().then(() => {
        renderMarkers()
        // 如果有数据，设置默认选中第一天
        if (travelPlan.value.days.length > 0) {
          selectedDay.value = travelPlan.days[0].day
          onDayChange()
        }
      })
    }
  },
  { immediate: false }
)

onMounted(async () => {
  addDebugInfo('地图页面挂载')
  
  // 立即设置默认数据，确保地图有内容显示
  travelPlan.value = defaultTravelPlan
  
  // 设置默认选中第一天
  if (travelPlan.value.days.length > 0) {
    selectedDay.value = travelPlan.value.days[0].day
    addDebugInfo(`默认选中第${selectedDay.value}天`)
  }
  
  // 立即初始化地图，不等待API数据
  await nextTick()
  setTimeout(() => {
    initMap()
  }, 100)
  
  // 异步获取API数据，但不阻塞地图显示
  fetchSpots().then((success) => {
    if (success) {
      addDebugInfo('API数据获取成功，更新地图标记')
      // 如果地图已初始化，更新标记
      if (map) {
        renderMarkers()
        
        // 重新定位到第一天第一个景点
        if (travelPlan.value.days.length > 0) {
          const firstDay = travelPlan.value.days[0]
          if (firstDay && firstDay.spots && firstDay.spots.length > 0) {
            const firstSpot = firstDay.spots.find((spot: any) => spot.lng && spot.lat)
            if (firstSpot) {
              jumpToSpot(firstSpot)
            }
          }
        }
      }
    } else {
      addDebugInfo('API数据获取失败，继续使用默认数据')
    }
  })
})

onUnmounted(() => {
  if (map) {
    map.destroy()
    map = null
    markers = []
  }
})
</script>

<style scoped>
/* 确保整个页面有足够高度 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.map-container-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.map-container-page h1 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

/* 主内容区域 - 左右布局 */
.main-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 100px);
}

/* 左侧地图区域 */
.map-section {
  flex: 1;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  background-color: #f0f0f0;
}

/* 右侧侧边栏 */
.sidebar-section {
  width: 400px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 筛选栏 */
.filter-section {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.filter-section h3 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.filter-group {
  margin-bottom: 12px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  color: #606266;
  font-size: 14px;
}

.filter-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.filter-group select:focus {
  border-color: #409eff;
}

/* 行程详情 */
.travel-details {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.travel-details h3 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.plan-info {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.plan-info p {
  margin-bottom: 4px;
  color: #606266;
  font-size: 14px;
}

.plan-info p:last-child {
  margin-bottom: 0;
}

/* 每日行程 */
.day-section {
  margin-bottom: 20px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.3s;
}

.day-section.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.day-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

/* 景点列表 */
.spots-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spot-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.spot-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spot-item.active-spot {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.spot-item.filtered {
  opacity: 0.4;
  pointer-events: none;
}

/* 景点类型标签 */
.spot-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-right: 12px;
  white-space: nowrap;
  color: #fff;
}

/* 中文类型的颜色样式 */
.spot-type.自然景观 { background-color: #409eff; }
.spot-type.历史文化 { background-color: #e6a23c; }
.spot-type.影视文化 { background-color: #67c23a; }

/* 英文类型的颜色样式 */
.spot-type.attraction { background-color: #f56c6c; }
.spot-type.restaurant { background-color: #67c23a; }
.spot-type.hotel { background-color: #409eff; }
.spot-type.shopping { background-color: #909399; }
.spot-type.transport { background-color: #e6a23c; }
.spot-type.other { background-color: #909399; }

/* 默认类型 */
.spot-type:not([class*="attraction"]):not([class*="restaurant"]):not([class*="hotel"]):not([class*="shopping"]):not([class*="transport"]):not([class*="自然景观"]):not([class*="历史文化"]):not([class*="影视文化"]):not([class*="other"]) {
  background-color: #909399;
}

/* 景点信息 */
.spot-info {
  flex: 1;
}

.spot-info h5 {
  margin-bottom: 6px;
  color: #303133;
  font-size: 15px;
  font-weight: 500;
}

.visit-time {
  margin-bottom: 4px;
  color: #409eff;
  font-size: 13px;
}

.address {
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

/* 加载覆盖层 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 16px;
  z-index: 100;
}

/* 错误消息 */
.error-message {
  color: #f56c6c;
  padding: 10px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  margin: 10px;
  font-weight: bold;
}

/* 调试信息 */
.debug-info {
  margin-top: 20px;
  padding: 16px;
  background: #f4f4f5;
  border-radius: 6px;
  max-height: 300px;
  overflow: hidden;
}

.debug-info h3 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.debug-info pre {
  font-family: monospace;
  font-size: 12px;
  color: #606266;
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e6ed;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar-section {
    width: 100%;
    max-height: 500px;
  }
  
  .map-section {
    height: 500px;
  }
}
</style>