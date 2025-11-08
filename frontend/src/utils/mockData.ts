/**
 * 模拟数据
 * 提供测试用的用户、行程、费用等数据
 */

import type { TravelPlan, Spot, PlanDay } from '../stores/planStore';
import type { Expense } from '../stores/budgetStore';

// 模拟用户数据
export const mockUser = {
  id: 'user1',
  username: '旅行者',
  email: 'traveler@example.com',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  createdAt: '2023-01-15T08:30:00Z',
  lastLogin: '2024-01-15T14:20:00Z'
};

// 模拟行程数据
export const mockPlans: TravelPlan[] = [
  {
    id: 'plan1',
    title: '东京5日游',
    destination: '日本东京',
    startDate: '2024-03-10',
    endDate: '2024-03-14',
    budget: 10000,
    people: 2,
    preferences: ['美食', '购物', '动漫'],
    days: [
      {
        id: 'day-1-hk',
        day: 1,
        spots: [
          {
            id: 'spot1',
            name: '浅草寺',
            type: '景点',
            lat: 35.714728,
            lng: 139.796763,
            description: '东京最古老的寺庙，建于公元628年',
            openingHours: '06:00-17:00',
            price: 0,


          },
          {
            id: 'spot2',
            name: '东京晴空塔',
            type: '景点',
            lat: 35.710063,
            lng: 139.810719,
            description: '日本最高的电视塔，高达634米',
            openingHours: '09:00-22:00',
            price: 2800,


          },
          {
            id: 'spot3',
            name: '东京站一番街',
            type: '购物',
            lat: 35.681382,
            lng: 139.766083,
            description: '东京站地下美食购物街',
            openingHours: '10:00-21:00',
            price: undefined,


          }
        ]
      },
      {
        id: 'day-2-hk',
        day: 2,
        spots: [
          {
            id: 'spot4',
            name: '明治神宫',
            type: '景点',
            lat: 35.676444,
            lng: 139.698889,
            description: '位于繁华的涩谷区的一座神宫',
            openingHours: '日出-日落',
            price: 0,


          },
          {
            id: 'spot5',
            name: '涩谷十字路口',
            type: '景点',
            lat: 35.659462,
            lng: 139.700463,
            description: '世界上最繁忙的人行横道之一',
            openingHours: '全天',
            price: 0,


          },
          {
            id: 'spot6',
            name: '原宿竹下通',
            type: '购物',
            lat: 35.665841,
            lng: 139.701437,
            description: '年轻人聚集的潮流购物街',
            openingHours: '10:00-20:00',
            price: undefined,


          }
        ]
      },
      {
        id: 'day-3-hk',
        day: 3,
        spots: [
          {
            id: 'spot7',
            name: '迪士尼乐园',
            type: '景点',
            lat: 35.632892,
            lng: 139.880385,
            description: '东京迪士尼乐园',
            openingHours: '08:00-22:00',
            price: 7900,


          }
        ]
      },
      {
        id: 'day-4-tokyo',
        day: 4,
        spots: [
          {
            id: 'spot8',
            name: '秋叶原电器街',
            type: '购物',
            lat: 35.702146,
            lng: 139.774137,
            description: '世界著名的电器和动漫产品中心',
            openingHours: '10:00-20:00',
            price: undefined,


          },
          {
            id: 'spot9',
            name: '上野公园',
            type: '景点',
            lat: 35.714215,
            lng: 139.774991,
            description: '东京最大的公园之一',
            openingHours: '05:00-23:00',
            price: 0,


          },
          {
            id: 'spot10',
            name: '池袋',
            type: '购物',
            lat: 35.698634,
            lng: 139.701733,
            description: '繁华的购物区',
            openingHours: '10:00-21:00',
            price: undefined,


          }
        ]
      },
      {
        id: 'day-5-tokyo',
        day: 5,
        spots: [
          {
            id: 'spot11',
            name: '新宿御苑',
            type: '景点',
            lat: 35.685225,
            lng: 139.699911,
            description: '东京市中心的大型公园',
            openingHours: '09:00-16:30',
            price: 500,


          },
          {
            id: 'spot12',
            name: '六本木Hills',
            type: '购物',
            lat: 35.662616,
            lng: 139.731831,
            description: '综合性商业设施',
            openingHours: '11:00-21:00',
            price: undefined,


          }
        ]
      }
    ],

    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T16:45:00Z',

  },
  {
    id: 'plan2',
    title: '巴黎艺术之旅',
    destination: '法国巴黎',
    startDate: '2024-05-05',
    endDate: '2024-05-10',
    budget: 15000,
    people: 2,
    preferences: ['艺术', '历史', '美食'],
    days: [
      {
        id: 'day-1-paris',
        day: 1,
        spots: [
          {
            id: 'spot13',
            name: '埃菲尔铁塔',
            type: '景点',
            lat: 48.858370,
            lng: 2.294481,
            description: '巴黎的标志性建筑',
            openingHours: '09:30-23:45',
            price: 2500,


          },
          {
            id: 'spot14',
            name: '凯旋门',
            type: '景点',
            lat: 48.873781,
            lng: 2.295038,
            description: '为纪念拿破仑战争胜利而建',
            openingHours: '10:00-22:00',
            price: 1700,


          }
        ]
      }
    ],

    createdAt: '2024-02-10T14:20:00Z',
    updatedAt: '2024-02-15T09:30:00Z',

  },
  {
    id: 'plan3',
    title: '泰国普吉岛度假',
    destination: '泰国普吉岛',
    startDate: '2024-07-15',
    endDate: '2024-07-20',
    budget: 8000,
    people: 4,
    preferences: ['海滩', '美食', '放松'],
    days: [],

    createdAt: '2024-03-05T08:45:00Z',
    updatedAt: '2024-03-05T08:45:00Z',

  }
];

// 模拟费用数据
export const mockExpenses: Expense[] = [
  {
    id: 'expense1',
    planId: 'plan1',
    category: '交通',
    amount: 2500,
    description: '新干线车票',
    date: '2024-03-10',

  },
  {
    id: 'expense2',
    planId: 'plan1',
    category: '住宿',
    amount: 1200,
    description: '酒店住宿',
    date: '2024-03-10',

  },
  {
    id: 'expense3',
    planId: 'plan1',
    category: '餐饮',
    amount: 650,
    description: '晚餐',
    date: '2024-03-10',

  },
  {
    id: 'expense4',
    planId: 'plan1',
    category: '购物',
    amount: 1200,
    description: '纪念品',
    date: '2024-03-11',

  },
  {
    id: 'expense5',
    planId: 'plan1',
    category: '门票',
    amount: 2800,
    description: '晴空塔门票',
    date: '2024-03-11',

  },
  {
    id: 'expense6',
    planId: 'plan1',
    category: '餐饮',
    amount: 480,
    description: '午餐',
    date: '2024-03-11',

  },
  {
    id: 'expense7',
    planId: 'plan2',
    category: '交通',
    amount: 3500,
    description: '火车票',
    date: '2024-05-05',

  },
  {
    id: 'expense8',
    planId: 'plan2',
    category: '住宿',
    amount: 1800,
    description: '酒店住宿',
    date: '2024-05-05',

  }
];

// 模拟预算分析数据
export const mockBudgetAnalysis = {
  totalBudget: 10000,
  totalSpent: 8830,
  remainingBudget: 1170,
  dailyAverage: 1766,
  categoryBreakdown: [
    { category: '交通', amount: 2500, percentage: 28.3 },
    { category: '住宿', amount: 1200, percentage: 13.6 },
    { category: '餐饮', amount: 1130, percentage: 12.8 },
    { category: '购物', amount: 1200, percentage: 13.6 },
    { category: '门票', amount: 2800, percentage: 31.7 }
  ],
  dailyTrend: [
    { date: '2024-03-10', amount: 4350 },
    { date: '2024-03-11', amount: 4480 }
  ],
  budgetStatus: 'warning' // 'normal', 'warning', 'danger'
};

// 模拟地点搜索结果
export const mockSearchResults = [
  {
    id: 'search1',
    name: '东京迪士尼乐园',
    type: '景点',
    address: '东京都千叶县浦安市舞滨1-1',
    lat: 35.632892,
    lng: 139.880385,
    rating: 4.7,
    photos: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1']
  },
  {
    id: 'search2',
    name: '东京塔',
    type: '景点',
    address: '东京都港区芝公园4丁目2-8',
    lat: 35.658580,
    lng: 139.745433,
    rating: 4.5,
    photos: ['https://images.unsplash.com/photo-1542345119-be46562dd96b?ixlib=rb-1.2.1']
  },
  {
    id: 'search3',
    name: '银座',
    type: '购物',
    address: '东京都中央区银座',
    lat: 35.671240,
    lng: 139.767197,
    rating: 4.6,
    photos: ['https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1']
  }
];

// 模拟路线数据
export const mockRoute = {
  start: { lat: 35.6895, lng: 139.6917 },
  end: { lat: 35.7147, lng: 139.7968 },
  distance: 8.5,
  duration: 35,
  polyline: [
    { lat: 35.6895, lng: 139.6917 },
    { lat: 35.6925, lng: 139.7102 },
    { lat: 35.7011, lng: 139.7426 },
    { lat: 35.7082, lng: 139.7741 },
    { lat: 35.7147, lng: 139.7968 }
  ],
  instructions: [
    { distance: 0, text: '从起点出发' },
    { distance: 1200, text: '左转进入东京都道403号' },
    { distance: 3500, text: '右转进入首都高速道路' },
    { distance: 6800, text: '下高速，直行' },
    { distance: 8500, text: '到达目的地' }
  ]
};