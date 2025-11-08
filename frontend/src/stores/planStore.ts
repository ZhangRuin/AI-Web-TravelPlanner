import { defineStore } from 'pinia';
import { planApi } from '../services/apiService';
import { useUserStore } from './userStore';

// localStorage存储键名
const STORAGE_KEY = 'travel_plans';

export interface Spot {
  id: string;
  name: string;
  lng: number;
  lat: number;
  description: string;
  type: string;
  openingHours?: string;
  price?: number;
  rating?: number;
}

export interface PlanDay {
  id: string;
  day: number;
  spots: Spot[];
  accommodation?: string;
  notes?: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  people: number;
  preferences: string[];
  days: PlanDay[];
  createdAt: string;
  updatedAt: string;
}

export const usePlanStore = defineStore('plan', {
  state: () => ({
    plans: [] as TravelPlan[],
    currentPlan: null as TravelPlan | null,
    loading: false,
    error: null as string | null,
    creating: false,
  }),
  

  
  getters: {
    // 获取用户所有行程
    allPlans: (state) => state.plans,
    // 获取当前行程
    getCurrentPlan: (state) => state.currentPlan,
    // 按目的地筛选行程
    getPlansByDestination: (state) => (destination: string) => {
      return state.plans.filter(plan => 
        plan.destination.toLowerCase().includes(destination.toLowerCase())
      );
    },
    // 获取行程总天数
    getPlanDays: (state) => (planId: string) => {
      const plan = state.plans.find(p => p.id === planId);
      return plan ? plan.days.length : 0;
    },
  },
  
  actions: {
    // 初始化store，优先从后端获取数据，失败时再从localStorage加载
    async initializeStore() {
      try {
        // 首先尝试从后端数据库获取最新的行程列表
        await this.fetchAllPlans();
        console.log('从后端数据库加载行程数据成功');
      } catch (apiError) {
        console.warn('无法从后端获取行程，尝试从localStorage加载:', apiError);
        // 如果API调用失败，从localStorage加载作为备份
        try {
          const savedData = localStorage.getItem(STORAGE_KEY);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            this.plans = parsed.plans || [];
          }
          console.log('从localStorage加载了行程数据:', this.plans.length, '个行程');
        } catch (localError) {
          console.error('加载localStorage数据失败:', localError);
          this.plans = [];
        }
      }
    },
    
    // 保存数据到localStorage
    saveToStorage() {
      try {
        const dataToSave = {
          plans: this.plans,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log('行程数据已保存到localStorage');
      } catch (error) {
        console.error('保存数据到localStorage失败:', error);
      }
    },
    
    // 设置行程列表（用于模拟数据）
    setPlans(plans: TravelPlan[]) {
      this.plans = plans;
    },
    
    // 获取所有行程
      async fetchAllPlans() {
        this.loading = true;
        this.error = null;
        try {
          const userStore = useUserStore();
          if (userStore.isAuthenticated && userStore.user && userStore.user.id) {
            const userId = Number(userStore.user.id);
            const response = await planApi.getUserPlans(userId);
          console.log('API响应数据:', response);
          console.log('API响应类型:', typeof response);
          console.log('API响应是否为数组:', Array.isArray(response));
          
          // 处理API响应结构，实际数据在data字段中
          const planDataArray = response.data || response;
          console.log('实际行程数据数组:', planDataArray);
          console.log('数据是否为数组:', Array.isArray(planDataArray));
          
          // 转换后端返回的数据格式以匹配前端TravelPlan接口
          this.plans = planDataArray.map((plan: any) => {
              // 首先尝试解析planData字段获取真实的行程数据
              let days: PlanDay[] = [];
              
              try {
                  if (plan.planData) {
                      console.log(`解析planData: ${plan.planData}`);
                      // 解析planData JSON字符串
                      const parsedPlanData = JSON.parse(plan.planData);
                      
                      if (Array.isArray(parsedPlanData)) {
                          // 转换解析后的数据为前端需要的格式
                          days = parsedPlanData.map((dayData: any, index: number) => {
                              const spots: Spot[] = [];
                              
                              if (dayData.spots && Array.isArray(dayData.spots)) {
                                  // 为每个景点添加ID和其他必要字段
                                  spots.push(...dayData.spots.map((spotData: any, spotIndex: number) => ({
                                      id: `spot_${plan.id}_${dayData.day || index + 1}_${spotIndex}`,
                                      name: spotData.name || '未知景点',
                                      description: spotData.description || '',
                                      type: spotData.type || '景点',
                                      lng: typeof spotData.lng === 'number' ? spotData.lng : 0,
                                      lat: typeof spotData.lat === 'number' ? spotData.lat : 0,
                                      openingHours: spotData.openingHours,
                                      price: spotData.price,
                                      rating: spotData.rating
                                  })));
                              }
                              
                              return {
                                  id: `day_${plan.id}_${dayData.day || index + 1}`,
                                  day: dayData.day || index + 1,
                                  spots: spots,
                                  accommodation: dayData.accommodation,
                                  notes: dayData.notes
                              };
                          });
                          
                          console.log(`成功解析行程数据，共${days.length}天`);
                      } else {
                          console.warn('planData不是数组格式:', parsedPlanData);
                      }
                  }
              } catch (error) {
                  console.error('解析planData失败:', error);
              }
              
              // 如果planData解析失败或没有数据，创建默认的行程天数数据
              if (days.length === 0) {
                  console.log('使用默认行程数据');
                  // 计算行程天数
                  const start = new Date(plan.startDate || new Date());
                  const end = new Date(plan.endDate || new Date());
                  const dayCount = plan.days || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  
                  for (let i = 1; i <= dayCount; i++) {
                      // 创建一些默认景点数据
                      const defaultSpots: Spot[] = [
                          {
                              id: `spot_${plan.id}_${i}_1`,
                              name: `${plan.destination || '目的地'}主要景点`,
                              description: `第${i}天的主要游览景点。`,
                              type: '景点',
                              lng: 116.4 + (i * 0.001),
                              lat: 39.9 + (i * 0.001),
                              openingHours: '09:00-18:00',
                              price: 100,
                              rating: 4.5
                          },
                          {
                              id: `spot_${plan.id}_${i}_2`,
                              name: `${plan.destination || '目的地'}特色餐厅`,
                              description: `第${i}天推荐的当地特色餐厅。`,
                              type: '餐厅',
                              lng: 116.401 + (i * 0.001),
                              lat: 39.901 + (i * 0.001),
                              openingHours: '11:00-22:00',
                              price: 80
                          }
                      ];
                      
                      days.push({
                          id: `day_${plan.id}_${i}`,
                          day: i,
                          spots: defaultSpots,
                          accommodation: `第${i}天推荐住宿：${plan.destination || '目的地'}市中心酒店`,
                          notes: `第${i}天行程安排`
                      });
                  }
              }
              
              // 确保开始日期和结束日期正确
              const startDate = plan.startDate || new Date().toISOString().split('T')[0];
              // 如果结束日期不存在或无效，根据开始日期和天数计算结束日期
              let endDate = plan.endDate;
              if (!endDate || endDate === '') {
                  const start = new Date(startDate);
                  const calculatedEnd = new Date(start);
                  // 计算结束日期（开始日期 + (天数 - 1)）
                  calculatedEnd.setDate(start.getDate() + (plan.days || days.length) - 1);
                  endDate = calculatedEnd.toISOString().split('T')[0];
              }
              
              return {
                  id: plan.id.toString(),
                  title: plan.title || '未命名行程',
                  destination: plan.destination || '',
                  startDate: startDate,
                  endDate: endDate,
                  budget: plan.budget || 0,
                  people: plan.people || 1,
                  preferences: plan.preferences ? JSON.parse(plan.preferences) : [],
                  days: days,
                  createdAt: plan.createdAt,
                  updatedAt: plan.updatedAt
              };
          });
          
          // 保存到localStorage
          this.saveToStorage();
          return this.plans;
        } else {
          console.warn('用户未登录，无法获取后端行程列表');
          return [];
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取行程列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取单个行程详情
    async fetchPlanDetail(planId: string) {
      this.loading = true;
      this.error = null;
      try {
        // 首先检查本地状态中是否已有该行程
        let plan = this.plans.find(p => p.id === planId);
        
        // 如果本地找到了行程，直接使用本地数据
        if (plan) {
          this.currentPlan = plan;
          return plan;
        }
        
        // 如果当前行程就是要查找的行程，直接使用
        if (this.currentPlan?.id === planId) {
          return this.currentPlan;
        }
        
        try {
          // 尝试从API获取行程详情
          const response = await planApi.getPlanDetail(planId);
          // 确保响应是对象格式
          const responseData = typeof response === 'object' && response !== null ? response : {};
          // 提取行程数据（兼容不同的响应格式）
          plan = (responseData as any).data || responseData;
          
          // 如果获取到了行程，确保每个天数和景点都有ID
          if (plan) {
            // 确保每个天数和景点都有ID
            if (Array.isArray(plan.days)) {
              plan.days.forEach(day => {
                if (!day.id) {
                  day.id = `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                
                if (Array.isArray(day.spots)) {
                  day.spots.forEach(spot => {
                    if (!spot.id) {
                      spot.id = `spot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                  });
                }
              });
            }
          }
        } catch (apiError) {
          // 如果API调用失败（例如临时ID），提供模拟数据用于开发和测试
          console.warn('无法从API获取行程详情，提供模拟数据用于开发:', planId);
          
          // 模拟行程数据 - 上海三日游
          const mockPlan: TravelPlan = {
            id: planId || 'demo_plan_1',
            title: '上海三日游',
            destination: '上海',
            startDate: '2024-05-01',
            endDate: '2024-05-03',
            budget: 3000,
            people: 2,
            preferences: ['景点', '美食', '购物'],
            days: [
              {
                id: 'mock_day_1',
                day: 1,
                spots: [
                  {
                    id: 'mock_spot_101',
                    name: '外滩',
                    lng: 121.4909,
                    lat: 31.2397,
                    description: '上海最著名的景点之一，可欣赏黄浦江两岸风光',
                    type: 'attraction',
                    rating: 4.7
                  },
                  {
                    id: 'mock_spot_102',
                    name: '南京路步行街',
                    lng: 121.4737,
                    lat: 31.2340,
                    description: '上海最繁华的商业街',
                    type: 'shopping',
                    rating: 4.5
                  },
                  {
                    id: 'mock_spot_103',
                    name: '上海博物馆',
                    lng: 121.4726,
                    lat: 31.2333,
                    description: '中国四大博物馆之一',
                    type: 'attraction',
                    openingHours: '9:00-17:00（周一闭馆）',
                    price: 0,
                    rating: 4.8
                  }
                ]
              },
              {
                id: 'mock_day_2',
                day: 2,
                spots: [
                  {
                    id: 'mock_spot_201',
                    name: '上海迪士尼乐园',
                    lng: 121.6679,
                    lat: 31.1434,
                    description: '亚洲最大的迪士尼主题乐园',
                    type: 'attraction',
                    price: 799,
                    rating: 4.6
                  },
                  {
                    id: 'mock_spot_202',
                    name: '上海迪士尼小镇',
                    lng: 121.6637,
                    lat: 31.1419,
                    description: '迪士尼周边购物餐饮区',
                    type: 'shopping',
                    rating: 4.4
                  }
                ]
              },
              {
                id: 'mock_day_3',
                day: 3,
                spots: [
                  {
                    id: 'mock_spot_301',
                    name: '上海中心大厦',
                    lng: 121.5066,
                    lat: 31.2372,
                    description: '中国第一高楼',
                    type: 'attraction',
                    price: 180,
                    rating: 4.5
                  },
                  {
                    id: 'mock_spot_302',
                    name: '陆家嘴金融中心',
                    lng: 121.5042,
                    lat: 31.2376,
                    description: '上海金融核心区',
                    type: 'attraction',
                    rating: 4.4
                  },
                  {
                    id: 'mock_spot_303',
                    name: '田子坊',
                    lng: 121.4706,
                    lat: 31.2163,
                    description: '文艺小资聚集地',
                    type: 'shopping',
                    rating: 4.3
                  }
                ]
              }
            ],
            createdAt: '2024-04-20T08:00:00Z',
            updatedAt: '2024-04-25T10:30:00Z'
          };
          
          plan = mockPlan;
        }
        
        // 如果找到了行程或创建了模拟行程，设置为当前行程
        if (plan) {
          // 将行程添加到本地列表（如果不存在）
          if (!this.plans.some(p => p.id === plan.id)) {
            this.plans.push(plan);
          } else {
            // 更新列表中的对应项
            const index = this.plans.findIndex(p => p.id === planId);
            if (index !== -1) {
              this.plans[index] = plan;
            }
          }
          // 设置为当前行程
          this.currentPlan = plan;
          // 保存到localStorage
          this.saveToStorage();
        }
        
        return plan;
      } catch (error: any) {
        this.error = error.response?.data?.message || '获取行程详情失败';
        // 不抛出错误，避免页面崩溃
        console.error('获取行程详情错误:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 创建新行程 - 调用AI生成接口
    async createPlan(planData: {
      destination: string;
      startDate: string;
      endDate: string;
      budget: number;
      people: number;
      preferences: string[];
      title?: string;
    }) {
      this.creating = true;
      this.error = null;
      try {
        // 调用AI生成接口
        const response = await planApi.createPlan(planData);
        
        console.log('AI生成接口响应:', response);
        
        // 确保响应是对象格式
        const aiResponse = typeof response === 'object' && response !== null ? response : {};
        
        // 安全获取响应数据
        const responseData = (aiResponse as any).data || {};
        
        // 处理Result<PlanResponse>格式的响应，提取实际的plan数据
        let planDataFromResponse = responseData;
        
        // 计算行程天数
        const dayCount = Math.ceil((new Date(planData.endDate).getTime() - new Date(planData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // 获取AI生成的行程计划，并确保为每个PlanDay和Spot生成唯一ID
        const daysWithIds: PlanDay[] = [];
        // 尝试从不同可能的路径获取行程数据
        const rawDays = Array.isArray(planDataFromResponse?.plan) ? planDataFromResponse.plan : 
                       Array.isArray(responseData?.days) ? responseData.days : 
                       [];
        
        console.log('提取的原始行程数据:', rawDays);
        
        // 处理每一天的行程，确保符合PlanDay接口格式
        for (const dayData of rawDays) {
          const spotsWithIds: Spot[] = [];
          
          // 为每个景点生成唯一ID并确保符合Spot接口
          if (Array.isArray(dayData.spots)) {
            for (const spotData of dayData.spots) {
              const spot: Spot = {
                id: `spot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: spotData.name || '未知景点',
                lng: typeof spotData.lng === 'number' ? spotData.lng : 0,
                lat: typeof spotData.lat === 'number' ? spotData.lat : 0,
                description: spotData.description || '',
                type: spotData.type || '景点',
                openingHours: spotData.openingHours,
                price: spotData.price,
                rating: spotData.rating
              };
              spotsWithIds.push(spot);
            }
          }
          
          // 创建符合PlanDay接口的对象
          const planDay: PlanDay = {
            id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            day: typeof dayData.day === 'number' ? dayData.day : daysWithIds.length + 1,
            spots: spotsWithIds,
            accommodation: dayData.accommodation,
            notes: dayData.notes
          };
          
          daysWithIds.push(planDay);
        }
        
        // 如果AI没有返回任何天数，创建默认的行程结构
        if (daysWithIds.length === 0) {
          // 创建1-N天的默认行程骨架，包含一些模拟景点数据
          const mockSpots = [
            {
              name: '市区主要景点',
              description: '游览目的地的标志性景点，了解当地历史文化。',
              type: '景点',
              lng: 116.397,
              lat: 39.908,
              openingHours: '08:00-17:00',
              price: 100
            },
            {
              name: '当地特色餐厅',
              description: '品尝正宗当地美食，体验特色餐饮文化。',
              type: '餐厅',
              lng: 116.398,
              lat: 39.907,
              openingHours: '10:00-22:00',
              price: 80
            },
            {
              name: '城市购物中心',
              description: '购买纪念品和当地特色商品。',
              type: '购物',
              lng: 116.399,
              lat: 39.906,
              openingHours: '10:00-21:00'
            }
          ];
          
          for (let i = 1; i <= dayCount; i++) {
            // 为每一天生成不同的景点组合
            const daySpots: Spot[] = mockSpots.map((spotData, index) => ({
              id: `mock_spot_${i}_${index}_${Date.now()}`,
              name: `${spotData.name} - 第${i}天`,
              description: spotData.description,
              type: spotData.type,
              lng: spotData.lng + (i * 0.001), // 稍微调整经纬度以示区别
              lat: spotData.lat + (i * 0.001),
              openingHours: spotData.openingHours,
              price: spotData.price,
              rating: 4.5
            }));
            
            const defaultDay: PlanDay = {
              id: `day_default_${i}_${Date.now()}`,
              day: i,
              spots: daySpots, // 包含模拟景点数据
              accommodation: `推荐第${i}天住宿: ${planData.destination}市中心酒店`,
              notes: `第${i}天行程：市区游览，品尝当地美食，购物体验`
            };
            daysWithIds.push(defaultDay);
          }
        }
        
        // 检查现有的天数，如果景点为空，也添加一些模拟数据
        for (const day of daysWithIds) {
          if (!day.spots || day.spots.length === 0) {
            const mockSpots = [
              {
                name: `${planData.destination}必游景点`,
                description: `在第${day.day}天游览的主要景点。`,
                type: '景点',
                lng: 116.4 + (day.day * 0.002),
                lat: 39.9 + (day.day * 0.002),
                openingHours: '09:00-18:00',
                price: 120,
                rating: 4.7
              },
              {
                name: `${planData.destination}特色餐厅`,
                description: '推荐尝试当地特色菜品。',
                type: '餐厅',
                lng: 116.401 + (day.day * 0.002),
                lat: 39.901 + (day.day * 0.002),
                openingHours: '11:00-22:00',
                price: 90
              }
            ];
            
            day.spots = mockSpots.map((spotData, index) => ({
              id: `spot_fill_${day.day}_${index}_${Date.now()}`,
              ...spotData
            }));
            
            if (!day.notes) {
              day.notes = `第${day.day}天行程安排`;
            }
          }
        }
        
        // 创建符合前端TravelPlan接口的完整对象
        const newPlan: TravelPlan = {
          id: Date.now().toString(), // 临时ID，保存时会更新
          title: planData.title || `${planData.destination} ${dayCount}日游`,
          destination: planData.destination,
          startDate: planData.startDate,
          endDate: planData.endDate,
          budget: planData.budget,
          people: planData.people,
          preferences: planData.preferences,
          days: daysWithIds, // 包含有效ID的行程天数
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 添加到列表开头并设置为当前行程
        this.plans.unshift(newPlan);
        this.currentPlan = newPlan;
        
            // 获取当前登录用户信息
        const userStore = useUserStore();
        
        // 调用savePlan API将行程保存到后端数据库
        if (userStore.isAuthenticated && userStore.user && userStore.user.id) {
          const userId = Number(userStore.user.id);
          // 准备保存到数据库的数据格式 - 添加所有必要字段
          const saveData = {
            title: newPlan.title,
            destination: newPlan.destination,  // 确保包含destination字段
            startDate: newPlan.startDate,  // 添加开始日期
            endDate: newPlan.endDate,  // 添加结束日期
            days: newPlan.days.length,
            budget: newPlan.budget,
            people: newPlan.people,  // 添加人数信息
            preferences: newPlan.preferences,
            plan: newPlan.days.map(day => ({
              day: day.day,
              spots: day.spots,
              accommodation: day.accommodation,
              notes: day.notes
            }))
          };
          
          console.log('准备保存到数据库的数据:', saveData);
          
          try {
            const saveResponse = await planApi.savePlan(saveData, userId);
            console.log('行程已成功保存到数据库:', saveResponse);
            
            // 如果后端返回了新的planId，更新本地ID
            if (saveResponse?.data?.planId) {
              // 使用更可靠的方式查找和更新
              const originalId = newPlan.id;
              newPlan.id = saveResponse.data.planId.toString();
              
              // 直接更新当前计划和计划列表
              this.currentPlan = newPlan;
              
              // 找到之前添加的临时计划并更新
              const index = this.plans.findIndex(p => p.id === originalId);
              if (index !== -1) {
                this.plans[index] = newPlan;
              }
              
              console.log('本地行程ID已更新:', newPlan.id);
              
              // 保存更新后的状态到localStorage
              this.saveToStorage();
              
              // 立即重新获取用户所有行程，确保数据同步
              console.log('立即重新获取用户行程以同步数据');
              await this.fetchAllPlans();
            }
          } catch (saveError: any) {
            console.error('保存行程到数据库失败:', saveError);
            // 详细打印错误信息以便调试
            if (saveError.response) {
              console.error('保存错误详情 - 状态码:', saveError.response.status);
              console.error('保存错误详情 - 响应数据:', saveError.response.data);
            } else if (saveError.request) {
              console.error('保存错误 - 无响应:', saveError.request);
            } else {
              console.error('保存错误 - 请求配置:', saveError.message);
            }
          }
        } else {
          console.warn('用户未登录，无法保存行程到数据库');
        }
        
        // 保存到localStorage作为备份
        this.saveToStorage();
        
        console.log('创建的行程对象:', this.currentPlan);
        
        return this.currentPlan;
      } catch (error: any) {
        console.error('行程生成错误:', error);
        this.error = error.response?.data?.message || error.message || '创建行程失败';
        throw error;
      } finally {
        this.creating = false;
      }
    },
    
    // 更新行程
    async updatePlan(planId: string, planData: Partial<TravelPlan>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await planApi.updatePlan(planId, planData);
        const updatedPlan = response.data; // 访问response.data
        // 更新本地状态
        const index = this.plans.findIndex(p => p.id === planId);
        if (index !== -1) {
          this.plans[index] = { ...this.plans[index], ...updatedPlan };
        }
        if (this.currentPlan?.id === planId) {
          this.currentPlan = { ...this.currentPlan, ...updatedPlan };
        }
        
        // 保存到localStorage
        this.saveToStorage();
        return updatedPlan;
      } catch (error: any) {
        this.error = error.response?.data?.message || '更新行程失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除行程
    async deletePlan(planId: string) {
      this.loading = true;
      this.error = null;
      try {
        await planApi.deletePlan(planId);
        // 从本地状态中移除
        this.plans = this.plans.filter(p => p.id !== planId);
        if (this.currentPlan?.id === planId) {
          this.currentPlan = null;
        }
        
        // 保存到localStorage
        this.saveToStorage();
      } catch (error: any) {
        this.error = error.response?.data?.message || '删除行程失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 清除当前行程
    clearCurrentPlan() {
      this.currentPlan = null;
    },
    
    // 清除错误
    clearError() {
      this.error = null;
    },
  },
});