export interface MockScan {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
  freshnessScore: number;
  freshnessStatus: 'fresh' | 'moderate' | 'spoiled';
  imageUrl: string;
  confidence: number;
  shelfLife: number;
  detections?: {
    name: string;
    confidence: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    freshnessStatus: 'fresh' | 'moderate' | 'spoiled';
  }[];
}

export const MOCK_SCANS: MockScan[] = [
  {
    id: '1',
    name: 'Avocado Toast with Eggs',
    date: 'Aug 1, 2026',
    calories: 420,
    protein: 18,
    carbs: 32,
    fat: 24,
    fiber: 8,
    healthScore: 92,
    freshnessScore: 95,
    freshnessStatus: 'fresh',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=200&fit=crop',
    confidence: 0.98,
    shelfLife: 4,
    detections: [
      { name: 'Sourdough Toast', confidence: 0.99, calories: 180, protein: 6, carbs: 32, fat: 2, freshnessStatus: 'fresh' },
      { name: 'Avocado Spread', confidence: 0.97, calories: 160, protein: 2, carbs: 0, fat: 15, freshnessStatus: 'fresh' },
      { name: 'Poached Eggs', confidence: 0.98, calories: 80, protein: 10, carbs: 0, fat: 7, freshnessStatus: 'fresh' },
    ]
  },
  {
    id: '2',
    name: 'Salmon Quinoa Bowl',
    date: 'Jul 31, 2026',
    calories: 580,
    protein: 38,
    carbs: 45,
    fat: 22,
    fiber: 6,
    healthScore: 95,
    freshnessScore: 88,
    freshnessStatus: 'fresh',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop',
    confidence: 0.96,
    shelfLife: 2,
    detections: [
      { name: 'Grilled Salmon', confidence: 0.98, calories: 280, protein: 30, carbs: 0, fat: 16, freshnessStatus: 'fresh' },
      { name: 'Cooked Quinoa', confidence: 0.95, calories: 200, protein: 6, carbs: 35, fat: 3, freshnessStatus: 'fresh' },
      { name: 'Steamed Broccoli', confidence: 0.96, calories: 100, protein: 2, carbs: 10, fat: 3, freshnessStatus: 'fresh' },
    ]
  },
  {
    id: '3',
    name: 'Grilled Chicken Salad',
    date: 'Jul 30, 2026',
    calories: 340,
    protein: 32,
    carbs: 12,
    fat: 14,
    fiber: 4,
    healthScore: 89,
    freshnessScore: 78,
    freshnessStatus: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=200&fit=crop',
    confidence: 0.95,
    shelfLife: 1,
    detections: [
      { name: 'Chicken Breast', confidence: 0.97, calories: 220, protein: 28, carbs: 0, fat: 5, freshnessStatus: 'fresh' },
      { name: 'Mixed Greens', confidence: 0.94, calories: 40, protein: 2, carbs: 8, fat: 1, freshnessStatus: 'moderate' },
      { name: 'Olive Oil Dressing', confidence: 0.95, calories: 80, protein: 2, carbs: 4, fat: 8, freshnessStatus: 'fresh' },
    ]
  },
  {
    id: '4',
    name: 'Greek Salad Bowl',
    date: 'Jul 29, 2026',
    calories: 210,
    protein: 8,
    carbs: 18,
    fat: 12,
    fiber: 5,
    healthScore: 92,
    freshnessScore: 96,
    freshnessStatus: 'fresh',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop',
    confidence: 0.98,
    shelfLife: 3,
    detections: [
      { name: 'Cucumber & Tomato', confidence: 0.99, calories: 70, protein: 2, carbs: 12, fat: 1, freshnessStatus: 'fresh' },
      { name: 'Feta Cheese Blocks', confidence: 0.98, calories: 100, protein: 5, carbs: 2, fat: 8, freshnessStatus: 'fresh' },
      { name: 'Kalamata Olives', confidence: 0.97, calories: 40, protein: 1, carbs: 4, fat: 3, freshnessStatus: 'fresh' },
    ]
  },
  {
    id: '5',
    name: 'Banana Protein Shake',
    date: 'Jul 28, 2026',
    calories: 310,
    protein: 26,
    carbs: 38,
    fat: 6,
    fiber: 3,
    healthScore: 84,
    freshnessScore: 72,
    freshnessStatus: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=400&h=200&fit=crop',
    confidence: 0.94,
    shelfLife: 1,
    detections: [
      { name: 'Organic Banana', confidence: 0.97, calories: 120, protein: 1, carbs: 30, fat: 0, freshnessStatus: 'moderate' },
      { name: 'Whey Protein Powder', confidence: 0.96, calories: 110, protein: 24, carbs: 2, fat: 1, freshnessStatus: 'fresh' },
      { name: 'Almond Milk', confidence: 0.92, calories: 80, protein: 1, carbs: 6, fat: 5, freshnessStatus: 'fresh' },
    ]
  },
  {
    id: '6',
    name: 'Berry Yogurt Parfait',
    date: 'Jul 27, 2026',
    calories: 280,
    protein: 14,
    carbs: 42,
    fat: 8,
    fiber: 5,
    healthScore: 88,
    freshnessScore: 90,
    freshnessStatus: 'fresh',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=200&fit=crop',
    confidence: 0.96,
    shelfLife: 3,
    detections: [
      { name: 'Greek Yogurt Plain', confidence: 0.98, calories: 130, protein: 12, carbs: 8, fat: 4, freshnessStatus: 'fresh' },
      { name: 'Mixed Berries Cup', confidence: 0.97, calories: 60, protein: 1, carbs: 14, fat: 0, freshnessStatus: 'fresh' },
      { name: 'Honey Oats Granola', confidence: 0.94, calories: 90, protein: 1, carbs: 20, fat: 4, freshnessStatus: 'fresh' },
    ]
  }
];

export const MOCK_RECOMMENDATIONS = [
  {
    id: 'r1',
    title: 'Increase Dietary Omega-3 Intake',
    category: 'Cardiovascular Health',
    priority: 'high' as const,
    desc: 'Your average weekly fat metrics indicate low healthy polyunsaturated fats. Integrate fatty fish like salmon or flaxseed chips into your meals.',
    actionUrl: '/dashboard',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=200&fit=crop'
  },
  {
    id: 'r2',
    title: 'Add Fiber-Rich Vegetables',
    category: 'Digestive Wellness',
    priority: 'medium' as const,
    desc: 'You achieved 73% of your daily fiber goal today. Adding 100g of steamed broccoli or spinach will bridge the USDA target gap.',
    actionUrl: '/scanner',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=200&fit=crop'
  },
  {
    id: 'r3',
    title: 'Optimize Post-Workout Protein',
    category: 'Muscle Recovery',
    priority: 'low' as const,
    desc: 'Increase protein portion sizes by 10g in your breakfast salads to reach the recommended daily protein target threshold.',
    actionUrl: '/dashboard',
    imageUrl: 'https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=400&h=200&fit=crop'
  }
];

export const MOCK_WEEKLY_CALORIES = [
  { day: 'Mon', calories: 1980 },
  { day: 'Tue', calories: 2150 },
  { day: 'Wed', calories: 1842 },
  { day: 'Thu', calories: 2280 },
  { day: 'Fri', calories: 1950 },
  { day: 'Sat', calories: 1780 },
  { day: 'Sun', calories: 1890 },
];
export const MOCK_WEEKLY_MACROS = [
  { day: 'Mon', Protein: 110, Carbs: 230, Fat: 72 },
  { day: 'Tue', Protein: 125, Carbs: 245, Fat: 78 },
  { day: 'Wed', Protein: 82, Carbs: 198, Fat: 58 },
  { day: 'Thu', Protein: 130, Carbs: 260, Fat: 84 },
  { day: 'Fri', Protein: 115, Carbs: 220, Fat: 70 },
  { day: 'Sat', Protein: 95, Carbs: 200, Fat: 65 },
  { day: 'Sun', Protein: 105, Carbs: 215, Fat: 68 },
];
export const MOCK_SCORE_TREND = [
  { day: 'Mon', score: 85 },
  { day: 'Tue', score: 88 },
  { day: 'Wed', score: 92 },
  { day: 'Thu', score: 87 },
  { day: 'Fri', score: 90 },
  { day: 'Sat', score: 86 },
  { day: 'Sun', score: 88.4 },
];
