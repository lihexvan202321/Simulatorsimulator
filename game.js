// ==================== 游戏状态管理 ====================
const GameState = {
    // 玩家信息
    playerName: '',  // 玩家名字
    gameTitle: '模拟器研究者',  // 游戏标题(可能被彩蛋修改)

    // 基础资源
    inventory: 1000000,
    money: 5000,
    reputation: 50,
    day: 1,
    totalSold: 0,

    // 成本系统
    costPrice: 1.5,  // 模拟器成本价(每个)

    // 无尽模式
    endlessMode: false,
    contractSigned: false,  // 是否与生产基地签约
    contractDay: 0,  // 签约天数
    nextDeliveryDay: 0,  // 下次送达天数
    stockoutDays: 0,  // 缺货天数累计
    todayPurchase: 0,  // 今日已授权数量

    // 销售相关
    currentPrice: 3,
    promotions: {
        bogo: false,      // 买一送一
        discount: false,  // 限时折扣
        bundle: false     // 捆绑销售
    },

    // 营销效果
    activeMarketing: [],

    // 店铺
    ownedShops: [],

    // 赛事
    completedEvents: [],

    // 天气
    weather: 'sunny',

    // 特殊状态
    specialEffects: {
        qualityLabel: false,  // 优质模拟器标签
        newRecipe: false,     // 新菜品解锁
        competitorDebuff: 0   // 对拍模拟器贩子发起负面宣传剩余天数
    },

    // 今日销售数据(改为支持多次销售)
    todaySales: {
        session1: { quantity: 0, revenue: 0, hasSold: false },
        session2: { quantity: 0, revenue: 0, hasSold: false },
        currentSession: 0  // 当前是第几次销售(0=未开始, 1=第一次, 2=第二次)
    },

    // 销售倒计时
    salesTimer: {
        isWaiting: false,
        timeLeft: 0,
        timerId: null
    },

    // 游戏状态
    isGameOver: false,
    gameWon: false,

    // 兑换码系统
    codeRedeemed: false,  // 是否已兑换过代码

    // 升级系统
    restaurantLevel: 0,  // 0=普通, 1=餐馆, 2=工厂, 3=实验室
    canUpgradeToRestaurant: false,  // 是否可以升级为餐馆(售卖15天后)
    cannedProduction: {
        enabled: false,  // 是否启用产品包生产
        dailyInput: 1000,  // 每日投入模拟器数量
        simulatorsPerCan: 1,  // 每个产品包的模拟器数量(0.1-10)
        pricePerCan: 5  // 每个产品包售价
    },
    
    // 实验室系统
    labProduction: {
        enabled: false,  // 是否启用实验室
        experimentAmount: 1000,  // 每次实验投入模拟器数(1000-100000,步长1000)
        cultureAmount: 1000,  // 批量复制数量(1000-100000,步长1000)
        experimentLevel: 0,  // 实验等级(影响销量提升)
        lastCultureDay: 0  // 上次使用批量复制的天数
    },
    
    // 研究点系统
    techPoints: 0,                    // 研究点数总数
    researchUpgrades: [],             // 已购买的升级 ID 列表
    
    // 模拟器学术研究院系统
    academy: {
        unlocked: false,              // 是否已解锁学术研究院
        divinePoints: 0,              // 学术积分数量
        sacrificeAmount: 10000,       // 每次投入模拟器作学术样本数量(10000-1000000,步长10000)
        salesBonus: 0                 // 永久销量加成
    },
    
    // 股票市场系统
    stockMarket: {
        unlocked: false,              // 是否已解锁股票市场
        totalAssets: 0,               // 股票总资产
        todayProfit: 0,               // 今日收益
        holdings: {},                 // 持股信息 {companyId: quantity}
        selectedStock: null           // 当前选中的股票ID
    },
    
    // 自定义比赛系统
    customEvent: null,  // 当前进行中的自定义比赛
    
    // 成就系统
    achievements: {
        unlocked: [],  // 已解锁的成就ID列表
        lastCheckDay: 0  // 上次检查成就的天数
    },
    
    // 收集要素系统
    collections: {
        letters: [],      // 特殊客户信件
        trophies: [],     // 比赛奖杯
        souvenirs: []     // 限时活动纪念品
    },
    
    // 皮肤/主题系统
    currentSkin: 'default',  // 当前使用的皮肤
    unlockedSkins: ['default'],  // 已解锁的皮肤列表
    
    // 客户系统
    customers: {
        relationships: {},  // 客户关系 {customerType: level}
        todaySpecialCustomer: null,  // 今日特殊客户
        wordOfMouthBonus: 0  // 口碑传播带来的销量加成
    },
    
    // 社区论坛系统
    community: null  // 在initCommunityForum中初始化
};

// ==================== 配置常量 ====================
const CONFIG = {
    MAX_DAYS: 90,
    TARGET_SALES: 1000000,
    INITIAL_INVENTORY: 1000000,
    INITIAL_MONEY: 5000,
    INITIAL_REPUTATION: 50,

    // 无尽模式配置
    CONTRACT_DELIVERY: 100000,  // 每7天送达模拟器数量
    CONTRACT_INTERVAL: 7,  // 合约周期(天)
    CONTRACT_COST: 50000,  // 签约费用
    WHOLESALE_PRICE: 10,  // 无尽模式批发价/个
    WHOLESALE_MAX_DAILY: 100000,  // 每天最多授权数量
    STOCKOUT_LIMIT: 2,  // 连续缺货天数上限
    BANKRUPTCY_LIMIT: -100000,  // 资金链断裂阈值

    // 升级系统配置
    RESTAURANT_UPGRADE_COST: 1000000,  // 升级为餐馆的费用
    RESTAURANT_UPGRADE_DAY: 15,  // 售卖15天后可升级
    RESTAURANT_COST_PRICE: 10,  // 餐馆成本价
    RESTAURANT_MAX_PRICE: 100,  // 餐馆最高定价
    FACTORY_UPGRADE_COST: 9000000,  // 升级为模拟器研发中心的费用(降低10%)
    CANNED_MIN_CABBAGES: 0.1,  // 产品包最少模拟器数量
    CANNED_MAX_CABBAGES: 10,  // 产品包最多模拟器数量
    
    // 实验室配置
    LAB_UPGRADE_COST: 50000000,  // 升级为高等模拟器实验室的费用(降低至50%)
    LAB_EXPERIMENT_MAX: 100000,  // 实验投入模拟器上限
    LAB_EXPERIMENT_STEP: 1000,  // 实验滑块步长
    LAB_CULTURE_MAX: 100000,  // 批量复制上限
    LAB_CULTURE_STEP: 1000,  // 批量复制滑块步长

    // 价格配置
    MIN_PRICE: 2,
    MAX_PRICE: 15,
    BASE_PRICE: 3,
    COST_PRICE: 1.5,  // 成本价
    SALES_SESSIONS_PER_DAY: 2,  // 每天销售次数
    SALES_WAIT_TIME: 5,  // 销售等待时间(秒)

    // 营销配置(所有加成缩减到原来的10%)
    MARKETING_OPTIONS: {
        // 基础营销(立即可用)
        flyer: { cost: 200, salesBonus: 0.015, reputationBonus: 0, duration: 3, name: '私信推广', unlockDay: 0, icon: '📄' },
        social: { cost: 500, salesBonus: 0.03, reputationBonus: 0.5, duration: 5, name: '算法群群发', unlockDay: 0, icon: '📱' },
        radio: { cost: 1000, salesBonus: 0.05, reputationBonus: 1, duration: 7, name: '技术周刊', unlockDay: 0, icon: '📻' },
        tv: { cost: 3000, salesBonus: 0.1, reputationBonus: 2, duration: 10, name: '热门博客', unlockDay: 0, icon: '📺' },
        
        // 高级营销(每5天解锁1个)
        newspaper: { cost: 1500, salesBonus: 0.06, reputationBonus: 1.5, duration: 8, name: '题解平台', unlockDay: 5, icon: '📰' },
        billboard: { cost: 2500, salesBonus: 0.08, reputationBonus: 1.2, duration: 12, name: '线上冬令营展位', unlockDay: 10, icon: '🪧' },
        influencer: { cost: 4000, salesBonus: 0.12, reputationBonus: 3, duration: 6, name: '开箱测评', unlockDay: 15, icon: '⭐' },
        livestream: { cost: 5000, salesBonus: 0.15, reputationBonus: 2.5, duration: 5, name: '模拟器技术直播', unlockDay: 20, icon: '🎥' },
        festival: { cost: 8000, salesBonus: 0.2, reputationBonus: 5, duration: 15, name: '算法嘉年华', unlockDay: 25, icon: '🎉' },
        celebrity: { cost: 15000, salesBonus: 0.25, reputationBonus: 8, duration: 20, name: '国家队选手力荐', unlockDay: 30, icon: '🌟' },
        documentary: { cost: 25000, salesBonus: 0.3, reputationBonus: 10, duration: 30, name: '《模拟器的诞生》纪录短片', unlockDay: 35, icon: '🎬' },
        international: { cost: 50000, salesBonus: 0.4, reputationBonus: 15, duration: 45, name: '国际信奥合作', unlockDay: 40, icon: '🌍' }
    },

    // 店铺配置
    SHOPS: [
        { id: 'stall', name: '个人技术博客售卖', icon: '🏪', unlockAt: 5000, cost: 1000, dailyCost: 50, salesBonus: 0.30, baseSales: 100 },
        { id: 'market', name: '模拟器技术小店', icon: '🏬', unlockAt: 15000, cost: 3000, dailyCost: 150, salesBonus: 0.60, baseSales: 200, wholesaleBonus: 0.10 },
        { id: 'community', name: '模拟器实操教学直播', icon: '🏠', unlockAt: 30000, cost: 8000, dailyCost: 300, salesBonus: 1.0, baseSales: 300 },
        { id: 'supermarket', name: '竞赛团队批量授权', icon: '🛒', unlockAt: 60000, cost: 15000, dailyCost: 500, salesBonus: 1.50, baseSales: 500 },
        { id: 'online', name: '模拟器网上商城', icon: '💻', unlockAt: 80000, cost: 10000, dailyCost: 200, salesBonus: 0.80, baseSales: 250, weatherImmune: true }
    ],

    // 赛事配置
    EVENTS: {
        15: { type: 'quality', name: '模拟器性能赛', icon: '🏆', cost: 800 },
        30: { type: 'cooking', name: '模拟器扩展功能创意赛', icon: '👨‍🍳', cost: 1200 },
        45: { type: 'quality', name: '模拟器性能赛', icon: '🏆', cost: 800 },
        60: { type: 'cooking', name: '模拟器扩展功能创意赛', icon: '👨‍🍳', cost: 1200 },
        75: { type: 'championship', name: '省级模拟器设计赛', icon: '🥈', cost: 2000 },
        90: { type: 'final', name: '全国模拟器设计大赛', icon: '👑', cost: 0 }
    },

    // 天气配置
    WEATHER: {
        sunny: { name: '学术热点期', icon: '☀️', salesMultiplier: 1.0 },
        cloudy: { name: '社区讨论期', icon: '⛅', salesMultiplier: 0.9 },
        rainy: { name: '竞品冲击', icon: '🌧️', salesMultiplier: 0.7 },
        stormy: { name: '学术风波', icon: '⛈️', salesMultiplier: 0.4 },
        snowy: { name: '社区低活跃', icon: '❄️', salesMultiplier: 0.6 }
    },

    // 客户类型配置
    CUSTOMERS: {
        normal: { probability: 0.60, icon: '👤', name: '普通选手', minDemand: 1, maxDemand: 5 },
        restaurant: { probability: 0.20, icon: '🍽️', name: '教练团队', minDemand: 50, maxDemand: 200 },
        wholesaler: { probability: 0.10, icon: '🚚', name: '学校竞赛组', minDemand: 500, maxDemand: 2000 },
        blogger: { probability: 0.05, icon: '📸', name: '技术测评博主', minDemand: 10, maxDemand: 30 },
        competitor: { probability: 0.05, icon: '😈', name: '对拍模拟器贩子', minDemand: 0, maxDemand: 0 }
    },
    
    // 股票市场配置
    STOCK_COMPANIES: [
        { id: 'oi_restart', name: 'OI重开模拟器', icon: '🔄', basePrice: 100, price: 100, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/9d4wr427' },
        { id: 'oi_coach', name: 'OI教练模拟器', icon: '👨‍🏫', basePrice: 150, price: 150, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/1s9wdoal' },
        { id: 'oi_association', name: 'OI 协会模拟器', icon: '🏛️', basePrice: 200, price: 200, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/w9cahexa' },
        { id: 'oj_operation', name: 'OJ 运维模拟器', icon: '⚙️', basePrice: 180, price: 180, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/dcqcee1r' },
        { id: 'whk_teacher', name: 'whk 班主任模拟器', icon: '👔', basePrice: 250, price: 250, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/44li54py' },
        { id: 'bj8z', name: '北京八中模拟器', icon: '🏫', basePrice: 300, price: 300, history: [], changePercent: 0, link: 'https://www.luogu.com.cn/article/7xmewwtx' }
    ],
    
    STOCK_UNLOCK_COST: 100000,  // 解锁股票市场费用(10万)
    STOCK_LIMIT_UP: 0.10,  // 涨停幅度 10%
    STOCK_LIMIT_DOWN: -0.10,  // 跌停幅度 -10%
    
    // 研究升级配置 (35项)
    RESEARCH_UPGRADES: [
        // 第 1-10 项：销量加成类
        { id: 'sales_boost_1', name: '营销技巧 I', description: '销量 +5%', cost: 1, effect: { type: 'sales_multiplier', value: 0.05 } },
        { id: 'sales_boost_2', name: '营销技巧 II', description: '销量 +8%', cost: 3, effect: { type: 'sales_multiplier', value: 0.08 } },
        { id: 'sales_boost_3', name: '营销技巧 III', description: '销量 +12%', cost: 6, effect: { type: 'sales_multiplier', value: 0.12 } },
        { id: 'sales_boost_4', name: '品牌效应 I', description: '销量 +15%', cost: 10, effect: { type: 'sales_multiplier', value: 0.15 } },
        { id: 'sales_boost_5', name: '品牌效应 II', description: '销量 +20%', cost: 15, effect: { type: 'sales_multiplier', value: 0.20 } },
        { id: 'sales_boost_6', name: '客户忠诚 I', description: '销量 +25%', cost: 22, effect: { type: 'sales_multiplier', value: 0.25 } },
        { id: 'sales_boost_7', name: '客户忠诚 II', description: '销量 +30%', cost: 30, effect: { type: 'sales_multiplier', value: 0.30 } },
        { id: 'sales_boost_8', name: '市场扩张 I', description: '销量 +35%', cost: 40, effect: { type: 'sales_multiplier', value: 0.35 } },
        { id: 'sales_boost_9', name: '市场扩张 II', description: '销量 +40%', cost: 50, effect: { type: 'sales_multiplier', value: 0.40 } },
        { id: 'sales_boost_10', name: '全球知名', description: '销量 +50%', cost: 65, effect: { type: 'sales_multiplier', value: 0.50 } },
        
        // 第 11-18 项：模拟器获取翻倍类
        { id: 'weekly_simulator_1', name: '信息补贴 I', description: '每周免费模拟器 ×1.5', cost: 5, effect: { type: 'weekly_simulator_multiplier', value: 1.5 } },
        { id: 'weekly_simulator_2', name: '信息补贴 II', description: '每周免费模拟器 ×2', cost: 12, effect: { type: 'weekly_simulator_multiplier', value: 2.0 } },
        { id: 'weekly_simulator_3', name: '算法合作 I', description: '每周免费模拟器 ×2.5', cost: 20, effect: { type: 'weekly_simulator_multiplier', value: 2.5 } },
        { id: 'weekly_simulator_4', name: '算法合作 II', description: '每周免费模拟器 ×3', cost: 30, effect: { type: 'weekly_simulator_multiplier', value: 3.0 } },
        { id: 'weekly_simulator_5', name: '算法优化 I', description: '每周免费模拟器 ×4', cost: 45, effect: { type: 'weekly_simulator_multiplier', value: 4.0 } },
        { id: 'weekly_simulator_6', name: '算法优化 II', description: '每周免费模拟器 ×5', cost: 60, effect: { type: 'weekly_simulator_multiplier', value: 5.0 } },
        { id: 'weekly_simulator_7', name: '层级架构', description: '每周免费模拟器 ×6', cost: 80, effect: { type: 'weekly_simulator_multiplier', value: 6.0 } },
        { id: 'weekly_simulator_8', name: '云端部署', description: '每周免费模拟器 ×8', cost: 100, effect: { type: 'weekly_simulator_multiplier', value: 8.0 } },
        
        // 第 19-26 项：实验室效率类
        { id: 'lab_efficiency_1', name: '实验加速 I', description: '技术研究成本 -10%', cost: 8, effect: { type: 'experiment_cost_reduction', value: 0.10 } },
        { id: 'lab_efficiency_2', name: '实验加速 II', description: '技术研究成本 -20%', cost: 18, effect: { type: 'experiment_cost_reduction', value: 0.20 } },
        { id: 'lab_efficiency_3', name: '批量复制 I', description: '批量复制冷却时间 -2 天', cost: 25, effect: { type: 'culture_cooldown_reduction', value: 2 } },
        { id: 'lab_efficiency_4', name: '批量复制 II', description: '批量复制冷却时间 -4 天', cost: 40, effect: { type: 'culture_cooldown_reduction', value: 4 } },
        { id: 'lab_efficiency_5', name: '复制技术 I', description: '批量复制产量 +50%', cost: 55, effect: { type: 'culture_yield_bonus', value: 0.50 } },
        { id: 'lab_efficiency_6', name: '复制技术 II', description: '批量复制产量 +100%', cost: 75, effect: { type: 'culture_yield_bonus', value: 1.0 } },
        { id: 'lab_efficiency_7', name: '自动化实验', description: '实验等级获取 ×2', cost: 90, effect: { type: 'experiment_level_multiplier', value: 2.0 } },
        { id: 'lab_efficiency_8', name: '量子计算', description: '所有实验室效果 +25%', cost: 110, effect: { type: 'lab_global_bonus', value: 0.25 } },
        
        // 第 27-35 项：其他效果类
        { id: 'passive_sales_1', name: '自动出售 I', description: '被动销售频率 +20%', cost: 15, effect: { type: 'passive_sales_frequency', value: 0.20 } },
        { id: 'passive_sales_2', name: '自动出售 II', description: '被动销售频率 +40%', cost: 35, effect: { type: 'passive_sales_frequency', value: 0.40 } },
        { id: 'marketing_boost_1', name: '广告优化 I', description: '营销效果 +15%', cost: 20, effect: { type: 'marketing_effectiveness', value: 0.15 } },
        { id: 'marketing_boost_2', name: '广告优化 II', description: '营销效果 +30%', cost: 45, effect: { type: 'marketing_effectiveness', value: 0.30 } },
        { id: 'price_premium_1', name: '奢侈品定位', description: '可定价上限 +¥20', cost: 50, effect: { type: 'max_price_increase', value: 20 } },
        { id: 'reputation_boost', name: '声誉加速器', description: '声誉获取 +50%', cost: 60, effect: { type: 'reputation_gain', value: 0.50 } },
        { id: 'cost_reduction', name: '供应链优化', description: '成本价 -¥2', cost: 70, effect: { type: 'cost_price_reduction', value: 2 } },
        { id: 'shop_bonus', name: '连锁经营', description: '店铺收益 +30%', cost: 85, effect: { type: 'shop_revenue_bonus', value: 0.30 } },
        { id: 'ultimate_tech', name: '终极科技', description: '所有效果 +10%', cost: 120, effect: { type: 'global_bonus', value: 0.10 } }
    ],
    
    // 学术研究院配置
    ACADEMY_UNLOCK_COST: 2000000000,  // 模拟器学术研究院解锁费用(降低至20%)
    ACADEMY_SACRIFICE_MIN: 10000,       // 最小供奉数量
    ACADEMY_SACRIFICE_MAX: 1000000,     // 最大供奉数量
    ACADEMY_SACRIFICE_STEP: 10000,      // 供奉步长
    
    // 无尽模式赛事配置（每75天一个周期）
    ENDLESS_EVENTS: [
        { day: 105, type: 'quality', name: '模拟器性能赛', icon: '🏆', cost: 800 },
        { day: 120, type: 'cooking', name: '模拟器扩展功能创意赛', icon: '👨‍🍳', cost: 1200 },
        { day: 135, type: 'quality', name: '模拟器性能赛', icon: '🏆', cost: 800 },
        { day: 150, type: 'cooking', name: '模拟器扩展功能创意赛', icon: '👨‍🍳', cost: 1200 },
        { day: 165, type: 'championship', name: '省级模拟器设计赛', icon: '🥈', cost: 2000 },
        { day: 180, type: 'final', name: '全国模拟器设计大赛', icon: '👑', cost: 0 }
    ],
    
    // 成就系统配置
    ACHIEVEMENTS: [
        // 销售类成就
        { id: 'first_sale', name: '初入模拟', description: '完成第一次销售', icon: '💰', condition: (gs) => gs.totalSold > 0 },
        { id: 'sell_1000', name: '小有名气', description: '累计授权1000个模拟器', icon: '📦', condition: (gs) => gs.totalSold >= 1000 },
        { id: 'sell_10000', name: '供不应求', description: '累计授权10000个模拟器', icon: '📈', condition: (gs) => gs.totalSold >= 10000 },
        { id: 'sell_100000', name: '产业巨头', description: '累计授权100000个模拟器', icon: '👑', condition: (gs) => gs.totalSold >= 100000 },
        { id: 'sell_1m', name: '模拟传奇', description: '累计授权1000000个模拟器', icon: '⭐', condition: (gs) => gs.totalSold >= 1000000 },
        
        // 库存类成就
        { id: 'stock_10000', name: '小仓库', description: '库存达到10000个', icon: '🏪', condition: (gs) => gs.inventory >= 10000 },
        { id: 'stock_100000', name: '大仓库', description: '库存达到100000个', icon: '🏭', condition: (gs) => gs.inventory >= 100000 },
        { id: 'stock_1m', name: '仓鼠型研究者', description: '库存达到1000000个', icon: '📦', condition: (gs) => gs.inventory >= 1000000 },
        
        // 资金类成就
        { id: 'money_10000', name: '万元户', description: '拥有10000元资金', icon: '💵', condition: (gs) => gs.money >= 10000 },
        { id: 'money_100000', name: '风投青睐', description: '拥有100000元资金', icon: '💰', condition: (gs) => gs.money >= 100000 },
        { id: 'money_1m', name: '资本雄厚', description: '拥有1000000元资金', icon: '💎', condition: (gs) => gs.money >= 1000000 },
        { id: 'money_10m', name: '研究可期', description: '拥有10000000元资金', icon: '👑', condition: (gs) => gs.money >= 10000000 },
        
        // 店铺类成就
        { id: 'shop_1', name: '生态初成', description: '解锁第一个店铺', icon: '🏬', condition: (gs) => gs.ownedShops.length >= 1 },
        { id: 'shop_all', name: '模拟器学术王国', description: '解锁全部店铺', icon: '🌟', condition: (gs) => gs.ownedShops.length >= SHOP_TYPES.length },
        
        // 特殊成就
        { id: 'double_sellout', name: '供不应求', description: '一天内两次售罄', icon: '🔥', condition: (gs) => gs.todaySales.session1.hasSold && gs.todaySales.session2.hasSold && gs.day > 1 },
        { id: 'endless_mode', name: '永无止境', description: '进入无尽模式', icon: '♾️', condition: (gs) => gs.endlessMode },
        { id: 'academy_unlock', name: '学术研究院成立', description: '解锁模拟器学术研究院', icon: '🎓', condition: (gs) => gs.academy.unlocked },
        { id: 'lab_unlock', name: '科技前沿', description: '解锁高等模拟器实验室', icon: '🧪', condition: (gs) => gs.restaurantLevel >= 3 },
        { id: 'stock_market', name: '操盘手', description: '解锁股票市场', icon: '📊', condition: (gs) => gs.stockMarket.unlocked },
        
        // 收集类成就
        { id: 'collect_5_letters', name: '通信达人', description: '收集5封特殊信件', icon: '✉️', condition: (gs) => gs.collections.letters.length >= 5 },
        { id: 'collect_5_trophies', name: '冠军收藏家', description: '获得5个比赛奖杯', icon: '🏆', condition: (gs) => gs.collections.trophies.length >= 5 },
        { id: 'collect_10_souvenirs', name: '纪念品专家', description: '收集10个活动纪念品', icon: '🎁', condition: (gs) => gs.collections.souvenirs.length >= 10 }
    ],
    
    // 皮肤配置
    SKINS: {
        default: { name: '默认主题', description: '经典蓝色主题', unlockCondition: null, cssClass: '' },
        academic: { name: '学术蓝主题', description: '经典学术配色，专注模拟器研发', unlockCondition: (gs) => gs.totalSold >= 20000, cssClass: 'theme-academic' },
        dark: { name: '暗黑主题', description: '深邃的暗色界面', unlockCondition: (gs) => gs.money >= 1000000, cssClass: 'theme-dark' },
        retro: { name: '复古主题', description: '怀旧复古风格', unlockCondition: (gs) => gs.totalSold >= 50000, cssClass: 'theme-retro' },
        pixel: { name: '像素主题', description: '8位像素艺术风', unlockCondition: (gs) => gs.day >= 50, cssClass: 'theme-pixel' },
        gold: { name: '黄金主题', description: '奢华金色外观', unlockCondition: (gs) => gs.money >= 10000000, cssClass: 'theme-gold' },
        nature: { name: '自然主题', description: '清新绿色风格', unlockCondition: (gs) => gs.achievements.unlocked.length >= 10, cssClass: 'theme-nature' }
    },
    
    // 客户系统配置
    CUSTOMER_TYPES: {
        normal: {
            id: 'normal',
            name: '普通选手',
            icon: '👤',
            description: '日常购买模拟器进行算法训练的学生，需求稳定。',
            basePurchaseMin: 50,
            basePurchaseMax: 500,
            priceSensitivity: 1.0,
            relationshipBonus: 0.05
        },
        blogger: {
            id: 'blogger',
            name: '技术测评博主',
            icon: '📹',
            description: '购买后会发布详尽测评，可能带来大量关注或引发争议。',
            basePurchaseMin: 20,
            basePurchaseMax: 200,
            positiveReviewChance: 0.6,  // 60%概率正面评价
            heatBonus: 15,              // 正面评价增加15热度
            heatPenalty: -10,           // 负面评价减少10热度
            reputationBonus: 10,        // 正面评价增加10声誉
            relationshipBonus: 0.15
        },
        distributor: {
            id: 'distributor',
            name: '学校竞赛组',
            icon: '🚚',
            description: '以学校为单位大宗采购，但会要求可观折扣。',
            basePurchaseMin: 1000,
            basePurchaseMax: 5000,
            priceDiscount: 0.2,  // 要求20%折扣
            relationshipBonus: 0.12
        },
        student: {
            id: 'student',
            name: '学生群体',
            icon: '🎓',
            description: '单次购买少，但概率触发"口碑传播"，增加次日基础销量。',
            basePurchaseMin: 10,
            basePurchaseMax: 100,
            priceSensitivity: 1.5,  // 对价格敏感
            wordOfMouthChance: 0.3,  // 30%概率触发口碑传播
            wordOfMouthBonus: 1.2,   // 口碑传播带来20%销量提升
            relationshipBonus: 0.1   // 每次交易增加0.1关系值
        },
        government: {
            id: 'government',
            name: '省级竞赛组委会',
            icon: '🏛️',
            description: '为省选采购大量模拟器，预算严格压价极低，但完成后学术声望大幅提升。',
            basePurchaseMin: 5000,
            basePurchaseMax: 20000,
            priceDiscount: 0.4,  // 要求40%折扣
            reputationBonus: 20,  // 完成后声誉+20
            relationshipBonus: 0.2  // 每次交易增加0.2关系值
        },
        hacker: {
            id: 'hacker',
            name: '黑客',
            icon: '💻',
            description: '可能窃取库存，也可能高价购买并留下技术',
            stealChance: 0.3,  // 30%概率窃取库存
            stealAmount: 0.1,  // 窃取10%库存
            highPriceChance: 0.4,  // 40%概率高价购买
            highPriceMultiplier: 2.0,  // 高价是原价的2倍
            techGiftChance: 0.3,  // 30%概率留下技术
            relationshipBonus: 0.05  // 每次交易增加0.05关系值
        }
    },
    
    // 客户出现概率配置
    CUSTOMER_PROBABILITIES: {
        normal: 0.50,       // 普通客户 50%
        blogger: 0.10,      // 博主 10%
        distributor: 0.15,  // 经销商 15%
        student: 0.08,      // 学生 8%
        government: 0.07,   // 政府 7%
        hacker: 0.10        // 黑客 10%
    },
    
    // 客户关系等级配置
    RELATIONSHIP_LEVELS: [
        { level: 0, name: '陌生人', minRelationship: 0, discount: 0, bonusOrderChance: 0 },
        { level: 1, name: '熟客', minRelationship: 1, discount: 0.02, bonusOrderChance: 0.1 },
        { level: 2, name: '好友', minRelationship: 3, discount: 0.05, bonusOrderChance: 0.2 },
        { level: 3, name: 'VIP', minRelationship: 6, discount: 0.08, bonusOrderChance: 0.3 },
        { level: 4, name: '合作伙伴', minRelationship: 10, discount: 0.12, bonusOrderChance: 0.4 },
        { level: 5, name: '战略伙伴', minRelationship: 15, discount: 0.15, bonusOrderChance: 0.5 }
    ]
};

// ==================== 工具函数 ====================
function formatNumber(num) {
    return num.toLocaleString('zh-CN');
}

function formatMoney(amount) {
    return '¥' + formatNumber(amount);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==================== 日志系统 ====================
function addLog(message, type = 'neutral') {
    const logEntries = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `第${GameState.day}天: ${message}`;
    logEntries.insertBefore(entry, logEntries.firstChild);

    // 只保留最近10条日志
    while (logEntries.children.length > 10) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

// ==================== UI更新函数 ====================
function updateUI() {
    // 更新头部信息
    document.getElementById('current-day').textContent = GameState.day;
    document.getElementById('sold-count').textContent = formatNumber(GameState.totalSold);

    // 更新无尽模式显示
    const daysLimit = document.getElementById('days-limit');
    const endlessBadge = document.getElementById('endless-badge');
    if (GameState.endlessMode) {
        daysLimit.textContent = '';
        endlessBadge.style.display = 'inline';
    } else {
        daysLimit.textContent = '/ 90';
        endlessBadge.style.display = 'none';
    }

    // 更新进度条
    const progressPercent = GameState.endlessMode ? 100 : (GameState.totalSold / CONFIG.TARGET_SALES) * 100;
    const progressBar = document.getElementById('sales-progress');
    progressBar.style.width = `${progressPercent}%`;

    // 根据完成度改变进度条颜色
    progressBar.classList.remove('low', 'medium', 'high');
    if (progressPercent < 33) {
        progressBar.classList.add('low');
    } else if (progressPercent < 66) {
        progressBar.classList.add('medium');
    } else {
        progressBar.classList.add('high');
    }

    // 更新状态面板
    document.getElementById('inventory').textContent = formatNumber(GameState.inventory);
    document.getElementById('money').textContent = formatMoney(GameState.money);

    // 更新成本价显示(定价区域)
    const costPriceDisplay = document.getElementById('cost-price-display');
    if (costPriceDisplay) {
        costPriceDisplay.textContent = GameState.costPrice;
    }

    document.getElementById('reputation').textContent = `${GameState.reputation}/100`;

    // 更新声誉条
    document.getElementById('reputation-fill').style.width = `${GameState.reputation}%`;

    // 库存警告
    const inventoryEl = document.getElementById('inventory');
    inventoryEl.classList.remove('warning', 'error');
    if (GameState.inventory < 10000) {
        inventoryEl.classList.add('error');
    } else if (GameState.inventory < 30000) {
        inventoryEl.classList.add('warning');
    }

    // 更新天气
    const weatherConfig = CONFIG.WEATHER[GameState.weather];
    document.getElementById('weather-icon').textContent = weatherConfig.icon;
    document.getElementById('weather').textContent = weatherConfig.name;

    // 更新预估销量
    updateEstimatedSales();

    // 更新活跃效果
    updateActiveEffects();

    // 更新店铺列表
    updateShopsList();

    // 更新赛事日历
    updateEventCalendar();

    // 检查并显示当前赛事
    checkCurrentEvent();

    // 更新手动赛事区域显示（无尽模式且超过90天）
    const hostEventSection = document.getElementById('host-event-section');
    if (hostEventSection) {
        const shouldShow = GameState.endlessMode && GameState.day > 90;
        hostEventSection.style.display = shouldShow ? 'block' : 'none';
    }

    // 更新无尽模式批发标签
    const wholesaleTabBtn = document.getElementById('wholesale-tab-btn');
    if (wholesaleTabBtn) {
        wholesaleTabBtn.style.display = GameState.endlessMode ? 'block' : 'none';
    }

    // 更新批发信息
    if (GameState.endlessMode) {
        const remaining = CONFIG.WHOLESALE_MAX_DAILY - GameState.todayPurchase;
        const wholesaleRemaining = document.getElementById('wholesale-remaining');
        const wholesaleTodayPurchase = document.getElementById('wholesale-today-purchase');
        const stockoutDaysDisplay = document.getElementById('stockout-days-display');
        const stockoutLimitDisplay = document.getElementById('stockout-limit-display');

        if (wholesaleRemaining) wholesaleRemaining.textContent = formatNumber(Math.max(0, remaining)) + ' 个';
        if (wholesaleTodayPurchase) wholesaleTodayPurchase.textContent = formatNumber(GameState.todayPurchase) + ' 个';
        if (stockoutDaysDisplay) stockoutDaysDisplay.textContent = GameState.stockoutDays + ' 天';
        if (stockoutLimitDisplay) stockoutLimitDisplay.textContent = CONFIG.STOCKOUT_LIMIT + ' 天';
    }

    // 更新升级系统显示
    updateUpgradeSystem();

    // 更新赛事倒计时
    updateEventCountdown();

    // 更新自定义比赛状态显示
    updateCustomEventDisplay();

    // 更新学术研究院UI（如果已解锁）
    if (GameState.academy && GameState.academy.unlocked) {
        updateAcademyUI();
    }

    // 同步所有文本与真实值
    syncAllText();

    // 更新营销选项显示
    updateMarketingOptions();
    
    // 如果股票市场已解锁，渲染股票市场页面
    if (GameState.stockMarket.unlocked) {
        renderStockMarket();
    }
    
    // 初始化工厂和实验室显示
    if (GameState.restaurantLevel >= 2) {
        updateCannedPreview();
    }
    if (GameState.restaurantLevel >= 3) {
        updateExperimentAmount(1000);
        updateCultureAmount(1000);
    }
}

function updateEstimatedSales() {
    if (GameState.todaySales.session1.hasSold && GameState.todaySales.session2.hasSold) {
        document.getElementById('estimated-sales').textContent = '今日销售已完成';
        return;
    }

    const estimated = calculateEstimatedSales();
    const sessionNum = !GameState.todaySales.session1.hasSold ? 1 : 2;
    document.getElementById('estimated-sales').textContent = `第${sessionNum}次预估: 约 ${formatNumber(estimated)} 个`;
}

// ==================== 同步所有文本与真实值 ====================
function syncAllText() {
    console.log('syncAllText called, restaurantLevel:', GameState.restaurantLevel);

    // 更新天数限制显示
    const daysLimit = document.getElementById('days-limit');
    if (daysLimit) {
        if (GameState.endlessMode) {
            daysLimit.textContent = '(无尽)';
        } else {
            daysLimit.textContent = `/ ${CONFIG.MAX_DAYS}`;
        }
    }

    // 更新销售目标显示
    const salesTarget = document.getElementById('sales-target');
    if (salesTarget) {
        salesTarget.textContent = formatNumber(CONFIG.TARGET_SALES);
    }

    // 更新价格滑块的最大值 - 设置为当前最高定价的110%
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const sliderMax = Math.floor(maxPrice * 1.10);
        
        // 同时使用setAttribute和property确保生效
        priceSlider.setAttribute('max', sliderMax.toString());
        priceSlider.max = sliderMax;
        
        console.log('✅ Price slider updated:');
        console.log('  - Base max price:', maxPrice);
        console.log('  - Slider max (110%):', sliderMax);
        console.log('  - Attribute max:', priceSlider.getAttribute('max'));
        console.log('  - Property max:', priceSlider.max);
    }

    // 更新销售按钮文本
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn && !GameState.todaySales.session1.hasSold && !GameState.todaySales.session2.hasSold) {
        salesBtn.textContent = `开始第${GameState.day}次销售`;
    }

    // 更新网页标题
    document.title = `${GameState.gameTitle} - Simulator Simulator`;
}

function updateUpgradeSystem() {
    const upgradeSection = document.getElementById('upgrade-section');
    const restaurantUpgrade = document.getElementById('restaurant-upgrade');
    const factoryUpgrade = document.getElementById('factory-upgrade');
    const labUpgrade = document.getElementById('lab-upgrade');
    const academyUnlock = document.getElementById('academy-unlock');
    const stockMarketUnlock = document.getElementById('stock-market-unlock');
    const cannedSection = document.getElementById('canned-production-section');
    const labSection = document.getElementById('lab-production-section');
    
    // 子标签按钮
    const factorySubtabBtn = document.getElementById('factory-subtab-btn');
    const labSubtabBtn = document.getElementById('lab-subtab-btn');
    const researchUpgradesSubtabBtn = document.getElementById('research-upgrades-subtab-btn');
    const academySubtabBtn = document.getElementById('academy-subtab-btn');
    const stockMarketSubtabBtn = document.getElementById('stock-market-subtab-btn');

    // 显示升级区域
    if (GameState.endlessMode || GameState.restaurantLevel > 0) {
        upgradeSection.style.display = 'block';

        // 根据等级显示不同选项
        if (GameState.restaurantLevel === 0 && GameState.canUpgradeToRestaurant) {
            restaurantUpgrade.style.display = 'block';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'none';
            academyUnlock.style.display = 'none';
        } else if (GameState.restaurantLevel === 1) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'block';
            labUpgrade.style.display = 'none';
            academyUnlock.style.display = 'none';
            
            // 如果已解锁餐馆且未解锁股票，显示股票市场解锁选项
            if (stockMarketUnlock) {
                stockMarketUnlock.style.display = !GameState.stockMarket.unlocked ? 'block' : 'none';
            }
        } else if (GameState.restaurantLevel === 2) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'block';
            academyUnlock.style.display = 'none';
            
            // 如果已解锁餐馆且未解锁股票，显示股票市场解锁选项
            if (stockMarketUnlock) {
                stockMarketUnlock.style.display = !GameState.stockMarket.unlocked ? 'block' : 'none';
            }
        } else if (GameState.restaurantLevel >= 3) {
            restaurantUpgrade.style.display = 'none';
            factoryUpgrade.style.display = 'none';
            labUpgrade.style.display = 'none';
            // 实验室等级>=3时，如果未解锁研究院则显示解锁选项
            academyUnlock.style.display = GameState.academy.unlocked ? 'none' : 'block';
            
            // 如果已解锁餐馆且未解锁股票，显示股票市场解锁选项
            if (stockMarketUnlock) {
                stockMarketUnlock.style.display = !GameState.stockMarket.unlocked ? 'block' : 'none';
            }
        }
    } else {
        upgradeSection.style.display = 'none';
    }
    
    // 显示/隐藏工厂子标签按钮（餐馆等级>=1时显示）
    if (factorySubtabBtn) {
        factorySubtabBtn.style.display = GameState.restaurantLevel >= 1 ? 'block' : 'none';
    }
    
    // 显示/隐藏实验室子标签按钮（餐馆等级>=2时显示）
    if (labSubtabBtn) {
        labSubtabBtn.style.display = GameState.restaurantLevel >= 2 ? 'block' : 'none';
    }
    
    // 显示/隐藏研究升级子标签按钮（实验室等级>=3时显示）
    if (researchUpgradesSubtabBtn) {
        researchUpgradesSubtabBtn.style.display = GameState.restaurantLevel >= 3 ? 'block' : 'none';
    }
    
    // 显示/隐藏研究院子标签按钮（研究院解锁后显示）
    if (academySubtabBtn) {
        const shouldShow = GameState.restaurantLevel >= 3 && GameState.academy.unlocked;
        academySubtabBtn.style.display = shouldShow ? 'block' : 'none';
    }
    
    // 显示/隐藏股票市场子标签按钮（股票市场解锁后显示）
    if (stockMarketSubtabBtn) {
        stockMarketSubtabBtn.style.display = GameState.stockMarket.unlocked ? 'block' : 'none';
    }

    // 显示产品包生产控制
    if (GameState.cannedProduction.enabled) {
        cannedSection.style.display = 'block';
        const cannedSlider = document.getElementById('canned-slider');
        if (cannedSlider) {
            cannedSlider.value = GameState.cannedProduction.simulatorsPerCan;
        }
        const cannedDisplay = document.getElementById('canned-simulators-display');
        if (cannedDisplay) {
            cannedDisplay.textContent = GameState.cannedProduction.simulatorsPerCan;
        }
        
        const dailyInputSlider = document.getElementById('daily-input-slider');
        if (dailyInputSlider) {
            dailyInputSlider.value = GameState.cannedProduction.dailyInput;
        }
        const dailyInputDisplay = document.getElementById('daily-input-display');
        if (dailyInputDisplay) {
            dailyInputDisplay.textContent = formatNumber(GameState.cannedProduction.dailyInput);
        }
        
        // 更新预计收益显示
        updateCannedPreview();
    } else {
        cannedSection.style.display = 'none';
    }

    // 显示实验室生产控制
    if (GameState.labProduction.enabled) {
        labSection.style.display = 'block';
        const experimentSlider = document.getElementById('experiment-slider');
        if (experimentSlider) {
            experimentSlider.value = GameState.labProduction.experimentAmount;
        }
        const experimentDisplay = document.getElementById('experiment-amount-display');
        if (experimentDisplay) {
            experimentDisplay.textContent = formatNumber(GameState.labProduction.experimentAmount);
        }
        
        // 显示实验等级和销量提升
        const experimentLevelEl = document.getElementById('experiment-level-display');
        if (experimentLevelEl) {
            const level = GameState.labProduction.experimentLevel;
            const bonus = (level / 1000 * 100).toFixed(1);
            experimentLevelEl.textContent = `实验等级: ${formatNumber(level)} (销量+${bonus}%)`;
        }
        
        // 更新研究点数显示
        const techPointsDisplay = document.getElementById('tech-points-display');
        if (techPointsDisplay) {
            techPointsDisplay.textContent = formatNumber(GameState.techPoints);
        }
        
        const upgradeTechPoints = document.getElementById('upgrade-tech-points');
        if (upgradeTechPoints) {
            upgradeTechPoints.textContent = formatNumber(GameState.techPoints);
        }
        
        const cultureSlider = document.getElementById('culture-slider');
        if (cultureSlider) {
            cultureSlider.value = GameState.labProduction.cultureAmount;
        }
        const cultureDisplay = document.getElementById('culture-amount-display');
        if (cultureDisplay) {
            cultureDisplay.textContent = formatNumber(GameState.labProduction.cultureAmount);
        }
        
        // 更新批量复制预计消耗和冷却状态
        updateCultureAmount(GameState.labProduction.cultureAmount);
        
        // 显示冷却状态
        const cultureCooldownEl = document.getElementById('culture-cooldown-display');
        if (cultureCooldownEl) {
            const lastDay = GameState.labProduction.lastCultureDay;
            
            // 获取升级效果
            const bonuses = getUpgradeBonuses();
            const cooldownReduction = bonuses.cultureCooldownReduction;
            const actualCooldown = Math.max(1, 10 - cooldownReduction);
            
            if (lastDay > 0) {
                const daysSince = GameState.day - lastDay;
                if (daysSince < actualCooldown) {
                    const remaining = actualCooldown - daysSince;
                    cultureCooldownEl.textContent = `🕒 冷却中: 还需 ${remaining} 天 (第${lastDay + actualCooldown}天可用)`;
                    cultureCooldownEl.style.color = 'var(--error)';
                } else {
                    cultureCooldownEl.textContent = '✅ 已就绪: 可以使用';
                    cultureCooldownEl.style.color = 'var(--success)';
                }
            } else {
                cultureCooldownEl.textContent = '✅ 未使用过: 可以立即使用';
                cultureCooldownEl.style.color = 'var(--success)';
            }
        }
    } else {
        labSection.style.display = 'none';
    }

    // 更新价格滑块最大值(设置为最高定价的99%作为违法上限)
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
        priceSlider.max = illegalPriceThreshold;
    }
}

// ==================== 更新营销选项显示 ====================
function updateMarketingOptions() {
    const marketingGrid = document.getElementById('marketing-grid');
    if (!marketingGrid) return;

    marketingGrid.innerHTML = '';

    Object.entries(CONFIG.MARKETING_OPTIONS).forEach(([type, config]) => {
        // 检查是否已解锁
        const isUnlocked = GameState.day >= config.unlockDay;
        
        const item = document.createElement('div');
        item.className = 'marketing-item';
        item.dataset.type = type;
        
        if (!isUnlocked) {
            item.classList.add('locked');
            item.innerHTML = `
                <div class="marketing-icon">🔒</div>
                <h3>${config.name}</h3>
                <p class="cost">第 ${config.unlockDay} 天解锁</p>
                <p class="effect">敬请期待</p>
                <button class="btn btn-secondary buy-ad-btn" disabled>未解锁</button>
            `;
        } else {
            // 检查是否已有相同类型的广告
            const existingEffect = GameState.activeMarketing.find(effect => effect.type === type);
            
            item.innerHTML = `
                <div class="marketing-icon">${config.icon}</div>
                <h3>${config.name}</h3>
                <p class="cost">成本: ¥${config.cost.toLocaleString()}</p>
                <p class="effect">销量+${(config.salesBonus * 100).toFixed(0)}%, ${config.reputationBonus > 0 ? '声誉+' + config.reputationBonus + ', ' : ''}持续${config.duration}天</p>
                <button class="btn btn-secondary buy-ad-btn" ${existingEffect ? 'disabled' : ''}>
                    ${existingEffect ? `已购买 (剩余${existingEffect.daysLeft}天)` : '购买'}
                </button>
            `;
        }
        
        marketingGrid.appendChild(item);
    });

    // 重新绑定购买按钮事件
    document.querySelectorAll('.buy-ad-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', (e) => {
                const itemType = e.target.closest('.marketing-item').dataset.type;
                buyMarketing(itemType);
            });
        }
    });
}

function updateActiveEffects() {
    const effectsList = document.getElementById('effects-list');
    effectsList.innerHTML = '';

    // 无尽模式标识
    if (GameState.endlessMode) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '🌟 无尽模式中';
        div.style.color = 'var(--secondary)';
        div.style.fontWeight = 'bold';
        effectsList.appendChild(div);
    }

    // 合约状态
    if (GameState.contractSigned) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = `📋 生产基地合约 (下次送达: 第${GameState.nextDeliveryDay}天)`;
        effectsList.appendChild(div);
    }

    // 显示营销效果
    GameState.activeMarketing.forEach(effect => {
        const config = CONFIG.MARKETING_OPTIONS[effect.type];
        if (config) {
            const div = document.createElement('div');
            div.className = 'effect-item';
            div.textContent = `${config.name} (剩余${effect.daysLeft}天)`;
            effectsList.appendChild(div);
        }
    });

    // 显示特殊效果
    if (GameState.specialEffects.qualityLabel) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '✨ 优质模拟器标签 (+¥1/个)';
        effectsList.appendChild(div);
    }

    if (GameState.specialEffects.newRecipe) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = '🍲 新语言解锁 (销量+20%)';
        effectsList.appendChild(div);
    }

    if (GameState.specialEffects.competitorDebuff > 0) {
        const div = document.createElement('div');
        div.className = 'effect-item';
        div.textContent = `⚠️ 对拍模拟器贩子发起负面宣传 (剩余${GameState.specialEffects.competitorDebuff}天)`;
        effectsList.appendChild(div);
    }
}

function updateShopsList() {
    const shopsList = document.getElementById('shops-list');
    shopsList.innerHTML = '';

    CONFIG.SHOPS.forEach(shop => {
        const isOwned = GameState.ownedShops.includes(shop.id);
        const isUnlocked = GameState.totalSold >= shop.unlockAt;

        const shopItem = document.createElement('div');
        shopItem.className = `shop-item ${!isUnlocked ? 'shop-locked' : ''}`;

        let html = `
            <div class="shop-info">
                <h3>${shop.icon} ${shop.name}</h3>
                <p>解锁条件: 已售 ${formatNumber(shop.unlockAt)} 个</p>
                <p>开店成本: ${formatMoney(shop.cost)} | 日运营成本: ${formatMoney(shop.dailyCost)}</p>
                <p>效果: 销量+${(shop.salesBonus * 100).toFixed(0)}%</p>
        `;

        if (shop.wholesaleBonus) {
            html += `<p>额外: 概率+${(shop.wholesaleBonus * 100).toFixed(0)}%</p>`;
        }
        if (shop.weatherImmune) {
            html += `<p>特性: 不受天气影响</p>`;
        }

        html += `</div><div class="shop-actions">`;

        if (isOwned) {
            html += `<span class="shop-owned">✓ 已拥有</span>`;
        } else if (isUnlocked) {
            html += `<button class="btn btn-secondary" onclick="buyShop('${shop.id}')">开店 (${formatMoney(shop.cost)})</button>`;
        } else {
            html += `<button class="btn" disabled>未解锁</button>`;
        }

        html += `</div>`;
        shopItem.innerHTML = html;
        shopsList.appendChild(shopItem);
    });
}

function updateEventCalendar() {
    Object.keys(CONFIG.EVENTS).forEach(day => {
        const statusEl = document.getElementById(`event-${day}`);
        if (!statusEl) return;

        if (GameState.completedEvents.includes(parseInt(day))) {
            statusEl.textContent = '已完成';
            statusEl.className = 'status completed';
        } else if (parseInt(day) === GameState.day) {
            statusEl.textContent = '进行中';
            statusEl.className = 'status active';
        } else if (parseInt(day) < GameState.day) {
            statusEl.textContent = '已错过';
            statusEl.className = 'status';
        } else {
            statusEl.textContent = '待进行';
            statusEl.className = 'status';
        }
    });
}

// ==================== 核心计算引擎 ====================
function calculatePriceCoefficient(price) {
    if (price <= 2) return 2.0;      // 超低价
    if (price <= 4) return 1.5;      // 低价
    if (price === 3) return 1.0;     // 正常价格(3元)
    if (price <= 7) return 0.8;      // 偏高
    if (price <= 10) return 0.5;     // 高价
    if (price <= 15) return 0.3;     // 超高价
    return 0.1;                       // 天价(会被抓)
}

function calculateReputationCoefficient() {
    return 0.5 + (GameState.reputation / 100);
}

function calculateWeatherCoefficient() {
    return CONFIG.WEATHER[GameState.weather].salesMultiplier;
}

function calculateMarketingCoefficient() {
    // 相同的广告营销不能叠加,只取最高值
    const marketingTypes = {};
    GameState.activeMarketing.forEach(effect => {
        const config = CONFIG.MARKETING_OPTIONS[effect.type];
        if (config) {
            if (!marketingTypes[effect.type] || config.salesBonus > marketingTypes[effect.type]) {
                marketingTypes[effect.type] = config.salesBonus;
            }
        }
    });

    let bonus = 0;
    Object.values(marketingTypes).forEach(salesBonus => {
        bonus += salesBonus;
    });
    return 1 + bonus;
}

function calculateShopBonus() {
    let bonus = 0;
    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (shop) {
            bonus += shop.salesBonus;
        }
    });
    return 1 + bonus;
}

function calculatePromotionEffect(price) {
    let finalPrice = price;
    let salesMultiplier = 1;

    if (GameState.promotions.bogo) {
        salesMultiplier *= 2; // 销量翻倍
    }

    if (GameState.promotions.discount) {
        finalPrice *= 0.8; // 降价20%
        salesMultiplier *= 1.6; // 销量+60%
    }

    if (GameState.promotions.bundle) {
        finalPrice += 2; // 单套授权费+¥2
        salesMultiplier *= 1.4; // 销量+40%
    }

    return { price: finalPrice, multiplier: salesMultiplier };
}

function calculateEstimatedSales() {
    const priceCoeff = calculatePriceCoefficient(GameState.currentPrice);
    const repCoeff = calculateReputationCoefficient();
    const weatherCoeff = calculateWeatherCoefficient();
    const marketingCoeff = calculateMarketingCoefficient();
    const shopBonus = calculateShopBonus();

    let promoEffect = calculatePromotionEffect(GameState.currentPrice);

    let baseSales = 1000 * priceCoeff * repCoeff * weatherCoeff * marketingCoeff * shopBonus * promoEffect.multiplier;

    // 技术研究加成: g = a + (a * b / 1000 * 100%)
    // 其中 a = baseSales(初始购买量), b = experimentLevel(实验等级)
    if (GameState.labProduction.experimentLevel > 0) {
        const experimentBonus = baseSales * (GameState.labProduction.experimentLevel / 1000);
        baseSales += experimentBonus;
    }

    // 研究升级加成：销量乘数
    const bonuses = getUpgradeBonuses();
    if (bonuses.salesMultiplier > 0) {
        const upgradeBonus = baseSales * bonuses.salesMultiplier;
        baseSales += upgradeBonus;
    }

    // 全局加成
    if (bonuses.globalBonus > 0) {
        const globalBonus = baseSales * bonuses.globalBonus;
        baseSales += globalBonus;
    }

    // 学术研究院销量加成（永久）
    if (GameState.academy && GameState.academy.salesBonus > 0) {
        const academyBonus = baseSales * GameState.academy.salesBonus;
        baseSales += academyBonus;
    }

    // 特殊效果加成
    if (GameState.specialEffects.newRecipe) {
        baseSales *= 1.2;
    }

    // 对拍模拟器贩子发起负面宣传
    if (GameState.specialEffects.competitorDebuff > 0) {
        baseSales *= 0.7;
    }

    // 劣质模拟器效果（销量-10%）
    if (GameState.specialEffects.inferiorSimulator > 0) {
        baseSales *= 0.9;
    }

    // 社区论坛热度影响
    const communityBonus = getCommunitySalesBonus();
    if (communityBonus !== 0) {
        baseSales *= (1 + communityBonus);
    }

    // 口碑传播加成（学生群体触发）
    if (GameState.customers.wordOfMouthBonus > 0) {
        baseSales += GameState.customers.wordOfMouthBonus;
    }

    // 确保不超过库存
    return Math.min(Math.floor(baseSales), GameState.inventory);
}

function calculatePassiveSales() {
    let passiveSales = 0;
    const weatherCoeff = calculateWeatherCoefficient();
    const marketingCoeff = calculateMarketingCoefficient();

    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (!shop) return;

        // 线上商城不受天气影响
        let shopWeatherCoeff = shop.weatherImmune ? 1.0 : weatherCoeff;

        // 暴雨时室外店铺无效
        if (GameState.weather === 'stormy' && !shop.weatherImmune) {
            shopWeatherCoeff = 0;
        }

        // 雨天时路边摊无效
        if (GameState.weather === 'rainy' && shopId === 'stall') {
            shopWeatherCoeff = 0;
        }

        let shopSales = shop.baseSales * shopWeatherCoeff * marketingCoeff;
        passiveSales += Math.floor(shopSales);
    });

    return Math.min(passiveSales, GameState.inventory);
}

// ==================== 销售系统 ====================
function executeSales() {
    console.log('=== 开始执行销售 ===');
    console.log('当前状态:', {
        day: GameState.day,
        inventory: GameState.inventory,
        currentPrice: GameState.currentPrice,
        restaurantLevel: GameState.restaurantLevel,
        session1HasSold: GameState.todaySales.session1.hasSold,
        session2HasSold: GameState.todaySales.session2.hasSold,
        isWaiting: GameState.salesTimer.isWaiting,
        isGameOver: GameState.isGameOver
    });

    // 检查游戏是否结束
    if (GameState.isGameOver) {
        console.log('游戏已结束，无法销售');
        alert('游戏已结束，无法进行销售！');
        return;
    }

    // 检查价格是否超过违法上限(最高定价的99%)
    const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
    const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
    
    console.log('价格检查:', {
        currentPrice: GameState.currentPrice,
        maxPrice: maxPrice,
        illegalPriceThreshold: illegalPriceThreshold
    });
    
    if (GameState.currentPrice > illegalPriceThreshold) {
        console.log('价格超过违法上限，触发游戏结束');
        endGameByAuthority();
        return;
    }

    // 确定当前是第几次销售
    let sessionKey = '';
    if (!GameState.todaySales.session1.hasSold) {
        sessionKey = 'session1';
    } else if (!GameState.todaySales.session2.hasSold) {
        sessionKey = 'session2';
    } else {
        console.log('今日销售已完成');
        alert('今日销售已完成!请进入下一天。');
        return;
    }

    console.log('当前销售场次:', sessionKey);

    if (GameState.inventory <= 0) {
        console.log('库存不足，无法销售');
        alert('库存不足，无法进行销售！');
        return;
    }

    // 检查是否在等待中
    if (GameState.salesTimer.isWaiting) {
        console.log('销售等待中');
        alert('销售进行中,请等待...');
        return;
    }

    // 计算主动销售
    const estimatedSales = calculateEstimatedSales();
    const actualSales = Math.min(estimatedSales, GameState.inventory);

    // 计算实际价格
    let promoEffect = calculatePromotionEffect(GameState.currentPrice);
    let finalPrice = promoEffect.price;

    // 优质标签加成
    if (GameState.specialEffects.qualityLabel) {
        finalPrice += 1;
    }

    // 计算成本
    const totalCost = actualSales * GameState.costPrice;

    // 买一送一的获得研发经费计算
    let revenue = actualSales * finalPrice;
    if (GameState.promotions.bogo) {
        revenue = revenue / 2; // 买一送一,获得研发经费减半
    }

    // 计算学术收益
    const profit = Math.floor(revenue) - Math.floor(totalCost);

    // 执行销售
    GameState.inventory -= actualSales;
    GameState.money += Math.floor(revenue);
    GameState.totalSold += actualSales;

    // 记录今日销售
    GameState.todaySales[sessionKey].quantity = actualSales;
    GameState.todaySales[sessionKey].revenue = Math.floor(revenue);
    GameState.todaySales[sessionKey].hasSold = true;
    GameState.todaySales.currentSession = sessionKey === 'session1' ? 1 : 2;

    // 更新社区热度（基于销售）
    updateCommunityHeat('sales', actualSales);

    // 显示结果
    showSalesResult(actualSales, finalPrice, Math.floor(revenue), Math.floor(totalCost), profit, sessionKey);

    // 添加日志
    addLog(`第${GameState.todaySales.currentSession}次销售: 授权 ${formatNumber(actualSales)} 个, 获得研发经费 ${formatMoney(Math.floor(revenue))}, 学术收益 ${formatMoney(profit)}`, profit >= 0 ? 'positive' : 'negative');

    // 启动倒计时(只有第1次销售后才需要等待)
    if (sessionKey === 'session1' && !GameState.todaySales.session2.hasSold && GameState.inventory > 0) {
        startSalesTimer();
    } else if (GameState.todaySales.session2.hasSold || GameState.inventory <= 0) {
        // 如果已经完成两次销售或库存为0,禁用按钮
        const salesBtn = document.getElementById('start-sales-btn');
        salesBtn.disabled = true;
        salesBtn.textContent = '今日销售已完成';
    }

    // 检查游戏结束
    checkGameEnd();

    // 更新UI
    updateUI();
}

function startSalesTimer() {
    GameState.salesTimer.isWaiting = true;
    GameState.salesTimer.timeLeft = CONFIG.SALES_WAIT_TIME;

    const salesBtn = document.getElementById('start-sales-btn');
    salesBtn.disabled = true;
    salesBtn.textContent = `等待中... ${GameState.salesTimer.timeLeft}秒`;

    GameState.salesTimer.timerId = setInterval(() => {
        GameState.salesTimer.timeLeft--;

        if (GameState.salesTimer.timeLeft <= 0) {
            clearInterval(GameState.salesTimer.timerId);
            GameState.salesTimer.isWaiting = false;
            GameState.salesTimer.timerId = null;

            salesBtn.disabled = false;
            salesBtn.textContent = '开始第2次销售';
            addLog('可以开始第2次销售了!', 'neutral');
        } else {
            salesBtn.textContent = `等待中... ${GameState.salesTimer.timeLeft}秒`;
        }

        updateUI();
    }, 1000);
}

function showSalesResult(quantity, price, revenue, cost, profit, session) {
    const resultDiv = document.getElementById('today-result');
    resultDiv.style.display = 'block';

    // 更新对应次数的销量
    if (session === 'session1') {
        document.getElementById('result-quantity-1').textContent = formatNumber(quantity);
    } else {
        document.getElementById('result-quantity-2').textContent = formatNumber(quantity);
    }

    // 计算总销量和总获得研发经费
    const totalQuantity = GameState.todaySales.session1.quantity + GameState.todaySales.session2.quantity;
    const totalRevenue = GameState.todaySales.session1.revenue + GameState.todaySales.session2.revenue;

    document.getElementById('result-quantity').textContent = formatNumber(totalQuantity);
    document.getElementById('result-revenue').textContent = formatMoney(totalRevenue);

    // 添加成本和学术收益显示
    let costEl = document.getElementById('result-cost');
    let profitEl = document.getElementById('result-profit');

    if (!costEl) {
        const statsDiv = document.querySelector('.result-stats');
        const costRow = document.createElement('div');
        costRow.className = 'stat-row';
        costRow.innerHTML = '<span>成本:</span><strong id="result-cost">¥0</strong>';
        statsDiv.appendChild(costRow);

        const profitRow = document.createElement('div');
        profitRow.className = 'stat-row';
        profitRow.innerHTML = '<span>学术收益:</span><strong id="result-profit">¥0</strong>';
        statsDiv.appendChild(profitRow);

        costEl = document.getElementById('result-cost');
        profitEl = document.getElementById('result-profit');
    }

    costEl.textContent = formatMoney(cost);
    profitEl.textContent = formatMoney(profit);
    profitEl.style.color = profit >= 0 ? 'var(--success)' : 'var(--error)';

    // 更新标题显示是哪次销售
    const sessionName = session === 'session1' ? '第1次销售' : '第2次销售';
    resultDiv.querySelector('h2').textContent = `${sessionName}结果`;
}

// ==================== 市场营销系统 ====================
function buyMarketing(type) {
    const config = CONFIG.MARKETING_OPTIONS[type];

    // 检查是否已解锁
    if (GameState.day < config.unlockDay) {
        alert(`${config.name} 还未解锁!需要第 ${config.unlockDay} 天才能使用。`);
        return;
    }

    if (GameState.money < config.cost) {
        alert('资金不足!');
        return;
    }

    // 检查是否已有相同类型的广告营销
    const existingEffect = GameState.activeMarketing.find(effect => effect.type === type);
    if (existingEffect) {
        alert(`你已经购买了${config.name},相同的广告不能叠加!剩余${existingEffect.daysLeft}天`);
        return;
    }

    // 扣除资金
    GameState.money -= config.cost;

    // 添加营销效果
    GameState.activeMarketing.push({
        type: type,
        daysLeft: config.duration
    });

    // 立即增加声誉
    if (config.reputationBonus > 0) {
        GameState.reputation = clamp(GameState.reputation + config.reputationBonus, 0, 100);
    }

    addLog(`购买了${config.icon} ${config.name},花费 ${formatMoney(config.cost)}`, 'positive');
    updateUI();
    updateMarketingOptions();
}

function updateMarketingEffects() {
    // 减少所有营销效果的剩余天数
    GameState.activeMarketing = GameState.activeMarketing.filter(effect => {
        effect.daysLeft--;
        return effect.daysLeft > 0;
    });
}

// ==================== 客户互动系统 ====================
function generateCustomer() {
    const rand = Math.random();
    let cumulativeProb = 0;
    let customerType = 'normal';

    // 根据概率选择客户类型
    for (const [type, config] of Object.entries(CONFIG.CUSTOMERS)) {
        cumulativeProb += config.probability;
        if (rand <= cumulativeProb) {
            customerType = type;
            break;
        }
    }

    // 农贸市场摊位增加批发商概率
    if (GameState.ownedShops.includes('market') && customerType === 'normal') {
        if (Math.random() < 0.10) {
            customerType = 'wholesaler';
        }
    }

    const config = CONFIG.CUSTOMERS[customerType];
    const demand = customerType === 'competitor' ? 0 : randomInt(config.minDemand, config.maxDemand);

    // 计算报价
    let offerPrice = GameState.currentPrice;
    if (customerType === 'wholesaler') {
        offerPrice = GameState.currentPrice * 0.7; // 批发商压价30%
    } else if (customerType === 'restaurant') {
        offerPrice = GameState.currentPrice * 1.1; // 餐厅愿意多付10%
    } else if (customerType === 'blogger') {
        offerPrice = GameState.currentPrice * 1.2; // 博主愿意多付20%
    }

    return {
        type: customerType,
        ...config,
        demand: demand,
        offerPrice: Math.max(2, Math.floor(offerPrice))
    };
}

function showCustomerInteraction(customer) {
    const modal = document.getElementById('customer-modal');
    const body = document.getElementById('customer-body');
    const footer = document.getElementById('customer-footer');

    document.getElementById('customer-title').textContent = `${customer.icon} ${customer.name}来访`;

    let html = `
        <div class="customer-info">
            <div class="customer-icon">${customer.icon}</div>
            <div class="customer-type">${customer.name}</div>
    `;

    if (customer.type !== 'competitor') {
        html += `
            <div class="customer-demand">需求: ${formatNumber(customer.demand)} 个</div>
            <div class="customer-offer">报价: ${formatMoney(customer.offerPrice)}/个</div>
        `;
    }

    html += `</div>`;
    body.innerHTML = html;

    // 生成操作按钮
    footer.innerHTML = '';

    if (customer.type === 'competitor') {
        // 竞争对手的特殊交互
        footer.innerHTML = `
            <button class="btn btn-danger" onclick="handleCompetitor(false)">拒绝 (声誉+5)</button>
            <button class="btn btn-secondary" onclick="handleCompetitor(true)">接受授权 (资金+¥2000, 声誉-10)</button>
        `;
    } else if (customer.type === 'blogger') {
        // 美食博主可以免费赠送
        footer.innerHTML = `
            <button class="btn btn-success" onclick="handleCustomerDeal(window.currentCustomer, true)">正常交易</button>
            <button class="btn btn-secondary" onclick="handleCustomerDeal(window.currentCustomer, false, true)">免费赠送 (声誉+15)</button>
            <button class="btn btn-danger" onclick="closeModal('customer-modal')">拒绝</button>
        `;
    } else {
        // 普通交易
        footer.innerHTML = `
            <button class="btn btn-success" onclick="handleCustomerDeal(window.currentCustomer, true)">接受授权</button>
            <button class="btn btn-secondary" onclick="handleCustomerNegotiation(window.currentCustomer)">尝试还价</button>
            <button class="btn btn-danger" onclick="closeModal('customer-modal')">拒绝</button>
        `;
    }

    modal.style.display = 'flex';

    // 将customer对象存储到window以便后续使用
    window.currentCustomer = customer;
}

function handleCustomerDeal(customer, accept, freeGiveaway = false) {
    if (freeGiveaway) {
        // 免费赠送
        const giveawayAmount = Math.min(customer.demand, GameState.inventory);
        GameState.inventory -= giveawayAmount;
        GameState.reputation = clamp(GameState.reputation + 15, 0, 100);
        addLog(`免费赠送${giveawayAmount}个模拟器给模拟器博主,声誉+15`, 'positive');
    } else if (accept) {
        // 正常交易
        const quantity = Math.min(customer.demand, GameState.inventory);
        const revenue = quantity * customer.offerPrice;

        GameState.inventory -= quantity;
        GameState.money += revenue;
        GameState.totalSold += quantity;

        addLog(`${customer.name}购买了${formatNumber(quantity)}个模拟器,获得研发经费${formatMoney(revenue)}`, 'positive');
    }

    closeModal('customer-modal');
    updateUI();
    checkGameEnd();
}

function handleCustomerNegotiation(customer) {
    // 还价成功率基于声誉
    const successRate = 0.3 + (GameState.reputation / 200);
    const success = Math.random() < successRate;

    if (success) {
        const betterPrice = Math.floor((customer.offerPrice + GameState.currentPrice) / 2);
        const quantity = Math.min(customer.demand, GameState.inventory);
        const revenue = quantity * betterPrice;

        GameState.inventory -= quantity;
        GameState.money += revenue;
        GameState.totalSold += quantity;
        GameState.reputation = clamp(GameState.reputation + 3, 0, 100);

        addLog(`还价成功! 以${formatMoney(betterPrice)}/个的价格授权${formatNumber(quantity)}个`, 'positive');
    } else {
        addLog(`还价失败,${customer.name}离开了`, 'negative');
        GameState.reputation = clamp(GameState.reputation - 2, 0, 100);
    }

    closeModal('customer-modal');
    updateUI();
    checkGameEnd();
}

function handleCompetitor(accept) {
    if (accept) {
        GameState.money += 2000;
        GameState.reputation = clamp(GameState.reputation - 10, 0, 100);
        addLog('接受了竞争对手的交易,获得¥2000但声誉-10', 'negative');
    } else {
        GameState.reputation = clamp(GameState.reputation + 5, 0, 100);
        addLog('拒绝了竞争对手,声誉+5', 'positive');
    }

    closeModal('customer-modal');
    updateUI();
}

// ==================== 连锁店系统 ====================
function buyShop(shopId) {
    const shop = CONFIG.SHOPS.find(s => s.id === shopId);
    if (!shop) return;

    if (GameState.money < shop.cost) {
        alert('资金不足!');
        return;
    }

    if (GameState.ownedShops.includes(shopId)) {
        alert('已经拥有该店铺!');
        return;
    }

    GameState.money -= shop.cost;
    GameState.ownedShops.push(shopId);

    addLog(`开设了${shop.name},花费${formatMoney(shop.cost)}`, 'positive');
    updateUI();
}

function calculateDailyShopCosts() {
    let totalCost = 0;
    GameState.ownedShops.forEach(shopId => {
        const shop = CONFIG.SHOPS.find(s => s.id === shopId);
        if (shop) {
            totalCost += shop.dailyCost;
        }
    });
    return totalCost;
}

// ==================== 赛事系统 ====================
function checkCurrentEvent() {
    const currentEventDiv = document.getElementById('current-event');
    let eventConfig = null;
    let day = GameState.day;
    let isCompleted = false;

    // 如果在无尽模式且超过90天，使用无尽模式赛事
    if (GameState.endlessMode && day > 90) {
        // 计算无尽模式中的相对天数（从第91天开始）
        const endlessDay = day - 90;
        // 每75天一个周期循环
        const cycleDay = ((endlessDay - 1) % 75) + 1;
        const actualDay = 90 + cycleDay;

        // 查找对应的无尽模式赛事
        eventConfig = CONFIG.ENDLESS_EVENTS.find(e => e.day === actualDay);

        // 检查是否已完成该赛事
        if (eventConfig && GameState.completedEvents.includes(actualDay)) {
            isCompleted = true;
        }
    } else {
        // 普通模式赛事
        eventConfig = CONFIG.EVENTS[day];
        
        // 检查是否已完成该赛事
        if (eventConfig && GameState.completedEvents.includes(day)) {
            isCompleted = true;
        }
    }

    if (eventConfig) {
        let html = `
            <div class="event-details">
                <div class="event-icon">${eventConfig.icon}</div>
                <div class="event-name">${eventConfig.name}</div>
                <div class="event-description">
        `;

        if (eventConfig.type === 'quality') {
            html += `
                展示你的模拟器品质! 需要投入营销资金≥¥1,500且声誉≥60才能获胜。
                <br>奖励: 声誉+25, 销量加成50%(持续5天), 解锁"优质模拟器"标签
            `;
        } else if (eventConfig.type === 'cooking') {
            html += `
                用冷门语言创作模拟器! 获胜概率: 40% + 声誉×0.3%
                <br>奖励: 声誉+30, 解锁新语言(永久销量+20%)
            `;
        } else if (eventConfig.type === 'championship') {
            html += `
                最终评比! 如果你已经售完10万个模拟器,将获得"模拟器之王"称号和额外奖金¥5,000
            `;
        } else if (eventConfig.type === 'final') {
            html += `
                总决赛! 这是最高荣誉的比赛,证明你是真正的模拟器大师!
                <br>奖励: 声誉+50, 获得"模拟器大师"称号, 解锁特殊成就
            `;
        }

        html += `</div>`;

        if (eventConfig.cost > 0) {
            html += `<div class="event-cost">报名费: ${formatMoney(eventConfig.cost)}</div>`;
        }

        // 根据是否已完成显示不同的按钮
        if (isCompleted) {
            html += `
                <div class="event-actions">
                    <button class="btn btn-secondary" disabled style="opacity: 0.5; cursor: not-allowed;">✓ 已参加</button>
                </div>
            `;
        } else {
            html += `
                <div class="event-actions">
                    <button class="btn btn-success" onclick="joinEvent(${GameState.day})">参加比赛</button>
                    <button class="btn btn-secondary" onclick="skipEvent(${GameState.day})">放弃参加</button>
                </div>
            `;
        }

        html += `
            </div>
        `;

        currentEventDiv.innerHTML = html;
    } else {
        currentEventDiv.innerHTML = '<p class="no-event">今天没有赛事活动</p>';
    }
}

function joinEvent(day) {
    // 支持普通模式和无尽模式的赛事
    let eventConfig = CONFIG.EVENTS[day];
    
    if (!eventConfig) {
        // 尝试从无尽模式赛事中查找
        eventConfig = CONFIG.ENDLESS_EVENTS.find(e => e.day === day);
    }
    
    if (!eventConfig) {
        alert(`第 ${day} 天没有比赛活动！`);
        return;
    }

    // 检查是否已经参加过该比赛
    if (GameState.completedEvents.includes(day)) {
        alert('你已经参加过这个比赛了，每个比赛只能参加一次！');
        return;
    }

    if (GameState.money < eventConfig.cost) {
        alert('资金不足,无法参加比赛!');
        return;
    }

    GameState.money -= eventConfig.cost;
    GameState.completedEvents.push(day);

    let won = false;

    if (eventConfig.type === 'quality') {
        // 品质大赛: 降低门槛,营销投入≥800或声誉≥40即可
        const totalMarketingSpent = GameState.activeMarketing.reduce((sum, effect) => {
            const config = CONFIG.MARKETING_OPTIONS[effect.type];
            return sum + config.cost;
        }, 0);

        won = (totalMarketingSpent >= 800 || GameState.reputation >= 40);

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
            GameState.specialEffects.qualityLabel = true;

            // 添加5天销量加成
            GameState.activeMarketing.push({
                type: 'event_bonus',
                daysLeft: 5,
                customBonus: 0.3
            });

            addLog('品质大赛获胜! 声誉+20, 获得优质模拟器标签(售价+¥1),销量加成30%(5天)', 'positive');
        } else {
            // 即使失败也给少量声誉
            GameState.reputation = clamp(GameState.reputation + 5, 0, 100);
            addLog('品质大赛未能获胜,但获得了经验! 声誉+5', 'neutral');
        }
    } else if (eventConfig.type === 'cooking') {
        // 创意设计大赛: 提高胜率
        const winRate = 0.5 + (GameState.reputation * 0.005);
        won = Math.random() < winRate;

        if (won) {
            GameState.reputation = clamp(GameState.reputation + 25, 0, 100);
            GameState.specialEffects.newRecipe = true;
            addLog('创意设计大赛获胜! 声誉+25, 解锁新语言(永久销量+20%)', 'positive');
        } else {
            // 失败也给少量声誉
            GameState.reputation = clamp(GameState.reputation + 8, 0, 100);
            addLog('创意设计大赛未能获胜,但学到了经验! 声誉+8', 'neutral');
        }
    } else if (eventConfig.type === 'championship') {
        // 半决赛: 检查总销量
        const targetSold = 500000; // 50万目标
        if (GameState.totalSold >= targetSold) {
            GameState.money += 20000;
            GameState.reputation = clamp(GameState.reputation + 30, 0, 100);
            addLog(`半决赛获胜! 总销量${formatNumber(GameState.totalSold)}超过目标${formatNumber(targetSold)},获得奖金${formatMoney(20000)},声誉+30`, 'positive');
        } else {
            GameState.reputation = clamp(GameState.reputation + 10, 0, 100);
            addLog(`半决赛遗憾失利! 总销量${formatNumber(GameState.totalSold)}未达目标${formatNumber(targetSold)},继续努力! 声誉+10`, 'neutral');
        }
    } else if (eventConfig.type === 'final') {
        // 总决赛: 大幅提高奖励
        const finalTarget = CONFIG.TARGET_SALES; // 100万
        if (GameState.totalSold >= finalTarget) {
            // 获胜奖励大幅提升
            GameState.money += 100000;
            GameState.reputation = clamp(GameState.reputation + 50, 0, 100);
            
            // 解锁自己办比赛
            GameState.gameWon = true;
            
            addLog(`🎉 恭喜获得总冠军! 总销量${formatNumber(GameState.totalSold)}达成目标!`, 'positive');
            addLog(`💰 获得奖金${formatMoney(100000)},声誉+50`, 'positive');
            addLog(`🏆 你已成为模拟器之王! 可以开始举办自己的比赛了!`, 'positive');
            
            // 显示胜利弹窗
            setTimeout(() => {
                showVictoryModal();
            }, 1000);
        } else {
            // 即使失败也有参与奖
            GameState.money += 10000;
            GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
            addLog(`总决赛结束! 总销量${formatNumber(GameState.totalSold)}未达目标${formatNumber(finalTarget)},但获得参与奖${formatMoney(10000)},声誉+20`, 'neutral');
        }
    }

    updateUI();
    checkCurrentEvent();
}

function skipEvent(day) {
    GameState.completedEvents.push(day);
    addLog(`放弃了第${day}天的赛事`, 'neutral');
    updateUI();
}

// ==================== 自定义赛事系统（无尽模式）====================

/**
 * 打开举办比赛表单
 */
function hostCustomEvent() {
    // 检查是否在无尽模式且超过90天
    if (!GameState.endlessMode || GameState.day <= 90) {
        alert('只有在无尽模式中且超过90天后才能举办自定义比赛！');
        return;
    }

    // 关闭可能存在的旧弹窗
    const oldModal = document.getElementById('custom-event-modal');
    if (oldModal) {
        oldModal.remove();
    }

    // 创建表单弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'custom-event-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <h2>🎯 举办自定义比赛</h2>
            <p style="margin-bottom: 20px; color: #666;">设置你的比赛参数，吸引敌商参加！</p>
            
            <div style="display: grid; gap: 15px;">
                <!-- 比赛名称 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        📝 比赛名称
                    </label>
                    <input type="text" id="event-name-input" placeholder="例如：干净的模拟器赛" 
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;"
                           maxlength="20">
                </div>
                
                <!-- 报名费 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        💰 报名费（最多 ¥10,000）
                    </label>
                    <input type="number" id="event-cost-input" placeholder="5000" min="0" max="10000" value="5000"
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <small style="color: #999;">敌商需要支付的报名费，获胜后可获得</small>
                </div>
                
                <!-- 比赛天数 -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">
                        📅 比赛持续天数（最多 10 天）
                    </label>
                    <input type="number" id="event-days-input" placeholder="5" min="1" max="10" value="5"
                           style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <small style="color: #999;">比赛将持续的天数，期间将与敌商竞争销量</small>
                </div>
                
                <!-- 敌商信息预览 -->
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #4a90e2;">
                    <h4 style="margin-bottom: 10px; color: #4a90e2;">👥 敌商信息</h4>
                    <p style="margin: 5px 0; color: #666;">• 参赛敌商数量：<strong id="rival-count-preview">随机 5-15 个</strong></p>
                    <p style="margin: 5px 0; color: #666;">• 敌商实力：你的 <strong>10%</strong>（可联合）</p>
                    <p style="margin: 5px 0; color: #666;">• 获胜奖励：所有敌商报名费 + 5天"优质模拟器"效果</p>
                    <p style="margin: 5px 0; color: #666;">• 失败惩罚：10天"劣质模拟器"效果（销量-10%）</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="confirmHostEvent()" style="width: 100%;">
                    🚀 开始比赛
                </button>
                <button class="btn btn-secondary" onclick="closeModal('custom-event-modal')" style="width: 100%;">
                    取消
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

/**
 * 确认举办比赛
 */
function confirmHostEvent() {
    const eventNameInput = document.getElementById('event-name-input');
    const eventCostInput = document.getElementById('event-cost-input');
    const eventDaysInput = document.getElementById('event-days-input');
    
    if (!eventNameInput || !eventCostInput || !eventDaysInput) {
        alert('表单错误，请重试！');
        closeModal('custom-event-modal');
        return;
    }
    
    const eventName = eventNameInput.value.trim();
    const eventCost = parseInt(eventCostInput.value);
    const eventDays = parseInt(eventDaysInput.value);
    
    // 验证输入
    if (!eventName) {
        alert('请输入比赛名称！');
        return;
    }
    
    if (isNaN(eventCost) || eventCost < 0 || eventCost > 10000) {
        alert('报名费必须在 0-10000 之间！');
        return;
    }
    
    if (isNaN(eventDays) || eventDays < 1 || eventDays > 10) {
        alert('比赛天数必须在 1-10 天之间！');
        return;
    }
    
    // 生成敌商
    const rivalCount = Math.floor(Math.random() * 11) + 5; // 5-15个
    const rivals = [];
    
    for (let i = 0; i < rivalCount; i++) {
        // 敌商基础实力为玩家当前销量的10%
        const basePower = Math.floor(GameState.inventory * 0.1);
        
        // 随机决定是否联合（30%概率联合，联合后实力+50%）
        const isAllied = Math.random() < 0.3;
        const power = isAllied ? Math.floor(basePower * 1.5) : basePower;
        
        rivals.push({
            name: `敌商${i + 1}`,
            basePower: basePower,
            isAllied: isAllied,
            currentPower: power,
            totalSold: 0
        });
    }
    
    // 保存比赛状态到GameState
    GameState.customEvent = {
        active: true,
        name: eventName,
        cost: eventCost,
        duration: eventDays,
        daysLeft: eventDays,
        rivals: rivals,
        playerTotalSold: 0,
        rivalTotalSold: 0,
        startedDay: GameState.day
    };
    
    closeModal('custom-event-modal');
    
    addLog(`🎯 比赛"${eventName}"正式开始！`, 'positive');
    addLog(`👥 共有 ${rivalCount} 个敌商参加比赛`, 'neutral');
    
    updateUI();
}

/**
 * 处理自定义比赛每日逻辑
 */
function processCustomEventDay() {
    if (!GameState.customEvent || !GameState.customEvent.active) {
        return;
    }
    
    const event = GameState.customEvent;
    
    // 计算今日玩家销量
    const todayPlayerSales = GameState.todaySales.session1.quantity + GameState.todaySales.session2.quantity;
    event.playerTotalSold += todayPlayerSales;
    
    // 计算敌商今日销量（不同步玩家实力，使用固定算法）
    let todayRivalSales = 0;
    event.rivals.forEach(rival => {
        // 敌商每日销量为基础实力的随机比例（20%-40%）
        const dailySale = Math.floor(rival.currentPower * (0.2 + Math.random() * 0.2));
        rival.totalSold += dailySale;
        todayRivalSales += dailySale;
    });
    
    event.rivalTotalSold += todayRivalSales;
    
    event.daysLeft--;
    
    addLog(`📊 比赛第${event.duration - event.daysLeft}天：你授权${formatNumber(todayPlayerSales)}个，敌商共授权${formatNumber(todayRivalSales)}个`, 'neutral');
    
    // 比赛结束
    if (event.daysLeft <= 0) {
        finishCustomEvent();
    }
    
    updateUI();
}

/**
 * 更新自定义比赛状态显示
 */
function updateCustomEventDisplay() {
    const statusDiv = document.getElementById('custom-event-status');
    const detailsDiv = document.getElementById('custom-event-details');
    const hostSection = document.getElementById('host-event-section');
    
    if (!statusDiv || !detailsDiv) return;
    
    if (GameState.customEvent && GameState.customEvent.active) {
        // 显示比赛状态
        statusDiv.style.display = 'block';
        if (hostSection) hostSection.style.display = 'none'; // 隐藏举办按钮
        
        const event = GameState.customEvent;
        const progress = ((event.duration - event.daysLeft) / event.duration * 100).toFixed(1);
        
        let html = `
            <div style="margin-bottom: 15px;">
                <h4 style="font-size: 1.3em; margin-bottom: 10px;">${event.name}</h4>
                <p>📅 剩余天数：<strong>${event.daysLeft}</strong> / ${event.duration} 天</p>
                <p>💰 报名费：¥${formatNumber(event.cost)} × ${event.rivals.length} 个敌商</p>
                <p>🏆 获胜奖励：¥${formatNumber(event.cost * event.rivals.length)} + 5天优质效果</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin-bottom: 10px;">📊 比赛进度</h4>
                <div style="background: rgba(255,255,255,0.3); height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                    <div style="background: white; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <p>你的总销量：<strong style="font-size: 1.2em;">${formatNumber(event.playerTotalSold)}</strong> 个</p>
                <p>敌商总销量：<strong style="font-size: 1.2em;">${formatNumber(event.rivalTotalSold)}</strong> 个</p>
                <p style="margin-top: 10px; font-weight: bold;">
                    ${event.playerTotalSold >= event.rivalTotalSold ? 
                        '✅ 目前领先！继续保持！' : 
                        '⚠️ 目前落后，加油！'}
                </p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                <h4 style="margin-bottom: 10px;">👥 敌商列表（共${event.rivals.length}个）</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${event.rivals.slice(0, 5).map(rival => `
                        <div style="padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2);">
                            <span>${rival.name}</span>
                            ${rival.isAllied ? '<span style="background: yellow; color: black; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 5px;">联合</span>' : ''}
                            <span style="float: right;">已售: ${formatNumber(rival.totalSold)}</span>
                        </div>
                    `).join('')}
                    ${event.rivals.length > 5 ? `<p style="text-align: center; margin-top: 10px; font-style: italic;">...还有${event.rivals.length - 5}个敌商</p>` : ''}
                </div>
            </div>
        `;
        
        detailsDiv.innerHTML = html;
    } else {
        // 隐藏比赛状态，显示举办按钮（如果符合条件）
        statusDiv.style.display = 'none';
        if (hostSection) {
            const shouldShow = GameState.endlessMode && GameState.day > 90;
            hostSection.style.display = shouldShow ? 'block' : 'none';
        }
    }
}

/**
 * 结束自定义比赛
 */
function finishCustomEvent() {
    const event = GameState.customEvent;
    if (!event) return;
    
    const playerWon = event.playerTotalSold >= event.rivalTotalSold;
    
    // 计算总报名费
    const totalEntryFee = event.cost * event.rivals.length;
    
    if (playerWon) {
        // 获胜奖励
        GameState.money += totalEntryFee;
        
        // 添加5天优质模拟器效果
        GameState.activeMarketing.push({
            type: 'quality_label',
            daysLeft: 5,
            customBonus: 0
        });
        
        addLog(`🏆 恭喜！你在"${event.name}"中获胜！`, 'positive');
        addLog(`💰 获得敌商报名费总计 ${formatMoney(totalEntryFee)}`, 'positive');
        addLog(`⭐ 获得5天"优质模拟器"效果！`, 'positive');
    } else {
        // 失败惩罚：10天劣质模拟器效果
        GameState.specialEffects.inferiorSimulator = 10; // 10天
        
        addLog(`😢 很遗憾，你在"${event.name}"中失败了...`, 'error');
        addLog(`⚠️ 获得10天"劣质模拟器"效果（销量-10%）`, 'error');
    }
    
    // 清除比赛状态
    GameState.customEvent = null;
    
    updateUI();
}

// ==================== 赛事倒计时系统 ====================
function updateEventCountdown() {
    const countdownDiv = document.getElementById('event-countdown');
    const daysLeftSpan = document.getElementById('event-days-left');

    if (!countdownDiv || !daysLeftSpan) return;

    let nextEventDay = null;

    // 如果在无尽模式且超过90天
    if (GameState.endlessMode && GameState.day > 90) {
        const endlessDay = GameState.day - 90;
        const cycleDay = ((endlessDay - 1) % 75) + 1;

        // 查找下一个无尽模式赛事
        for (const event of CONFIG.ENDLESS_EVENTS) {
            if (event.day > 90 + cycleDay && !GameState.completedEvents.includes(event.day)) {
                nextEventDay = event.day;
                break;
            }
        }

        // 如果当前周期没有更多赛事，计算下一个周期的第一个赛事
        if (!nextEventDay && CONFIG.ENDLESS_EVENTS.length > 0) {
            const firstEventInCycle = CONFIG.ENDLESS_EVENTS[0].day;
            const daysInCurrentCycle = 75 - cycleDay;
            nextEventDay = GameState.day + daysInCurrentCycle + firstEventInCycle - 90;
        }
    } else if (!GameState.endlessMode) {
        // 普通模式：查找下一个赛事
        for (const [day, event] of Object.entries(CONFIG.EVENTS)) {
            const dayNum = parseInt(day);
            if (dayNum > GameState.day && !GameState.completedEvents.includes(dayNum)) {
                nextEventDay = dayNum;
                break;
            }
        }
    }

    if (nextEventDay) {
        const daysLeft = nextEventDay - GameState.day;
        daysLeftSpan.textContent = daysLeft;
        countdownDiv.style.display = 'block';
    } else {
        countdownDiv.style.display = 'none';
    }
}

// ==================== 随机事件系统 ====================
function triggerRandomEvent() {
    const rand = Math.random();

    if (rand < 0.4) {
        // 正面事件(提高到40%)
        triggerPositiveEvent();
    } else if (rand < 0.65) {
        // 负面事件(降低到25%,原30%)
        triggerNegativeEvent();
    }
    // 35%概率无事件(原40%)
}

function triggerPositiveEvent() {
    const events = [
        {
            name: '学术社区捐赠模拟器样本',
            effect: () => {
                GameState.inventory += 5000;
                return '学术社区捐赠模拟器样本! 库存+5000个';
            },
            type: 'positive'
        },
        {
            name: '网红推荐',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 15, 0, 100);
                return '模拟器网红推荐了你的模拟器! 声誉+15';
            },
            type: 'positive'
        },
        {
            name: '政府补贴',
            effect: () => {
                GameState.money += 2000;
                return '获得政府补贴¥2,000!';
            },
            type: 'positive'
        },
        {
            name: '好天气',
            effect: () => {
                return '运输顺畅,今日销量+30%';
            },
            type: 'positive',
            salesBonus: 0.3
        },
        {
            name: '客户好评',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 10, 0, 100);
                GameState.money += 1000;
                return '收到客户五星好评! 声誉+10,小费¥1,000';
            },
            type: 'positive'
        },
        {
            name: '社区表彰',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation + 20, 0, 100);
                return '因诚信经营获得社区表彰! 声誉+20';
            },
            type: 'positive'
        }
    ];

    const event = events[randomInt(0, events.length - 1)];
    const message = event.effect();
    addLog(message, event.type || 'positive');
}

function triggerNegativeEvent() {
    const events = [
        {
            name: '病毒',
            effect: () => {
                GameState.inventory = Math.max(0, GameState.inventory - 2000);
                return '发现病毒! 库存-2000个';
            },
            type: 'negative'
        },
        {
            name: '负面新闻',
            effect: () => {
                GameState.reputation = clamp(GameState.reputation - 8, 0, 100);
                return '出现负面新闻! 声誉-8';
            },
            type: 'negative'
        },
        {
            name: '设备故障',
            effect: () => {
                GameState.money = Math.max(0, GameState.money - 800);
                return '设备故障! 维修费¥800';
            },
            type: 'negative'
        },
        {
            name: '对拍模拟器贩子发起负面宣传',
            effect: () => {
                GameState.specialEffects.competitorDebuff = 2;
                return '竞争对手恶意打压! 未来2天销量-20%';
            },
            type: 'negative'
        }
    ];

    const event = events[randomInt(0, events.length - 1)];
    const message = event.effect();
    addLog(message, event.type || 'negative');
}

// ==================== 天气系统 ====================
function generateWeather() {
    const weathers = Object.keys(CONFIG.WEATHER);
    const weights = [0.35, 0.25, 0.20, 0.10, 0.10]; // 各天气的概率权重

    const rand = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < weathers.length; i++) {
        cumulativeWeight += weights[i];
        if (rand <= cumulativeWeight) {
            GameState.weather = weathers[i];
            break;
        }
    }
}

// ==================== 每日推进 ====================
function nextDay() {
    if (GameState.isGameOver) {
        return;
    }

    // 合约送达检测
    if (GameState.contractSigned && GameState.day >= GameState.nextDeliveryDay) {
        GameState.inventory += CONFIG.CONTRACT_DELIVERY;
        GameState.nextDeliveryDay = GameState.day + CONFIG.CONTRACT_INTERVAL;
        addLog(`生产基地合约送达! 获得 ${formatNumber(CONFIG.CONTRACT_DELIVERY)} 个模拟器`, 'positive');
        addLog(`下次送达: 第${GameState.nextDeliveryDay}天`, 'neutral');
    }

    // 无尽模式：每天开始时重置购买额度
    if (GameState.endlessMode) {
        GameState.todayPurchase = 0;

        // 检查资金链断裂
        if (GameState.money <= CONFIG.BANKRUPTCY_LIMIT) {
            endGameByBankruptcy('你的资金已降至' + formatMoney(GameState.money) + ', 低于' + formatMoney(CONFIG.BANKRUPTCY_LIMIT) + '的警戒线, 资金链断裂!');
            return;
        }
    }

    // 重置每日客户加成
    resetDailyCustomerBonuses();

    // 如果今天还没销售,先执行销售
    if (!GameState.todaySales.session1.hasSold && GameState.inventory > 0) {
        executeSales();
    }

    // 执行产品包生产销售(自动)
    if (GameState.cannedProduction.enabled) {
        executeCannedProduction();
    }

    // 计算被动销量
    const passiveSales = calculatePassiveSales();
    if (passiveSales > 0) {
        let passiveRevenue = passiveSales * GameState.currentPrice;

        if (GameState.specialEffects.qualityLabel) {
            passiveRevenue += passiveSales;
        }

        GameState.inventory -= passiveSales;
        GameState.money += Math.floor(passiveRevenue);
        GameState.totalSold += passiveSales;

        addLog(`技术社区自然传播带动被动授权: ${formatNumber(passiveSales)} 个,获得研发经费 ${formatMoney(Math.floor(passiveRevenue))}`, 'positive');
    }

    // 扣除店铺运营成本
    const dailyCosts = calculateDailyShopCosts();
    if (dailyCosts > 0) {
        GameState.money -= dailyCosts;
        addLog(`店铺运营成本: ${formatMoney(dailyCosts)}`, 'negative');
    }

    // 更新股票价格
    updateStockPrices();

    // 更新营销效果
    updateMarketingEffects();

    // 处理自定义比赛逻辑
    processCustomEventDay();

    // 减少特殊效果计时器
    if (GameState.specialEffects.competitorDebuff > 0) {
        GameState.specialEffects.competitorDebuff--;
    }
    
    // 减少劣质模拟器效果计时器
    if (GameState.specialEffects.inferiorSimulator > 0) {
        GameState.specialEffects.inferiorSimulator--;
        if (GameState.specialEffects.inferiorSimulator === 0) {
            addLog('✅ "劣质模拟器"效果已消失', 'positive');
        }
    }

    // 重置今日销售状态
    GameState.todaySales.session1.hasSold = false;
    GameState.todaySales.session2.hasSold = false;
    GameState.todaySales.currentSession = 0;

    // 无尽模式缺货天数检测
    if (GameState.endlessMode) {
        if (GameState.inventory <= 0) {
            GameState.stockoutDays++;
            addLog(`⚠️ 模拟器库存告急! 连续缺货第 ${GameState.stockoutDays} 天 (超过${CONFIG.STOCKOUT_LIMIT}天将资金链断裂)`, 'negative');

            if (GameState.stockoutDays > CONFIG.STOCKOUT_LIMIT) {
                endGameByBankruptcy(`模拟器连续缺货 ${GameState.stockoutDays} 天 (超过${CONFIG.STOCKOUT_LIMIT}天上限), 供应链断裂!`);
                return;
            }
        } else {
            GameState.stockoutDays = 0;
        }
    }

    // 清除销售计时器
    if (GameState.salesTimer.timerId) {
        clearInterval(GameState.salesTimer.timerId);
        GameState.salesTimer.timerId = null;
    }
    GameState.salesTimer.isWaiting = false;
    GameState.salesTimer.timeLeft = 0;

    // 重置销售按钮
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn) {
        salesBtn.disabled = false;
        salesBtn.textContent = '开始第1次销售';
    }

    // 隐藏销售结果
    document.getElementById('today-result').style.display = 'none';
    // 移除成本和学术收益显示
    const costEl = document.getElementById('result-cost');
    const profitEl = document.getElementById('result-profit');
    if (costEl && costEl.parentElement) {
        costEl.parentElement.remove();
    }
    if (profitEl && profitEl.parentElement) {
        profitEl.parentElement.remove();
    }

    // 进入下一天
    GameState.day++;

    // 生成新天气
    generateWeather();

    // 触发随机事件
    triggerRandomEvent();

    // 检查是否有特殊客户（使用对话框版本）
    checkDailyCustomerWithDialog();

    // 生成社区今日话题
    generateDailyTopic();

    // 检查餐馆升级条件
    checkRestaurantUpgrade();

    // 更新UI
    updateUI();

    // 检查成就
    checkAchievements();

    // 检查游戏结束
    checkGameEnd();

    // 保存游戏
    saveGame();
}

// ==================== 游戏结束检测 ====================
function checkGameEnd() {
    if (GameState.isGameOver) {
        return;
    }

    // 胜利条件: 售完所有模拟器(且未在无尽模式)
    if ((GameState.inventory <= 0 || GameState.totalSold >= CONFIG.TARGET_SALES) && !GameState.endlessMode) {
        // 触发无尽模式
        triggerEndlessMode();
        return;
    }

    // 失败条件: 超过90天(且未在无尽模式)
    if (GameState.day > CONFIG.MAX_DAYS && !GameState.endlessMode) {
        endGame(false);
        return;
    }
}

// 触发无尽模式
function triggerEndlessMode() {
    GameState.endlessMode = true;
    GameState.inventory = 0; // 先清空
    
    // 清除模拟器研究院的增益（不延续至下一局）
    if (GameState.academy && GameState.academy.salesBonus > 0) {
        addLog('🔄 进入无尽模式，模拟器研究院的销量加成已重置', 'neutral');
        GameState.academy.salesBonus = 0;
    }

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '🎉 恭喜通关!';
    title.className = 'result-title win';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🏆</div>
            <div class="result-title win">你成功售完了所有模拟器!</div>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">用时</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终声誉</div>
                    <div class="value">${GameState.reputation}/100</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                <h3 style="color: var(--primary);">🌟 无尽模式已解锁!</h3>
                <p style="margin: 10px 0; color: var(--text-secondary);">
                    你已经完成了90天售完1,000,000个模拟器的目标!<br>
                    现在你可以继续经营,与模拟器生产基地签约获得源源不断的模拟器。
                </p>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: #fff8e1; border-radius: 8px;">
                <h4>📋 生产基地合约</h4>
                <p style="margin: 8px 0; font-size: 0.9rem; color: var(--text-secondary);">
                    • 签约费用: <strong style="color: var(--error);">${formatMoney(CONFIG.CONTRACT_COST)}</strong><br>
                    • 合约周期: 每 <strong>${CONFIG.CONTRACT_INTERVAL}</strong> 天送达 <strong>${formatNumber(CONFIG.CONTRACT_DELIVERY)}</strong> 个模拟器<br>
                    • 成本价: <strong>${formatMoney(GameState.costPrice)}</strong>/个<br>
                    • 合约无限期有效,可持续经营!
                </p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // 添加合约按钮
    const modalFooter = document.getElementById('game-over-modal').querySelector('.modal-footer');
    modalFooter.innerHTML = `
        <button class="btn btn-success" onclick="signContract()" ${GameState.money < CONFIG.CONTRACT_COST ? 'disabled' : ''}>
            ${GameState.money < CONFIG.CONTRACT_COST ? '资金不足' : '签约生产基地'} (${formatMoney(CONFIG.CONTRACT_COST)})
        </button>
        <button class="btn btn-secondary" onclick="startEndlessMode()">直接开始无尽模式</button>
    `;

    updateUI();
}

// 开始无尽模式(不签约)
function startEndlessMode() {
    closeModal('game-over-modal');
    addLog('已进入无尽模式! 你仍有库存可以继续销售。', 'neutral');
    // 给一些初始库存
    GameState.inventory = 50000;
    addLog(`获得初始库存: ${formatNumber(50000)} 个模拟器`, 'positive');
    updateUI();
}

// 与生产基地签约
function signContract() {
    if (GameState.money < CONFIG.CONTRACT_COST) {
        alert('资金不足!签约需要' + formatMoney(CONFIG.CONTRACT_COST));
        return;
    }

    GameState.money -= CONFIG.CONTRACT_COST;
    GameState.contractSigned = true;
    GameState.contractDay = GameState.day;
    GameState.nextDeliveryDay = GameState.day + CONFIG.CONTRACT_INTERVAL;
    GameState.inventory += CONFIG.CONTRACT_DELIVERY;

    addLog(`与模拟器生产基地签约成功! 花费${formatMoney(CONFIG.CONTRACT_COST)}, 获得${formatNumber(CONFIG.CONTRACT_DELIVERY)}个模拟器`, 'positive');
    addLog(`下次送达: 第${GameState.nextDeliveryDay}天`, 'neutral');

    closeModal('game-over-modal');
    updateUI();
}

// 定价远超学术委员会指导价导致的游戏结束
function endGameByAuthority() {
    GameState.isGameOver = true;
    GameState.gameWon = false;

    // 计算违法上限价格
    const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
    const illegalPriceThreshold = Math.floor(maxPrice * 0.99);

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '🚔 游戏结束';
    title.className = 'result-title lose';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🚫</div>
            <div class="result-title lose">你因定价过高被市场监督管理局带走!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--text-secondary);">
                你的模拟器定价为 <strong style="color: var(--error); font-size: 1.3rem;">${formatMoney(GameState.currentPrice)}</strong>,
                超过了法定上限 <strong style="color: var(--error);">${formatMoney(illegalPriceThreshold)}</strong>!
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">经营天数</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">剩余库存</div>
                    <div class="value">${formatNumber(GameState.inventory)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-style: italic;">
                "哄抬物价是违法行为,请合理定价!法定最高定价为${formatMoney(maxPrice)}元的99%即${formatMoney(illegalPriceThreshold)}元"
            </p>
        </div>
    `;

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('simulatorSimulatorSave');
}

// 资金链断裂导致的游戏结束
function endGameByBankruptcy(reason) {
    GameState.isGameOver = true;
    GameState.gameWon = false;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    title.textContent = '💸 游戏结束';
    title.className = 'result-title lose';

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">📉</div>
            <div class="result-title lose">资金链断裂,经营破产!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--error);">
                ${reason}
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">经营天数</div>
                    <div class="value">${GameState.day} 天</div>
                </div>
                <div class="result-stat">
                    <div class="label">总销量</div>
                    <div class="value">${formatNumber(GameState.totalSold)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">剩余库存</div>
                    <div class="value">${formatNumber(GameState.inventory)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-style: italic;">
                "经营有风险,投资需谨慎!合理控制库存和资金周转。"
            </p>
        </div>
    `;

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('simulatorSimulatorSave');
}

// ==================== 胜利弹窗(90日获胜后) ====================
function showVictoryModal() {
    const modal = document.getElementById('custom-modal');
    const body = document.getElementById('modal-body');

    body.innerHTML = `
        <div class="game-over-result">
            <div class="result-icon">🏆</div>
            <div class="result-title win">🎉 恭喜获得总冠军!</div>
            <p style="margin: 20px 0; font-size: 1.1rem; color: var(--text-secondary);">
                你在90天内授权了 <strong style="color: var(--success); font-size: 1.3rem;">${formatNumber(GameState.totalSold)}</strong> 个模拟器!
            </p>
            <div class="result-stats-final">
                <div class="result-stat">
                    <div class="label">最终资金</div>
                    <div class="value">${formatMoney(GameState.money)}</div>
                </div>
                <div class="result-stat">
                    <div class="label">最终声誉</div>
                    <div class="value">${GameState.reputation}/100</div>
                </div>
                <div class="result-stat">
                    <div class="label">游戏评级</div>
                    <div class="value" id="final-rating">计算中...</div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
                <h3 style="color: white; margin-bottom: 10px;">🌟 现在你可以举办自己的比赛了!</h3>
                <p style="margin: 10px 0;">
                    作为模拟器之王,你现在可以:<br>
                    • 举办奥林匹克模拟器竞赛<br>
                    • 邀请其他玩家参加<br>
                    • 制定比赛规则和目标<br>
                    • 成为模拟器界的主办方!
                </p>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="closeModal('custom-modal')" class="btn btn-primary" style="flex: 1;">继续经营</button>
                <button onclick="startOwnCompetition()" class="btn btn-success" style="flex: 1;">🏆 举办自己的比赛</button>
            </div>
        </div>
    `;

    // 计算并显示评级
    const rating = calculateGameRating();
    const ratingEl = document.getElementById('final-rating');
    if (ratingEl) {
        ratingEl.textContent = `${rating.rating}级 (${rating.score}分)`;
        ratingEl.style.color = rating.score >= 100 ? 'var(--success)' : rating.score >= 70 ? 'var(--warning)' : 'var(--error)';
    }

    modal.style.display = 'flex';
}

// 举办自己的比赛
function startOwnCompetition() {
    closeModal('custom-modal');
    
    // 更新赛事活动栏显示自己办的比赛
    const eventsTab = document.querySelector('[data-tab="events"]');
    if (eventsTab) {
        eventsTab.textContent = '🏆 我的比赛';
    }
    
    addLog('🏆 你开始筹备自己的奥林匹克模拟器竞赛!', 'positive');
    alert('恭喜你成为模拟器竞赛主办方!\n\n赛事活动栏已更新为"我的比赛"\n\n你可以在这里举办属于自己的模拟器竞赛!');
}

// 无尽模式批发购买
function purchaseWholesale() {
    if (!GameState.endlessMode) return;

    const pricePerUnit = CONFIG.WHOLESALE_PRICE;
    const maxCanBuy = CONFIG.WHOLESALE_MAX_DAILY - GameState.todayPurchase;

    if (maxCanBuy <= 0) {
        alert('今日购买额度已用完! 每天最多购买' + formatNumber(CONFIG.WHOLESALE_MAX_DAILY) + '个');
        return;
    }

    // 弹窗输入授权数量
    const input = prompt(
        `无尽模式批发购买\n\n` +
        `• 批发价: ${formatMoney(pricePerUnit)}/个\n` +
        `• 今日已购买: ${formatNumber(GameState.todayPurchase)} 个\n` +
        `• 今日剩余额度: ${formatNumber(maxCanBuy)} 个\n` +
        `• 当前资金: ${formatMoney(GameState.money)}\n\n` +
        `请输入授权数量 (1-${maxCanBuy}):`
    );

    if (input === null) return;

    const quantity = parseInt(input);
    if (isNaN(quantity) || quantity <= 0) {
        alert('请输入有效的数量!');
        return;
    }

    if (quantity > maxCanBuy) {
        alert(`今日剩余额度不足! 最多可购买 ${formatNumber(maxCanBuy)} 个`);
        return;
    }

    const totalCost = quantity * pricePerUnit;

    GameState.money -= totalCost;
    GameState.inventory += quantity;
    GameState.todayPurchase += quantity;

    addLog(`批发购买 ${formatNumber(quantity)} 个模拟器, 花费 ${formatMoney(totalCost)}`, 'neutral');
    addLog(`今日已购买: ${formatNumber(GameState.todayPurchase)}/${formatNumber(CONFIG.WHOLESALE_MAX_DAILY)} 个`, 'neutral');

    // 检查资金链
    if (GameState.money <= CONFIG.BANKRUPTCY_LIMIT) {
        endGameByBankruptcy('购买后资金降至' + formatMoney(GameState.money) + ', 低于' + formatMoney(CONFIG.BANKRUPTCY_LIMIT) + '的警戒线!');
        return;
    }

    updateUI();
}

function endGame(won) {
    GameState.isGameOver = true;
    GameState.gameWon = won;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const body = document.getElementById('game-over-body');

    if (won) {
        title.textContent = '🎉 恭喜通关!';
        title.className = 'result-title win';

        // 计算评分
        const ratingData = calculateGameRating();
        const daysUsed = GameState.day;
        const efficiency = Math.round((CONFIG.TARGET_SALES / daysUsed) * 100) / 100;

        body.innerHTML = `
            <div class="game-over-result">
                <div class="result-icon">🏆</div>
                <div class="result-title win">你成功在${daysUsed}天内售完了所有模拟器!</div>
                <div class="result-stats-final">
                    <div class="result-stat">
                        <div class="label">用时</div>
                        <div class="value">${daysUsed} 天</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">日均销量</div>
                        <div class="value">${formatNumber(efficiency)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终资金</div>
                        <div class="value">${formatMoney(GameState.money)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终声誉</div>
                        <div class="value">${GameState.reputation}/100</div>
                    </div>
                </div>
                <div style="font-size: 2rem; margin: 20px 0;">
                    评级: <strong style="color: var(--primary); font-size: 3rem;">${ratingData.rating}</strong>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 5px;">
                        综合得分: ${ratingData.score} 分
                    </div>
                </div>
            </div>
        `;
    } else {
        title.textContent = '😢 游戏结束';
        title.className = 'result-title lose';

        const remaining = GameState.inventory;
        const completionRate = ((GameState.totalSold / CONFIG.TARGET_SALES) * 100).toFixed(1);
        const ratingData = calculateGameRating();

        body.innerHTML = `
            <div class="game-over-result">
                <div class="result-icon">💔</div>
                <div class="result-title lose">90天期限已到,还有模拟器未授权</div>
                <div class="result-stats-final">
                    <div class="result-stat">
                        <div class="label">总销量</div>
                        <div class="value">${formatNumber(GameState.totalSold)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">完成率</div>
                        <div class="value">${completionRate}%</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">剩余库存</div>
                        <div class="value">${formatNumber(remaining)}</div>
                    </div>
                    <div class="result-stat">
                        <div class="label">最终资金</div>
                        <div class="value">${formatMoney(GameState.money)}</div>
                    </div>
                </div>
                <div style="font-size: 2rem; margin: 20px 0;">
                    评级: <strong style="color: var(--text-secondary); font-size: 3rem;">${ratingData.rating}</strong>
                    <div style="font-size: 1.2rem; color: var(--text-secondary); margin-top: 5px;">
                        综合得分: ${ratingData.score} 分
                    </div>
                </div>
                <p style="margin-top: 20px; color: var(--text-secondary);">
                    别灰心! 调整策略再来一次吧!
                </p>
            </div>
        `;
    }

    modal.style.display = 'flex';

    // 清除存档
    localStorage.removeItem('simulatorSimulatorSave');
}

// ==================== 研究升级系统 ====================

/**
 * 获取所有已购买升级的综合效果
 */
function getUpgradeBonuses() {
    const bonuses = {
        salesMultiplier: 0,
        weeklySimulatorMultiplier: 1,
        experimentCostReduction: 0,
        cultureCooldownReduction: 0,
        cultureYieldBonus: 0,
        experimentLevelMultiplier: 1,
        labGlobalBonus: 0,
        passiveSalesFrequency: 0,
        marketingEffectiveness: 0,
        maxPriceIncrease: 0,
        reputationGain: 0,
        shopRevenueBonus: 0,
        globalBonus: 0
    };
    
    GameState.researchUpgrades.forEach(upgradeId => {
        const upgrade = CONFIG.RESEARCH_UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;
        
        const effect = upgrade.effect;
        switch (effect.type) {
            case 'sales_multiplier':
                bonuses.salesMultiplier += effect.value;
                break;
            case 'weekly_simulator_multiplier':
                bonuses.weeklySimulatorMultiplier *= effect.value;
                break;
            case 'experiment_cost_reduction':
                bonuses.experimentCostReduction += effect.value;
                break;
            case 'culture_cooldown_reduction':
                bonuses.cultureCooldownReduction += effect.value;
                break;
            case 'culture_yield_bonus':
                bonuses.cultureYieldBonus += effect.value;
                break;
            case 'experiment_level_multiplier':
                bonuses.experimentLevelMultiplier *= effect.value;
                break;
            case 'lab_global_bonus':
                bonuses.labGlobalBonus += effect.value;
                break;
            case 'passive_sales_frequency':
                bonuses.passiveSalesFrequency += effect.value;
                break;
            case 'marketing_effectiveness':
                bonuses.marketingEffectiveness += effect.value;
                break;
            case 'max_price_increase':
                bonuses.maxPriceIncrease += effect.value;
                break;
            case 'reputation_gain':
                bonuses.reputationGain += effect.value;
                break;
            case 'shop_revenue_bonus':
                bonuses.shopRevenueBonus += effect.value;
                break;
            case 'global_bonus':
                bonuses.globalBonus += effect.value;
                break;
        }
    });
    
    return bonuses;
}

/**
 * 渲染研究升级列表
 */
function renderResearchUpgrades(filter = 'all') {
    const container = document.getElementById('upgrades-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    CONFIG.RESEARCH_UPGRADES.forEach(upgrade => {
        // 根据分类过滤
        let shouldShow = false;
        if (filter === 'all') {
            shouldShow = true;
        } else if (filter === 'sales' && upgrade.id.startsWith('sales_boost_')) {
            shouldShow = true;
        } else if (filter === 'simulator' && upgrade.id.startsWith('weekly_simulator_')) {
            shouldShow = true;
        } else if (filter === 'lab' && upgrade.id.startsWith('lab_efficiency_')) {
            shouldShow = true;
        } else if (filter === 'other' && !upgrade.id.startsWith('sales_boost_') && 
                   !upgrade.id.startsWith('weekly_simulator_') && 
                   !upgrade.id.startsWith('lab_efficiency_')) {
            shouldShow = true;
        }
        
        if (!shouldShow) return;
        
        const isPurchased = GameState.researchUpgrades.includes(upgrade.id);
        const canAfford = GameState.techPoints >= upgrade.cost;
        
        const card = document.createElement('div');
        card.className = `upgrade-card ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'locked' : ''}`;
        
        card.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-cost">💎 ${upgrade.cost}</span>
            </div>
            <div class="upgrade-description">${upgrade.description}</div>
            ${isPurchased 
                ? '<span class="upgrade-status purchased">✓ 已解锁</span>'
                : `<button class="btn btn-primary btn-small" onclick="purchaseUpgrade('${upgrade.id}')" ${!canAfford ? 'disabled' : ''}>
                     ${canAfford ? '购买升级' : '研究点数不足'}
                   </button>`
            }
        `;
        
        container.appendChild(card);
    });
}

/**
 * 购买研究升级
 */
function purchaseUpgrade(upgradeId) {
    const upgrade = CONFIG.RESEARCH_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) {
        alert('无效的升级ID!');
        return;
    }
    
    if (GameState.researchUpgrades.includes(upgradeId)) {
        alert('你已经购买过这个升级了!');
        return;
    }
    
    if (GameState.techPoints < upgrade.cost) {
        alert(`研究点数不足!需要 ${upgrade.cost} 点`);
        return;
    }
    
    const confirmMsg = `确认购买升级 "${upgrade.name}"？\n\n` +
                      `消耗: ${upgrade.cost} 点研究点数\n` +
                      `效果: ${upgrade.description}`;
    
    if (!window.confirm(confirmMsg)) return;
    
    // 扣除研究点数并记录升级
    GameState.techPoints -= upgrade.cost;
    GameState.researchUpgrades.push(upgradeId);
    
    addLog(`🔬 成功购买升级: ${upgrade.name}!`, 'positive');
    
    // 应用升级效果
    applyUpgradeEffect(upgrade);
    
    // 重新渲染列表
    renderResearchUpgrades();
    updateUI();
    saveGame();
}

/**
 * 应用升级效果到游戏逻辑
 */
function applyUpgradeEffect(upgrade) {
    const effect = upgrade.effect;
    
    switch (effect.type) {
        case 'cost_price_reduction':
            // 直接修改成本价
            GameState.costPrice = Math.max(0.1, GameState.costPrice - effect.value);
            break;
        // 其他效果在计算时动态应用，不需要立即处理
    }
}

/**
 * 初始化研究升级筛选器
 */
function initResearchUpgradeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) {
        console.log('筛选按钮未找到，跳过初始化');
        return;
    }
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            filterButtons.forEach(b => b.classList.remove('active'));
            // 激活当前按钮
            btn.classList.add('active');
            // 渲染对应分类
            const filter = btn.dataset.filter;
            renderResearchUpgrades(filter);
        });
    });
    
    console.log(`研究升级筛选器已初始化，共 ${filterButtons.length} 个按钮`);
}

/**
 * 一键购买营销（从低到高自动购买）
 */
function buyAllMarketing() {
    // 获取所有营销选项并按成本排序
    const marketingList = Object.entries(CONFIG.MARKETING_OPTIONS)
        .map(([type, config]) => ({ type, ...config }))
        .filter(item => GameState.day >= item.unlockDay) // 只考虑已解锁的
        .sort((a, b) => a.cost - b.cost); // 按成本从低到高排序
    
    if (marketingList.length === 0) {
        alert('当前没有可购买的营销项目！');
        return;
    }
    
    let purchasedCount = 0;
    let totalSpent = 0;
    let skippedCount = 0;
    let purchasedNames = [];
    
    for (const item of marketingList) {
        // 检查是否已经购买
        const existingEffect = GameState.activeMarketing.find(effect => effect.type === item.type);
        if (existingEffect) {
            skippedCount++;
            continue; // 跳过已购买的
        }
        
        // 检查资金是否足够
        if (GameState.money < item.cost) {
            // 资金不足，停止购买
            break;
        }
        
        // 购买该营销项目
        GameState.money -= item.cost;
        GameState.activeMarketing.push({
            type: item.type,
            daysLeft: item.duration,
            salesBonus: item.salesBonus,
            reputationBonus: item.reputationBonus
        });
        
        purchasedCount++;
        totalSpent += item.cost;
        purchasedNames.push(item.name);
    }
    
    // 显示购买结果
    let message = `🛒 一键购买完成！\n\n`;
    message += `✅ 成功购买: ${purchasedCount} 项\n`;
    message += `💰 总花费: ¥${totalSpent.toLocaleString()}\n`;
    
    if (purchasedNames.length > 0) {
        message += `\n已购买项目:\n• ${purchasedNames.join('\n• ')}\n`;
    }
    
    if (skippedCount > 0) {
        message += `\n⏭️ 跳过已购买: ${skippedCount} 项`;
    }
    
    // 检查是否有因资金不足而未购买的
    const remainingCount = marketingList.length - purchasedCount - skippedCount;
    if (remainingCount > 0) {
        message += `\n⚠️ 资金不足未购买: ${remainingCount} 项`;
    }
    
    alert(message);
    
    // 更新UI和保存
    updateUI();
    saveGame();
    
    addLog(`🛒 一键购买了 ${purchasedCount} 项营销，花费 ¥${totalSpent.toLocaleString()}`, 'positive');
}

// ==================== 模拟器学术研究院系统 ====================

/**
 * 从业务升级页面解锁模拟器学术研究院
 */
function unlockAcademyFromUpgrade() {
    if (GameState.academy.unlocked) {
        alert('研究院院已经解锁了！');
        return;
    }
    
    // 检查前置条件：实验室等级>=3
    if (GameState.restaurantLevel < 3) {
        alert('需要先升级到高等模拟器实验室才能解锁模拟器学术研究院！');
        return;
    }
    
    if (GameState.money < CONFIG.ACADEMY_UNLOCK_COST) {
        alert(`资金不足！需要 ${formatMoney(CONFIG.ACADEMY_UNLOCK_COST)} 才能解锁模拟器学术研究院`);
        return;
    }
    
    const confirm = window.confirm(
        `确定要解锁模拟器学术研究院吗？\n\n` +
        `• 消耗: ${formatMoney(CONFIG.ACADEMY_UNLOCK_COST)}\n` +
        `• 解锁: 投入模拟器作学术样本获得学术积分\n` +
        `• 解锁: 学术研究院兑换强力物品\n` +
        `• 解锁: 销售中心新增"模拟器学术研究院"子页面`
    );
    
    if (!confirm) return;
    
    GameState.money -= CONFIG.ACADEMY_UNLOCK_COST;
    GameState.academy.unlocked = true;
    GameState.academy.divinePoints = 0;
    
    addLog('🎓 成功解锁模拟器学术研究院！', 'positive');
    addLog('✨ 销售中心已新增"模拟器学术研究院"子页面', 'positive');
    updateUI();
    saveGame();
}

/**
 * 更新供奉数量显示
 */
function updateSacrificeAmount(value) {
    const display = document.getElementById('sacrifice-amount-display');
    if (display) {
        display.textContent = formatNumber(parseInt(value));
    }
    GameState.academy.sacrificeAmount = parseInt(value);
}

/**
 * 投入模拟器作学术样本
 */
function sacrificeSimulator() {
    if (!GameState.academy.unlocked) {
        alert('需要先解锁模拟器学术研究院才能供奉！');
        return;
    }
    
    const amount = GameState.academy.sacrificeAmount;
    const pointsGained = Math.floor(amount / 10000);
    
    if (GameState.inventory < amount) {
        alert(`模拟器不足！需要 ${formatNumber(amount)} 个`);
        return;
    }
    
    const confirm = window.confirm(
        `确定要投入模拟器作学术样本吗？\n\n` +
        `• 消耗: ${formatNumber(amount)} 个模拟器\n` +
        `• 获得: ${pointsGained} 点学术积分`
    );
    
    if (!confirm) return;
    
    GameState.inventory -= amount;
    GameState.academy.divinePoints += pointsGained;
    
    addLog(`⚡ 供奉完成！获得 ${pointsGained} 点学术积分`, 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换模拟器
 */
function exchangeSimulator() {
    const cost = 5;
    if (GameState.academy.divinePoints < cost) {
        alert(`学术积分不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 学术积分兑换 100,000 个模拟器？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    GameState.inventory += 100000;
    
    addLog('🎮 兑换成功！获得 100,000 个模拟器', 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换资金
 */
function exchangeMoney() {
    const cost = 10;
    if (GameState.academy.divinePoints < cost) {
        alert(`学术积分不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 学术积分兑换 ¥1,000,000？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    GameState.money += 1000000;
    
    addLog('💰 兑换成功！获得 ¥1,000,000', 'positive');
    updateUI();
    saveGame();
}

/**
 * 兑换销量加成
 */
function exchangeSalesBonus() {
    const cost = 20;
    if (GameState.academy.divinePoints < cost) {
        alert(`学术积分不足！需要 ${cost} 点`);
        return;
    }
    
    const confirm = window.confirm(`消耗 ${cost} 学术积分获得永久销量 +10%？`);
    if (!confirm) return;
    
    GameState.academy.divinePoints -= cost;
    
    // 添加永久销量加成标记
    if (!GameState.academy.salesBonus) {
        GameState.academy.salesBonus = 0;
    }
    GameState.academy.salesBonus += 0.10;
    
    addLog('📈 兑换成功！获得永久销量 +10%', 'positive');
    updateUI();
    saveGame();
}

/**
 * 更新学术研究院UI显示
 */
function updateAcademyUI() {
    const lockedDiv = document.getElementById('academy-locked');
    const unlockedDiv = document.getElementById('academy-unlocked');
    const divinePointsDisplay = document.getElementById('divine-points-display');
    
    if (!lockedDiv || !unlockedDiv) return;
    
    if (GameState.academy.unlocked) {
        lockedDiv.style.display = 'none';
        unlockedDiv.style.display = 'block';
        
        // 更新学术积分显示
        if (divinePointsDisplay) {
            divinePointsDisplay.textContent = GameState.academy.divinePoints;
        }
        
        // 更新滑块值
        const sacrificeSlider = document.getElementById('sacrifice-slider');
        if (sacrificeSlider) {
            sacrificeSlider.value = GameState.academy.sacrificeAmount;
        }
        const sacrificeAmountDisplay = document.getElementById('sacrifice-amount-display');
        if (sacrificeAmountDisplay) {
            sacrificeAmountDisplay.textContent = formatNumber(GameState.academy.sacrificeAmount);
        }
    } else {
        lockedDiv.style.display = 'block';
        unlockedDiv.style.display = 'none';
    }
}

// ==================== 存档系统 ====================
function saveGame() {
    if (GameState.isGameOver) {
        return;
    }

    const saveData = {
        inventory: GameState.inventory,
        money: GameState.money,
        reputation: GameState.reputation,
        day: GameState.day,
        totalSold: GameState.totalSold,
        currentPrice: GameState.currentPrice,
        activeMarketing: GameState.activeMarketing,
        ownedShops: GameState.ownedShops,
        completedEvents: GameState.completedEvents,
        weather: GameState.weather,
        specialEffects: GameState.specialEffects,
        // 无尽模式状态
        endlessMode: GameState.endlessMode,
        contractSigned: GameState.contractSigned,
        contractDay: GameState.contractDay,
        nextDeliveryDay: GameState.nextDeliveryDay,
        stockoutDays: GameState.stockoutDays,
        todayPurchase: GameState.todayPurchase,
        codeRedeemed: GameState.codeRedeemed,
        // 升级系统状态
        restaurantLevel: GameState.restaurantLevel,
        canUpgradeToRestaurant: GameState.canUpgradeToRestaurant,
        cannedProduction: GameState.cannedProduction,
        // 实验室系统状态
        labProduction: GameState.labProduction,
        // 研究点数系统
        techPoints: GameState.techPoints,
        researchUpgrades: GameState.researchUpgrades,
        // 模拟器学术研究院系统
        academy: GameState.academy,
        // 自定义比赛系统
        customEvent: GameState.customEvent,
        // 玩家信息
        playerName: GameState.playerName,
        gameTitle: GameState.gameTitle,
        // 股票市场系统
        stockMarket: GameState.stockMarket,
        // 成就系统
        achievements: GameState.achievements,
        // 收集系统
        collections: GameState.collections,
        // 皮肤系统
        currentSkin: GameState.currentSkin,
        unlockedSkins: GameState.unlockedSkins,
        // 客户系统
        customers: GameState.customers,
        // 社区论坛系统
        community: GameState.community
    };

    localStorage.setItem('simulatorSimulatorSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = localStorage.getItem('simulatorSimulatorSave');
    if (!saveData) {
        return false;
    }

    try {
        const data = JSON.parse(saveData);

        GameState.inventory = data.inventory;
        GameState.money = data.money;
        GameState.reputation = data.reputation;
        GameState.day = data.day;
        GameState.totalSold = data.totalSold;
        GameState.currentPrice = data.currentPrice;
        GameState.activeMarketing = data.activeMarketing || [];
        GameState.ownedShops = data.ownedShops || [];
        GameState.completedEvents = data.completedEvents || [];
        GameState.weather = data.weather || 'sunny';
        GameState.specialEffects = data.specialEffects || {
            qualityLabel: false,
            newRecipe: false,
            competitorDebuff: 0
        };
        // 加载无尽模式状态
        GameState.endlessMode = data.endlessMode || false;
        GameState.contractSigned = data.contractSigned || false;
        GameState.contractDay = data.contractDay || 0;
        GameState.nextDeliveryDay = data.nextDeliveryDay || 0;
        GameState.stockoutDays = data.stockoutDays || 0;
        GameState.todayPurchase = data.todayPurchase || 0;
        GameState.codeRedeemed = data.codeRedeemed || false;

        // 加载升级系统状态
        GameState.restaurantLevel = data.restaurantLevel || 0;
        GameState.canUpgradeToRestaurant = data.canUpgradeToRestaurant || false;
        GameState.cannedProduction = data.cannedProduction || {
            enabled: false,
            simulatorsPerCan: 1
        };

        // 加载实验室系统状态
        GameState.labProduction = data.labProduction || {
            enabled: false,
            experimentAmount: 1000,
            cultureAmount: 1000
        };

        // 加载研究点数系统
        GameState.techPoints = data.techPoints || 0;
        GameState.researchUpgrades = data.researchUpgrades || [];

        // 加载模拟器学术研究院系统
        GameState.academy = data.academy || {
            unlocked: false,
            divinePoints: 0,
            sacrificeAmount: 10000,
            salesBonus: 0
        };

        // 加载自定义比赛系统
        GameState.customEvent = data.customEvent || null;

        // 加载玩家信息
        GameState.playerName = data.playerName || '';
        GameState.gameTitle = data.gameTitle || '模拟器模拟器';

        // 加载游戏结束状态（如果存在）
        GameState.isGameOver = data.isGameOver || false;
        GameState.gameWon = data.gameWon || false;

        // 加载股票市场系统
        if (data.stockMarket) {
            GameState.stockMarket = { ...GameState.stockMarket, ...data.stockMarket };
        }

        // 加载成就系统
        if (data.achievements) {
            GameState.achievements = { ...GameState.achievements, ...data.achievements };
        } else {
            GameState.achievements = { unlocked: [], lastCheckDay: 0 };
        }

        // 加载收集系统
        if (data.collections) {
            GameState.collections = { ...GameState.collections, ...data.collections };
        } else {
            GameState.collections = { letters: [], trophies: [], souvenirs: [] };
        }

        // 加载皮肤系统
        if (data.currentSkin) {
            GameState.currentSkin = data.currentSkin;
        }
        if (data.unlockedSkins && Array.isArray(data.unlockedSkins)) {
            GameState.unlockedSkins = data.unlockedSkins;
        } else {
            GameState.unlockedSkins = ['default'];
        }

        // 加载客户系统
        if (data.customers) {
            GameState.customers = { ...GameState.customers, ...data.customers };
        } else {
            GameState.customers = {
                relationships: {},
                todaySpecialCustomer: null,
                wordOfMouthBonus: 0
            };
        }

        // 加载社区论坛系统
        if (data.community) {
            GameState.community = data.community;
        } else {
            initCommunityForum();
        }

        return true;
    } catch (e) {
        console.error('加载存档失败:', e);
        return false;
    }
}

// ==================== 存档加密/解密系统 ====================

/**
 * 加密存档数据
 * 使用多层加密：JSON序列化 -> Base64编码 -> 自定义混淆
 */
function encryptSaveData(saveData) {
    try {
        // 第1层：Base64编码
        let encoded = btoa(unescape(encodeURIComponent(saveData)));
        
        // 第2层：添加校验和
        const checksum = simpleChecksum(saveData);
        encoded = checksum + '|' + encoded;
        
        // 第3层：字符替换加密（凯撒密码变种）
        let encrypted = '';
        for (let i = 0; i < encoded.length; i++) {
            const charCode = encoded.charCodeAt(i);
            // 对每个字符进行位移（位移量为位置索引的函数）
            const shift = (i % 7) + 3;
            encrypted += String.fromCharCode(charCode + shift);
        }
        
        // 第4层：添加魔法头和版本标识
        const magicHeader = 'CGBV1|'; // Simulator Save v1
        return magicHeader + encrypted;
    } catch (error) {
        console.error('加密失败:', error);
        return null;
    }
}

/**
 * 解密存档数据
 */
function decryptSaveData(encryptedData) {
    try {
        // 验证魔法头和版本
        if (!encryptedData.startsWith('CGBV1|')) {
            console.warn('不是有效的加密存档格式');
            return null;
        }
        
        // 移除魔法头
        let encrypted = encryptedData.substring(6);
        
        // 第3层逆向：字符替换解密
        let decoded = '';
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i);
            const shift = (i % 7) + 3;
            decoded += String.fromCharCode(charCode - shift);
        }
        
        // 第2层逆向：分离校验和
        const parts = decoded.split('|');
        if (parts.length !== 2) {
            console.warn('存档格式错误');
            return null;
        }
        
        const storedChecksum = parts[0];
        const base64Data = parts[1];
        
        // 第1层逆向：Base64解码
        const decryptedData = decodeURIComponent(escape(atob(base64Data)));
        
        // 验证校验和
        const calculatedChecksum = simpleChecksum(decryptedData);
        if (storedChecksum !== calculatedChecksum) {
            console.warn('校验和失败，存档可能已损坏或被篡改');
            return null;
        }
        
        return decryptedData;
    } catch (error) {
        console.error('解密失败:', error);
        return null;
    }
}

/**
 * 计算简单校验和（用于检测数据完整性）
 */
function simpleChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum = ((sum << 5) - sum + data.charCodeAt(i)) | 0;
    }
    return Math.abs(sum).toString(36);
}

// ==================== 导出存档功能 ====================
function exportSave() {
    try {
        const saveData = localStorage.getItem('simulatorSimulatorSave');
        if (!saveData) {
            alert('当前没有存档可导出!');
            return;
        }

        // 加密存档数据
        const encryptedData = encryptSaveData(saveData);
        if (!encryptedData) {
            alert('加密失败，无法导出存档!');
            return;
        }

        console.log('导出加密存档数据');

        // 创建加密的Blob对象
        const blob = new Blob([encryptedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulator-save-day${GameState.day}-encrypted.json`;
        document.body.appendChild(a);
        a.click();
        
        // 延迟移除元素
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        addLog('🔐 存档已加密导出!', 'positive');
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败! 错误信息: ' + error.message);
    }
}

// ==================== 导入存档功能 ====================
function importSave(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 只接受加密的JSON文件
    if (!file.name.endsWith('.json')) {
        alert('请选择加密的存档文件(.json格式)!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const encryptedData = e.target.result.trim();
            
            // 尝试验证是否为加密格式
            if (!encryptedData.startsWith('CGBV1|')) {
                alert('❌ 导入失败！\n\n该文件不是有效的加密存档。\n\n注意：系统现在只接受加密后的存档文件，请使用最新版本的导出功能重新导出存档。');
                event.target.value = '';
                return;
            }
            
            // 解密存档
            const decryptedData = decryptSaveData(encryptedData);
            if (!decryptedData) {
                alert('❌ 解密失败！\n\n存档可能已损坏或使用了错误的密钥。\n\n请确保：\n• 文件未被修改\n• 使用的是同一游戏版本');
                event.target.value = '';
                return;
            }
            
            // 验证JSON格式
            const data = JSON.parse(decryptedData);

            // 确认导入
            const confirm = window.confirm(
                `确定要导入这个加密存档吗?\n\n` +
                `• 存档天数: 第${data.day}天\n` +
                `• 当前资金: ¥${formatMoney(data.money)}\n` +
                `• 总销量: ${formatNumber(data.totalSold)}\n\n` +
                `⚠️ 导入后将覆盖当前进度!`
            );

            if (!confirm) {
                event.target.value = '';
                return;
            }

            // 保存解密后的原始数据到localStorage
            localStorage.setItem('simulatorSimulatorSave', decryptedData);
            
            console.log('加密存档导入成功！');

            // 重新加载游戏
            location.reload();
        } catch (error) {
            console.error('导入失败:', error);
            alert('❌ 导入失败！\n\n存档文件可能已损坏或格式不正确。\n\n错误信息: ' + error.message);
            event.target.value = '';
        }
    };
    
    reader.onerror = function(error) {
        console.error('文件读取失败:', error);
        alert('文件读取失败！请重试。');
        event.target.value = '';
    };

    reader.readAsText(file);
}

// ==================== 初始化游戏 ====================
function initGame() {
    // 尝试加载存档
    const loaded = loadGame();

    if (!loaded) {
        // 新游戏,重置状态
        resetGameState();

        // 显示取名弹窗
        showNameInputDialog();
    } else {
        // 如果加载的游戏是结束状态，自动重新开始
        if (GameState.isGameOver) {
            addLog('检测到上次游戏已结束，开始新游戏', 'neutral');
            resetGameState();
            showNameInputDialog();
        } else {
            // 加载存档后更新标题
            updateGameTitle();
            addLog('已加载上次的游戏进度', 'neutral');
        }
    }

    // 绑定事件监听器
    bindEventListeners();

    // 初始UI更新
    updateUI();
    
    // 应用当前皮肤
    applyCurrentSkin();
    
    // 初始化社区论坛
    initCommunityForum();
}

function resetGameState() {
    GameState.inventory = CONFIG.INITIAL_INVENTORY;
    GameState.money = CONFIG.INITIAL_MONEY;
    GameState.reputation = CONFIG.INITIAL_REPUTATION;
    GameState.day = 1;
    GameState.totalSold = 0;
    GameState.costPrice = CONFIG.COST_PRICE;
    GameState.currentPrice = CONFIG.BASE_PRICE;
    GameState.activeMarketing = [];
    GameState.ownedShops = [];
    GameState.completedEvents = [];
    GameState.weather = 'sunny';
    GameState.specialEffects = {
        qualityLabel: false,
        newRecipe: false,
        competitorDebuff: 0
    };
    GameState.todaySales = {
        session1: { quantity: 0, revenue: 0, hasSold: false },
        session2: { quantity: 0, revenue: 0, hasSold: false },
        currentSession: 0
    };
    GameState.salesTimer = {
        isWaiting: false,
        timeLeft: 0,
        timerId: null
    };
    // 重置无尽模式状态
    GameState.endlessMode = false;
    GameState.contractSigned = false;
    GameState.contractDay = 0;
    GameState.nextDeliveryDay = 0;
    GameState.stockoutDays = 0;
    GameState.todayPurchase = 0;
    GameState.isGameOver = false;
    GameState.gameWon = false;
    GameState.codeRedeemed = false;

    // 重置玩家信息
    GameState.playerName = '';
    GameState.gameTitle = '模拟器模拟器';

    // 重置升级系统状态
    GameState.restaurantLevel = 0;
    GameState.canUpgradeToRestaurant = false;
    GameState.cannedProduction = {
        enabled: false,
        simulatorsPerCan: 1
    };
    
    // 重置实验室系统状态
    GameState.labProduction = {
        enabled: false,
        experimentAmount: 1000,
        cultureAmount: 1000,
        experimentLevel: 0,
        lastCultureDay: 0
    };
    
    // 重置研究点数系统
    GameState.techPoints = 0;
    GameState.researchUpgrades = [];

    // 重置模拟器学术研究院系统
    GameState.academy = {
        unlocked: false,
        divinePoints: 0,
        sacrificeAmount: 10000,
        salesBonus: 0
    };

    // 重置自定义比赛系统
    GameState.customEvent = null;

    // 重置股票市场系统
    GameState.stockMarket = {
        unlocked: false,
        totalAssets: 0,
        todayProfit: 0,
        holdings: {}
    };

    // 重置成就系统
    GameState.achievements = {
        unlocked: [],
        lastCheckDay: 0
    };

    // 重置收集系统（保留收集品）
    if (!GameState.collections) {
        GameState.collections = { letters: [], trophies: [], souvenirs: [] };
    }

    // 重置皮肤系统
    GameState.currentSkin = 'default';
    GameState.unlockedSkins = ['default'];

    // 重置客户系统
    GameState.customers = {
        relationships: {},
        todaySpecialCustomer: null,
        wordOfMouthBonus: 0
    };

    // 重置社区论坛系统
    GameState.community = null;

    // 重置产品包生产设置
    GameState.cannedProduction = {
        enabled: false,
        dailyInput: 1000,
        simulatorsPerCan: 1,
        pricePerCan: 5
    };

    // 重置价格滑块
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        priceSlider.value = CONFIG.BASE_PRICE;
    }

    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay) {
        priceDisplay.textContent = CONFIG.BASE_PRICE;
    }

    // 重置促销选项
    const promoBogo = document.getElementById('promo-bogo');
    if (promoBogo) promoBogo.checked = false;

    const promoDiscount = document.getElementById('promo-discount');
    if (promoDiscount) promoDiscount.checked = false;

    const promoBundle = document.getElementById('promo-bundle');
    if (promoBundle) promoBundle.checked = false;

    // 重置销售按钮
    const salesBtn = document.getElementById('start-sales-btn');
    if (salesBtn) {
        salesBtn.disabled = false;
        salesBtn.textContent = '开始第1次销售';
    }
}

// ==================== 事件监听器绑定 ====================
function bindEventListeners() {
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 激活当前标签
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // 如果切换到市场营销标签页，重新渲染
            if (tabId === 'marketing') {
                updateMarketingOptions();
            }
        });
    });

    // 销售中心子标签页切换
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有激活状态
            document.querySelectorAll('.sub-tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'white';
                b.style.color = 'var(--text)';
            });
            document.querySelectorAll('.sub-tab-content').forEach(c => c.style.display = 'none');

            // 激活当前子标签
            btn.classList.add('active');
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            const subtabId = btn.dataset.subtab;
            document.getElementById(`subtab-${subtabId}`).style.display = 'block';
            
            // 如果切换到研究升级页面，动态渲染升级列表
            if (subtabId === 'research-upgrades') {
                renderResearchUpgrades();
                // 更新研究点数显示
                const upgradeTechPoints = document.getElementById('upgrade-tech-points');
                if (upgradeTechPoints) {
                    upgradeTechPoints.textContent = formatNumber(GameState.techPoints);
                }
            }
            
            // 如果切换到学术研究院页面，更新UI
            if (subtabId === 'academy') {
                updateAcademyUI();
            }
        });
    });

    // 价格滑块
    const priceSlider = document.getElementById('price-slider');
    priceSlider.addEventListener('input', (e) => {
        GameState.currentPrice = parseInt(e.target.value);
        document.getElementById('price-display').textContent = GameState.currentPrice;

        // 根据餐馆等级检查价格限制(违法上限为最高定价的99%)
        const maxPrice = GameState.restaurantLevel >= 1 ? CONFIG.RESTAURANT_MAX_PRICE : 15;
        const illegalPriceThreshold = Math.floor(maxPrice * 0.99);
        if (GameState.currentPrice > illegalPriceThreshold) {
            const priceDisplay = document.getElementById('price-display');
            priceDisplay.style.color = 'var(--error)';
            priceDisplay.textContent = `${GameState.currentPrice} ⚠️`;
        } else {
            const priceDisplay = document.getElementById('price-display');
            priceDisplay.style.color = '';
        }

        updateEstimatedSales();
    });

    // 促销选项
    document.getElementById('promo-bogo').addEventListener('change', (e) => {
        GameState.promotions.bogo = e.target.checked;
        updateEstimatedSales();
    });

    document.getElementById('promo-discount').addEventListener('change', (e) => {
        GameState.promotions.discount = e.target.checked;
        updateEstimatedSales();
    });

    document.getElementById('promo-bundle').addEventListener('change', (e) => {
        GameState.promotions.bundle = e.target.checked;
        updateEstimatedSales();
    });

    // 开始销售按钮
    document.getElementById('start-sales-btn').addEventListener('click', () => {
        executeSales();
    });

    // 下一天按钮
    document.getElementById('next-day-btn').addEventListener('click', () => {
        nextDay();
    });

    // 购买广告按钮
    document.querySelectorAll('.buy-ad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const marketingItem = btn.closest('.marketing-item');
            const type = marketingItem.dataset.type;
            buyMarketing(type);
        });
    });

    // 弹窗关闭按钮
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-modal').style.display = 'none';
        resetGameState();
        updateUI();
        addLog('新游戏开始!', 'neutral');
    });
}

// ==================== 辅助函数 ====================
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==================== 兑换码系统 ====================
function redeemCode() {
    const input = prompt('请输入兑换码:');
    if (!input) return;

    const code = input.trim();

    if (code === 'CHM is big SB') {
        if (GameState.codeRedeemed) {
            alert('你已经使用过兑换码了!每次游戏只能使用一次。');
            return;
        }
        GameState.codeRedeemed = true;
        GameState.inventory += 100000;
        addLog('🎁 兑换码成功! 获得 100,000 个模拟器!', 'positive');
        updateUI();
        saveGame();
    } else if (code === 'something for nothing') {
        // 作弊码：获得20亿资金、100万个模拟器，并设置为第75天
        GameState.money = 2000000000;
        GameState.inventory = 1000000;
        GameState.day = 75;
        
        // 重置今日销售状态，确保可以正常销售
        GameState.todaySales.session1.hasSold = false;
        GameState.todaySales.session2.hasSold = false;
        GameState.todaySales.currentSession = 0;
        
        // 清除销售计时器
        if (GameState.salesTimer.timerId) {
            clearInterval(GameState.salesTimer.timerId);
            GameState.salesTimer.timerId = null;
        }
        GameState.salesTimer.isWaiting = false;
        GameState.salesTimer.timeLeft = 0;
        
        addLog('💰 作弊码激活! 获得 2,000,000,000 资金和 1,000,000 个模拟器，时间设为第75天!', 'positive');
        updateUI();
        saveGame();
    } else if (code === 'I can walk') {
        // 超级作弊码：获得1兆资金
        GameState.money += 1000000000000;
        addLog('💎 超级作弊码激活! 获得 1,000,000,000,000 资金(1兆)!', 'positive');
        updateUI();
        saveGame();
    } else if (code === 'AKIOI') {
        // AKIOI兑换码：获得50,000个模拟器和20,000经费
        GameState.inventory += 50000;
        GameState.money += 20000;
        addLog('🎁 AKIOI兑换码成功! 获得 50,000 个模拟器和 ¥20,000 经费!', 'positive');
        updateUI();
        saveGame();
    } else {
        alert('无效的兑换码!');
    }
}

// ==================== 评分系统 ====================
function calculateGameRating() {
    const daysUsed = GameState.day;
    const totalSold = GameState.totalSold;
    const finalMoney = GameState.money;
    const finalReputation = GameState.reputation;

    // 基础评分(基于完成速度)
    let rating = 'C';
    let score = 0;

    if (daysUsed <= 30) {
        rating = 'S';
        score = 100;
    } else if (daysUsed <= 45) {
        rating = 'A';
        score = 85;
    } else if (daysUsed <= 60) {
        rating = 'B';
        score = 70;
    } else if (daysUsed <= 75) {
        rating = 'C';
        score = 55;
    } else {
        rating = 'D';
        score = 40;
    }

    // 资金加成
    if (finalMoney >= 100000) score += 15;
    else if (finalMoney >= 50000) score += 10;
    else if (finalMoney >= 20000) score += 5;

    // 声誉加成
    if (finalReputation >= 90) score += 10;
    else if (finalReputation >= 70) score += 5;

    // 总销量加成(无尽模式)
    if (totalSold >= 2000000) score += 10;
    else if (totalSold >= 1500000) score += 5;

    // 根据最终分数调整评级
    if (score >= 120) rating = 'S+';
    else if (score >= 100) rating = 'S';
    else if (score >= 85) rating = 'A';
    else if (score >= 70) rating = 'B';
    else if (score >= 55) rating = 'C';
    else rating = 'D';

    return { rating, score };
}

// ==================== 取名系统 ====================
function showNameInputDialog() {
    const name = prompt('欢迎来到模拟器模拟器!\n\n请输入你的角色名字:');

    if (name && name.trim()) {
        GameState.playerName = name.trim();

        // 彩蛋:如果名字是"杜子德",更改游戏名为"做干净的模拟器"
        if (GameState.playerName === '杜子德') {
            GameState.gameTitle = '做干净的模拟器';
            addLog('做干净的模拟器！', 'positive');
        } else {
            addLog(`欢迎你, ${GameState.playerName}!`, 'positive');
        }
    } else {
        // 默认名字
        GameState.playerName = '模拟器研究者';
        addLog('欢迎你, 模拟器研究者!', 'positive');
    }

    // 更新UI显示
    updateGameTitle();
    saveGame();
}

function updateGameTitle() {
    const titleElement = document.querySelector('.header-left h1');
    if (titleElement) {
        titleElement.textContent = `🎮 ${GameState.gameTitle}`;
    }

    // 同时更新网页标题
    document.title = `${GameState.gameTitle} - Simulator Simulator`;
}

// ==================== 升级系统 ====================
function checkRestaurantUpgrade() {
    // 售卖15天后且进入无尽模式时,可以升级为模拟器研发小组
    if (GameState.day >= CONFIG.RESTAURANT_UPGRADE_DAY &&
        GameState.endlessMode &&
        GameState.restaurantLevel === 0) {
        GameState.canUpgradeToRestaurant = true;
        addLog('🎉 恭喜!你现在可以升级为模拟器研发小组了!', 'positive');
        updateUI();
    }
}

function upgradeToRestaurant() {
    if (GameState.restaurantLevel > 0) {
        alert('你已经是研发小组等级了!');
        return;
    }

    if (!GameState.canUpgradeToRestaurant) {
        alert(`需要售卖至少${CONFIG.RESTAURANT_UPGRADE_DAY}天并进入无尽模式才能升级!`);
        return;
    }

    if (GameState.money < CONFIG.RESTAURANT_UPGRADE_COST) {
        alert(`资金不足!升级为工作室需要 ${formatMoney(CONFIG.RESTAURANT_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为模拟器研发小组吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.RESTAURANT_UPGRADE_COST)}\n` +
        `• 成本价增加到: ${formatMoney(CONFIG.RESTAURANT_COST_PRICE)}/个\n` +
        `• 最高定价提升到: ${formatMoney(CONFIG.RESTAURANT_MAX_PRICE)}/个\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.RESTAURANT_UPGRADE_COST;
    GameState.restaurantLevel = 1;
    GameState.costPrice = CONFIG.RESTAURANT_COST_PRICE;
    GameState.canUpgradeToRestaurant = false;

    addLog('🏪 成功升级为模拟器研发小组! 成本价和最高定价已提升!', 'positive');
    updateUI();
    saveGame();
}

function upgradeToFactory() {
    if (GameState.restaurantLevel !== 1) {
        alert('需要先升级为模拟器研发小组才能升级为模拟器研发中心!');
        return;
    }

    if (GameState.money < CONFIG.FACTORY_UPGRADE_COST) {
        alert(`资金不足!升级为模拟器研发中心需要 ${formatMoney(CONFIG.FACTORY_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为模拟器研发中心吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.FACTORY_UPGRADE_COST)}\n` +
        `• 解锁产品包生产功能\n` +
        `• 可以决定每个产品包中模拟器数量(0.1-10个)\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.FACTORY_UPGRADE_COST;
    GameState.restaurantLevel = 2;
    GameState.cannedProduction.enabled = true;
    GameState.cannedProduction.simulatorsPerCan = 1;

    addLog('🏭 成功升级为模拟器研发中心! 产品包生产功能已解锁!', 'positive');
    updateUI();
    saveGame();
}

function updateCannedProduction(value) {
    if (!GameState.cannedProduction.enabled) return;

    GameState.cannedProduction.simulatorsPerCan = parseFloat(value);
    document.getElementById('canned-simulators-display').textContent = value;
    
    // 更新预计收益显示
    updateCannedPreview();
}

function updateDailyInput(value) {
    if (!GameState.cannedProduction.enabled) return;

    GameState.cannedProduction.dailyInput = parseInt(value);
    document.getElementById('daily-input-display').textContent = formatNumber(GameState.cannedProduction.dailyInput);
    
    // 更新预计收益显示
    updateCannedPreview();
}

function updateCannedPreview() {
    const dailyInput = GameState.cannedProduction.dailyInput;
    const simulatorsPerCan = GameState.cannedProduction.simulatorsPerCan;
    const pricePerCan = GameState.cannedProduction.pricePerCan;
    
    const cansProduced = Math.floor(dailyInput / simulatorsPerCan);
    const revenue = cansProduced * pricePerCan;
    const cost = dailyInput * GameState.costPrice;
    const profit = revenue - cost;
    
    const previewEl = document.getElementById('canned-preview');
    if (previewEl) {
        previewEl.innerHTML = `
            <p>每日产出: <strong>${formatNumber(cansProduced)}</strong> 个产品包</p>
            <p>销售获得研发经费: <strong>${formatMoney(revenue)}</strong></p>
            <p>原料成本: <strong>${formatMoney(cost)}</strong></p>
            <p style="color: ${profit >= 0 ? 'var(--success)' : 'var(--error)'};">
                预计学术收益: <strong>${formatMoney(profit)}</strong>
            </p>
        `;
    }
}

// 执行产品包生产销售(每天自动调用)
function executeCannedProduction() {
    if (!GameState.cannedProduction.enabled) return 0;

    const dailyInput = GameState.cannedProduction.dailyInput;
    const simulatorsPerCan = GameState.cannedProduction.simulatorsPerCan;
    const pricePerCan = GameState.cannedProduction.pricePerCan;

    // 检查库存
    if (GameState.inventory < dailyInput) {
        addLog(`🥫 库存不足! 需要 ${formatNumber(dailyInput)} 个模拟器进行产品包生产`, 'negative');
        return 0;
    }

    // 计算产出
    const cansProduced = Math.floor(dailyInput / simulatorsPerCan);
    const revenue = cansProduced * pricePerCan;
    const cost = dailyInput * GameState.costPrice;
    const profit = revenue - cost;

    // 扣除原料
    GameState.inventory -= dailyInput;
    
    // 自动授权获得获得研发经费
    GameState.money += revenue;
    GameState.totalSold += cansProduced;

    addLog(`🥫 产品包生产完成: 投入${formatNumber(dailyInput)}个 → 产出${formatNumber(cansProduced)}个产品包 → 授权获得${formatMoney(revenue)} (学术收益:${formatMoney(profit)})`, 'positive');
    
    return profit;
}

// ==================== 实验室升级系统 ====================
function upgradeToLab() {
    if (GameState.restaurantLevel !== 2) {
        alert('需要先升级为模拟器研发中心才能升级为高等模拟器实验室!');
        return;
    }

    if (GameState.money < CONFIG.LAB_UPGRADE_COST) {
        alert(`资金不足!升级为高等模拟器实验室需要 ${formatMoney(CONFIG.LAB_UPGRADE_COST)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要升级为高等模拟器实验室吗?\n\n` +
        `• 消耗: ${formatMoney(CONFIG.LAB_UPGRADE_COST)}\n` +
        `• 解锁技术研究功能\n` +
        `• 解锁批量复制功能\n` +
        `• 可以通过实验提升购买能力\n` +
        `• 可以通过批量复制大量繁殖模拟器\n`
    );

    if (!confirm) return;

    GameState.money -= CONFIG.LAB_UPGRADE_COST;
    GameState.restaurantLevel = 3;
    GameState.labProduction.enabled = true;
    GameState.labProduction.experimentAmount = 1000;
    GameState.labProduction.cultureAmount = 1000;

    addLog('🧪 成功升级为高等模拟器实验室! 技术研究和批量复制功能已解锁!', 'positive');
    updateUI();
    saveGame();
}

function updateExperimentAmount(value) {
    if (!GameState.labProduction.enabled) return;

    GameState.labProduction.experimentAmount = parseInt(value);
    document.getElementById('experiment-amount-display').textContent = formatNumber(GameState.labProduction.experimentAmount);
}

function updateCultureAmount(value) {
    if (!GameState.labProduction.enabled) return;

    GameState.labProduction.cultureAmount = parseInt(value);
    document.getElementById('culture-amount-display').textContent = formatNumber(GameState.labProduction.cultureAmount);
    
    // 更新预计消耗和获得
    const a = GameState.labProduction.cultureAmount;
    const costSimulator = a;
    const costMoney = a * 10;
    const gain = a * 100;
    
    document.getElementById('culture-cost-simulator').textContent = formatNumber(costSimulator);
    document.getElementById('culture-cost-money').textContent = formatMoney(costMoney);
    document.getElementById('culture-gain').textContent = formatNumber(gain);
}

function executeExperiment() {
    if (!GameState.labProduction.enabled) {
        alert('需要先升级为高等模拟器实验室才能进行技术研究!');
        return;
    }
    
    const amount = parseInt(document.getElementById('experiment-slider').value);
    
    // 获取升级效果
    const bonuses = getUpgradeBonuses();
    const costReduction = bonuses.experimentCostReduction;
    const levelMultiplier = bonuses.experimentLevelMultiplier;
    
    // 计算实际消耗（可被升级减少）
    const moneyCost = (amount / 1000) * 100000 * (1 - costReduction);
    
    if (GameState.inventory < amount) {
        alert(`模拟器不足!需要 ${formatNumber(amount)} 个`);
        return;
    }
    
    if (GameState.money < moneyCost) {
        alert(`资金不足!需要 ${formatMoney(moneyCost)}`);
        return;
    }
    
    // 计算获得的研究点数
    const techPointsGained = amount / 1000;
    
    const confirmMsg = `确认进行技术研究？\n\n` +
                      `消耗: ${formatNumber(amount)} 个模拟器 + ${formatMoney(moneyCost)}\n` +
                      `获得: ${techPointsGained} 点研究点数`;
    
    if (!window.confirm(confirmMsg)) return;
    
    // 扣除资源
    GameState.inventory -= amount;
    GameState.money -= moneyCost;
    
    // 获得研究点数
    GameState.techPoints += techPointsGained;
    
    // 获得实验等级（可被升级倍增）
    const levelGain = amount * levelMultiplier;
    GameState.labProduction.experimentLevel += levelGain;
    
    addLog(`🔬 技术研究完成! 获得 ${techPointsGained} 点研究点数，实验等级提升 ${formatNumber(levelGain)}`, 'positive');
    updateUI();
    saveGame();
}

function executeCulture() {
    if (!GameState.labProduction.enabled) {
        alert('需要先升级为高等模拟器实验室才能使用批量复制!');
        return;
    }

    // 获取升级效果
    const bonuses = getUpgradeBonuses();
    const cooldownReduction = bonuses.cultureCooldownReduction;
    const yieldBonus = bonuses.cultureYieldBonus;
    
    // 检查冷却时间（基础10天，可被升级减少）
    const actualCooldown = Math.max(1, 10 - cooldownReduction);
    const daysSinceLastCulture = GameState.day - GameState.labProduction.lastCultureDay;
    if (GameState.labProduction.lastCultureDay > 0 && daysSinceLastCulture < actualCooldown) {
        const remainingDays = actualCooldown - daysSinceLastCulture;
        alert(`批量复制还在冷却中!还需等待 ${remainingDays} 天`);
        return;
    }

    const a = GameState.labProduction.cultureAmount;
    const costSimulator = a;
    const costMoney = a * 10;
    const gain = Math.floor(a * 100 * (1 + yieldBonus));

    if (GameState.inventory < costSimulator) {
        alert(`库存不足!需要 ${formatNumber(costSimulator)} 个模拟器`);
        return;
    }

    if (GameState.money < costMoney) {
        alert(`资金不足!需要 ${formatMoney(costMoney)}`);
        return;
    }

    const confirm = window.confirm(
        `确定要进行批量复制吗?\n\n` +
        `• 消耗: ${formatNumber(costSimulator)} 个模拟器 + ${formatMoney(costMoney)}\n` +
        `• 获得: ${formatNumber(gain)} 个模拟器\n` +
        `• 净收益: ${formatNumber(gain - costSimulator)} 个模拟器\n` +
        `• 冷却时间: ${actualCooldown}天\n`
    );

    if (!confirm) return;

    // 执行批量复制
    GameState.inventory -= costSimulator;
    GameState.money -= costMoney;
    GameState.inventory += gain;
    
    // 记录使用天数
    GameState.labProduction.lastCultureDay = GameState.day;

    addLog(`🌱 批量复制完成! 消耗 ${formatNumber(costSimulator)} 个模拟器和 ${formatMoney(costMoney)},获得 ${formatNumber(gain)} 个模拟器 (下次可用: 第${GameState.day + actualCooldown}天)`, 'positive');
    updateUI();
    saveGame();
    
    // 重新启动冷却时间定时器
    startCultureCooldownTimer();
}

// ==================== 动态更新定时器 ====================
let cultureCooldownTimer = null;

/**
 * 启动批量复制冷却时间动态更新
 */
function startCultureCooldownTimer() {
    // 清除旧的定时器
    if (cultureCooldownTimer) {
        clearInterval(cultureCooldownTimer);
    }
    
    // 每秒更新一次冷却时间显示
    cultureCooldownTimer = setInterval(() => {
        const cultureCooldownEl = document.getElementById('culture-cooldown-display');
        if (cultureCooldownEl && GameState.labProduction.enabled) {
            const lastDay = GameState.labProduction.lastCultureDay;
            
            // 获取升级效果
            const bonuses = getUpgradeBonuses();
            const cooldownReduction = bonuses.cultureCooldownReduction;
            const actualCooldown = Math.max(1, 10 - cooldownReduction);
            
            if (lastDay > 0) {
                const daysSince = GameState.day - lastDay;
                if (daysSince < actualCooldown) {
                    const remaining = actualCooldown - daysSince;
                    cultureCooldownEl.textContent = `🕒 冷却中: 还需 ${remaining} 天 (第${lastDay + actualCooldown}天可用)`;
                    cultureCooldownEl.style.color = 'var(--error)';
                } else {
                    cultureCooldownEl.textContent = '✅ 已就绪: 可以使用';
                    cultureCooldownEl.style.color = 'var(--success)';
                    // 已就绪后停止定时器
                    if (cultureCooldownTimer) {
                        clearInterval(cultureCooldownTimer);
                        cultureCooldownTimer = null;
                    }
                }
            }
        }
    }, 1000); // 每秒更新
}

/**
 * 停止批量复制冷却时间动态更新
 */
function stopCultureCooldownTimer() {
    if (cultureCooldownTimer) {
        clearInterval(cultureCooldownTimer);
        cultureCooldownTimer = null;
    }
}

// ==================== 股票市场系统 ====================

/**
 * 解锁股票市场
 */
function unlockStockMarket() {
    if (GameState.stockMarket.unlocked) {
        alert('股票市场已经解锁了！');
        return;
    }
    
    if (GameState.restaurantLevel < 1) {
        alert('需要先解锁模拟器研发小组才能解锁股票市场！');
        return;
    }
    
    const cost = CONFIG.STOCK_UNLOCK_COST;
    if (GameState.money < cost) {
        alert(`资金不足！需要 ¥${formatNumber(cost)}`);
        return;
    }
    
    if (confirm(`确定要解锁股票市场吗？\n\n• 消耗: ¥${formatNumber(cost)}\n• 解锁: 购买模拟器公司股份\n• 解锁: 股票市场子页面`)) {
        GameState.money -= cost;
        GameState.stockMarket.unlocked = true;
        
        // 初始化股票历史数据（7天）
        CONFIG.STOCK_COMPANIES.forEach(company => {
            company.price = company.basePrice;
            company.history = [];
            for (let i = 0; i < 7; i++) {
                company.history.push(company.basePrice);
            }
            company.changePercent = 0;
        });
        
        addLogEntry('📈 成功解锁模拟器股票市场！', 'success');
        addLogEntry('✨ 销售中心已新增"股票市场"子页面', 'success');
        updateUI();
    }
}

/**
 * 从业务升级页面解锁股票市场
 */
function unlockStockMarketFromUpgrade() {
    unlockStockMarket();
}

/**
 * 更新股票价格（每天调用）
 */
function updateStockPrices() {
    if (!GameState.stockMarket.unlocked) return;
    
    let totalAssets = 0;
    let todayProfit = 0;
    
    CONFIG.STOCK_COMPANIES.forEach(company => {
        const oldPrice = company.price;
        
        // 随机涨跌幅 (-10% 到 +10%)
        const changePercent = (Math.random() * 0.2 - 0.1);
        
        // 限制涨跌停
        const limitedChange = Math.max(CONFIG.STOCK_LIMIT_DOWN, Math.min(CONFIG.STOCK_LIMIT_UP, changePercent));
        
        // 计算新价格
        let newPrice = company.price * (1 + limitedChange);
        newPrice = Math.round(newPrice * 100) / 100; // 保留两位小数
        
        // 确保价格在合理范围内（最低为基准价的50%，最高为基准价的3倍）
        const minPrice = company.basePrice * 0.5;
        const maxPrice = company.basePrice * 3;
        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
        
        // 更新数据
        company.price = newPrice;
        company.changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
        
        // 添加到历史记录（保留最近30天）
        company.history.push(newPrice);
        if (company.history.length > 30) {
            company.history.shift();
        }
        
        // 计算持股收益
        const holdings = GameState.stockMarket.holdings[company.id] || 0;
        const assetValue = holdings * newPrice;
        const profit = holdings * (newPrice - oldPrice);
        
        totalAssets += assetValue;
        todayProfit += profit;
    });
    
    // 更新玩家股票资产
    GameState.stockMarket.totalAssets = totalAssets;
    GameState.stockMarket.todayProfit = todayProfit;
}

/**
 * 显示股票市场页面
 */
function renderStockMarket() {
    const stockListEl = document.getElementById('stock-list');
    if (!stockListEl) return;
    
    stockListEl.innerHTML = '';
    
    CONFIG.STOCK_COMPANIES.forEach(company => {
        const holdings = GameState.stockMarket.holdings[company.id] || 0;
        const assetValue = holdings * company.price;
        
        const changeColor = company.changePercent >= 0 ? '#e74c3c' : '#27ae60'; // A股红涨绿跌
        const changeSymbol = company.changePercent >= 0 ? '+' : '';
        
        const card = document.createElement('div');
        card.className = 'stock-card';
        card.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid var(--border);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        card.onmouseenter = () => card.style.borderColor = 'var(--primary)';
        card.onmouseleave = () => card.style.borderColor = 'var(--border)';
        card.onclick = () => showStockDetail(company.id);
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 8px;">
                        ${company.icon} ${company.name}
                    </div>
                    ${company.link ? `<div style="margin-bottom: 8px;">
                        <a href="${company.link}" target="_blank" rel="noopener noreferrer" 
                            class="btn btn-primary" 
                            style="font-size: 0.75rem; padding: 4px 10px; display: inline-block;"
                            onclick="event.stopPropagation();">点击游玩（并非作者开发）</a>
                    </div>` : ''}
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">
                        持有: ${holdings} 股 | 市值: ¥${formatNumber(assetValue)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">
                        ¥${company.price.toFixed(2)}
                    </div>
                    <div style="font-size: 1rem; font-weight: bold; color: ${changeColor};">
                        ${changeSymbol}${company.changePercent.toFixed(2)}%
                    </div>
                </div>
            </div>
        `;
        
        stockListEl.appendChild(card);
    });
    
    // 更新总资产信息
    document.getElementById('stock-total-assets').textContent = `¥${formatNumber(GameState.stockMarket.totalAssets)}`;
    const todayProfitEl = document.getElementById('stock-today-profit');
    todayProfitEl.textContent = `${GameState.stockMarket.todayProfit >= 0 ? '+' : ''}¥${formatNumber(GameState.stockMarket.todayProfit)}`;
    todayProfitEl.style.color = GameState.stockMarket.todayProfit >= 0 ? '#e74c3c' : '#27ae60';
    
    const totalHoldings = Object.values(GameState.stockMarket.holdings).reduce((sum, qty) => sum + qty, 0);
    document.getElementById('stock-holdings-count').textContent = totalHoldings;
}

/**
 * 显示股票详情
 */
function showStockDetail(companyId) {
    const company = CONFIG.STOCK_COMPANIES.find(c => c.id === companyId);
    if (!company) return;
    
    GameState.stockMarket.selectedStock = companyId;
    
    const modal = document.getElementById('stock-detail-modal');
    const holdings = GameState.stockMarket.holdings[companyId] || 0;
    
    document.getElementById('stock-detail-name').innerHTML = `${company.icon} ${company.name}`;
    
    // 如果有链接，在名称下方添加按钮
    const nameEl = document.getElementById('stock-detail-name');
    if (company.link) {
        const linkContainer = document.createElement('div');
        linkContainer.style.marginTop = '8px';
        linkContainer.innerHTML = `
            <a href="${company.link}" target="_blank" rel="noopener noreferrer" 
                class="btn btn-primary" 
                style="font-size: 0.85rem; padding: 6px 15px; display: inline-block;">
                点击游玩（并非作者开发）
            </a>
        `;
        nameEl.appendChild(linkContainer);
    }
    document.getElementById('stock-detail-price').textContent = `¥${company.price.toFixed(2)}`;
    
    const changeEl = document.getElementById('stock-detail-change');
    const changeSymbol = company.changePercent >= 0 ? '+' : '';
    changeEl.textContent = `${changeSymbol}${company.changePercent.toFixed(2)}%`;
    changeEl.style.color = company.changePercent >= 0 ? '#e74c3c' : '#27ae60';
    
    const limitUpPrice = company.price * 1.10;
    const limitDownPrice = company.price * 0.90;
    document.getElementById('stock-detail-limit-up').textContent = `¥${limitUpPrice.toFixed(2)}`;
    document.getElementById('stock-detail-limit-down').textContent = `¥${limitDownPrice.toFixed(2)}`;
    
    document.getElementById('stock-detail-owned').textContent = holdings;
    
    // 更新交易滑块最大值
    const tradeSlider = document.getElementById('stock-trade-amount');
    tradeSlider.max = Math.max(100, holdings + 10000);
    updateStockTradeAmount(tradeSlider.value);
    
    // 绘制价格走势图
    drawStockPriceChart(company);
    
    modal.style.display = 'flex';
}

/**
 * 绘制股票价格走势图
 */
function drawStockPriceChart(company) {
    const canvas = document.getElementById('stock-price-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 获取最近7天的数据
    const history = company.history.slice(-7);
    if (history.length < 2) return;
    
    // 计算价格范围
    const minPrice = Math.min(...history) * 0.95;
    const maxPrice = Math.max(...history) * 1.05;
    const priceRange = maxPrice - minPrice;
    
    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height - 40) * i / 4 + 20;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
        
        // 价格标签
        const price = maxPrice - (priceRange * i / 4);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`¥${price.toFixed(0)}`, 45, y + 4);
    }
    
    // 绘制折线
    const stepX = (width - 70) / (history.length - 1);
    ctx.strokeStyle = company.changePercent >= 0 ? '#e74c3c' : '#27ae60';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    history.forEach((price, index) => {
        const x = 50 + index * stepX;
        const y = height - 20 - ((price - minPrice) / priceRange) * (height - 40);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // 绘制数据点
    history.forEach((price, index) => {
        const x = 50 + index * stepX;
        const y = height - 20 - ((price - minPrice) / priceRange) * (height - 40);
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = company.changePercent >= 0 ? '#e74c3c' : '#27ae60';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制日期标签
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    history.forEach((_, index) => {
        const x = 50 + index * stepX;
        const dayOffset = history.length - 7;
        const day = GameState.day - (6 - index + dayOffset);
        ctx.fillText(`第${day}天`, x, height - 5);
    });
}

/**
 * 关闭股票详情
 */
function closeStockDetail() {
    const modal = document.getElementById('stock-detail-modal');
    modal.style.display = 'none';
    GameState.stockMarket.selectedStock = null;
}

/**
 * 更新股票交易数量
 */
function updateStockTradeAmount(value) {
    document.getElementById('stock-trade-display').textContent = value;
    
    // 同步更新输入框的值
    const inputEl = document.getElementById('stock-trade-input');
    if (inputEl) {
        inputEl.value = value;
    }
    
    const companyId = GameState.stockMarket.selectedStock;
    if (!companyId) return;
    
    const company = CONFIG.STOCK_COMPANIES.find(c => c.id === companyId);
    if (!company) return;
    
    const total = company.price * parseInt(value);
    document.getElementById('stock-trade-total').textContent = `¥${formatNumber(total)}`;
}

/**
 * 从手动输入框更新交易数量
 */
function updateStockTradeFromInput(value) {
    value = parseInt(value);
    if (isNaN(value) || value < 1) {
        value = 1;
    }
    if (value > 10000) {
        value = 10000;
    }
    
    // 更新显示
    document.getElementById('stock-trade-display').textContent = value;
    
    // 同步更新滑块（如果在范围内）
    const sliderEl = document.getElementById('stock-trade-amount');
    if (sliderEl && value >= 100 && value <= 10000 && value % 100 === 0) {
        sliderEl.value = value;
    }
    
    const companyId = GameState.stockMarket.selectedStock;
    if (!companyId) return;
    
    const company = CONFIG.STOCK_COMPANIES.find(c => c.id === companyId);
    if (!company) return;
    
    const total = company.price * value;
    document.getElementById('stock-trade-total').textContent = `¥${formatNumber(total)}`;
}

/**
 * 买入股票
 */
function buyStock() {
    const companyId = GameState.stockMarket.selectedStock;
    if (!companyId) {
        alert('请先选择股票！');
        return;
    }
    
    const company = CONFIG.STOCK_COMPANIES.find(c => c.id === companyId);
    if (!company) return;
    
    // 优先使用手动输入框的值，如果没有则使用滑块
    const inputEl = document.getElementById('stock-trade-input');
    const sliderEl = document.getElementById('stock-trade-amount');
    const amount = inputEl ? parseInt(inputEl.value) : parseInt(sliderEl.value);
    
    if (isNaN(amount) || amount < 1) {
        alert('请输入有效的股票数量！');
        return;
    }
    
    const totalCost = company.price * amount;
    
    if (GameState.money < totalCost) {
        alert(`资金不足！需要 ¥${formatNumber(totalCost)}`);
        return;
    }
    
    if (confirm(`确定要买入 ${amount} 股 ${company.name} 吗？\n\n• 单套授权费: ¥${company.price.toFixed(2)}\n• 数量: ${amount} 股\n• 总金额: ¥${formatNumber(totalCost)}`)) {
        GameState.money -= totalCost;
        GameState.stockMarket.holdings[companyId] = (GameState.stockMarket.holdings[companyId] || 0) + amount;
        
        addLogEntry(`📈 买入 ${amount} 股 ${company.name}, 花费 ¥${formatNumber(totalCost)}`, 'success');
        updateUI();
        renderStockMarket();
        showStockDetail(companyId);
    }
}

/**
 * 卖出股票
 */
function sellStock() {
    const companyId = GameState.stockMarket.selectedStock;
    if (!companyId) {
        alert('请先选择股票！');
        return;
    }
    
    const company = CONFIG.STOCK_COMPANIES.find(c => c.id === companyId);
    if (!company) return;
    
    // 优先使用手动输入框的值，如果没有则使用滑块
    const inputEl = document.getElementById('stock-trade-input');
    const sliderEl = document.getElementById('stock-trade-amount');
    const amount = inputEl ? parseInt(inputEl.value) : parseInt(sliderEl.value);
    
    if (isNaN(amount) || amount < 1) {
        alert('请输入有效的股票数量！');
        return;
    }
    
    const holdings = GameState.stockMarket.holdings[companyId] || 0;
    
    if (holdings < amount) {
        alert(`持股不足！当前持有 ${holdings} 股`);
        return;
    }
    
    const totalRevenue = company.price * amount;
    
    if (confirm(`确定要卖出 ${amount} 股 ${company.name} 吗？\n\n• 单套授权费: ¥${company.price.toFixed(2)}\n• 数量: ${amount} 股\n• 总获得研发经费: ¥${formatNumber(totalRevenue)}`)) {
        GameState.money += totalRevenue;
        GameState.stockMarket.holdings[companyId] -= amount;
        
        if (GameState.stockMarket.holdings[companyId] === 0) {
            delete GameState.stockMarket.holdings[companyId];
        }
        
        addLogEntry(`📉 卖出 ${amount} 股 ${company.name}, 获得 ¥${formatNumber(totalRevenue)}`, 'warning');
        updateUI();
        renderStockMarket();
        showStockDetail(companyId);
    }
}

// ==================== 启动游戏 ====================
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    // 初始化研究升级筛选器
    initResearchUpgradeFilters();
    // 启动批量复制冷却时间动态更新
    startCultureCooldownTimer();
});

// ==================== 成就系统 ====================

// 检查成就
function checkAchievements() {
    if (!GameState.achievements) {
        GameState.achievements = { unlocked: [], lastCheckDay: 0 };
    }
    
    const newAchievements = [];
    
    CONFIG.ACHIEVEMENTS.forEach(achievement => {
        if (!GameState.achievements.unlocked.includes(achievement.id)) {
            try {
                if (achievement.condition(GameState)) {
                    unlockAchievement(achievement);
                    newAchievements.push(achievement);
                }
            } catch (e) {
                console.error('成就检测错误:', achievement.id, e);
            }
        }
    });
    
    GameState.achievements.lastCheckDay = GameState.day;
    
    return newAchievements;
}

// 解锁成就
function unlockAchievement(achievement) {
    if (!GameState.achievements.unlocked.includes(achievement.id)) {
        GameState.achievements.unlocked.push(achievement.id);
        showAchievementPopup(achievement);
        addLog(`🏆 解锁成就: ${achievement.name}`, 'positive');
    }
}

// 显示成就弹窗
function showAchievementPopup(achievement) {
    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 350px;
        cursor: pointer;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem;">${achievement.icon}</div>
            <div style="flex: 1;">
                <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 4px;">🏆 成就解锁!</div>
                <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 4px;">${achievement.name}</div>
                <div style="font-size: 0.9rem; opacity: 0.8;">${achievement.description}</div>
            </div>
        </div>
    `;
    
    // 添加动画样式
    if (!document.getElementById('achievement-styles')) {
        const style = document.createElement('style');
        style.id = 'achievement-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            .achievement-popup:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 点击关闭
    popup.onclick = () => {
        popup.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => popup.remove(), 300);
    };
    
    document.body.appendChild(popup);
    
    // 3秒后自动关闭
    setTimeout(() => {
        if (popup.parentElement) {
            popup.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => popup.remove(), 300);
        }
    }, 3000);
}

// 打开成就面板
function openAchievementPanel() {
    const modal = document.getElementById('achievement-modal');
    if (!modal) {
        createAchievementModal();
    }
    document.getElementById('achievement-modal').style.display = 'flex';
    updateAchievementPanel();
}

// 创建成就面板HTML
function createAchievementModal() {
    const modal = document.createElement('div');
    modal.id = 'achievement-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>🏆 成就系统</h2>
                <button class="close-btn" onclick="closeAchievementPanel()">×</button>
            </div>
            <div class="modal-body">
                <div id="achievement-stats" style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                    <!-- 动态更新统计数据 -->
                </div>
                <div id="achievement-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                    <!-- 动态更新成就列表 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 更新成就面板
function updateAchievementPanel() {
    const statsEl = document.getElementById('achievement-stats');
    const listEl = document.getElementById('achievement-list');
    
    if (!statsEl || !listEl) return;
    
    const totalAchievements = CONFIG.ACHIEVEMENTS.length;
    const unlockedCount = GameState.achievements.unlocked.length;
    const progress = ((unlockedCount / totalAchievements) * 100).toFixed(1);
    
    statsEl.innerHTML = `
        <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">${unlockedCount}/${totalAchievements}</div>
                <div style="color: #666; font-size: 0.9rem;">已解锁成就</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: var(--success);">${progress}%</div>
                <div style="color: #666; font-size: 0.9rem;">完成进度</div>
            </div>
        </div>
    `;
    
    listEl.innerHTML = '';
    CONFIG.ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = GameState.achievements.unlocked.includes(achievement.id);
        const card = document.createElement('div');
        card.className = 'achievement-card';
        card.style.cssText = `
            background: ${isUnlocked ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0'};
            color: ${isUnlocked ? 'white' : '#999'};
            padding: 15px;
            border-radius: 8px;
            border: 2px solid ${isUnlocked ? '#667eea' : '#ddd'};
            transition: all 0.3s ease;
        `;
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="font-size: 2.5rem; filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};">${achievement.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 1.1rem;">${achievement.name}</div>
                    <div style="font-size: 0.85rem; opacity: 0.8;">${achievement.description}</div>
                </div>
            </div>
            <div style="text-align: center; padding: 5px; background: ${isUnlocked ? 'rgba(255,255,255,0.2)' : '#e0e0e0'}; border-radius: 4px; font-size: 0.85rem;">
                ${isUnlocked ? '✓ 已解锁' : '🔒 未解锁'}
            </div>
        `;
        
        listEl.appendChild(card);
    });
}

// 关闭成就面板
function closeAchievementPanel() {
    const modal = document.getElementById('achievement-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== 收集系统 ====================

// 添加收集物品
function addCollectionItem(type, item) {
    if (!GameState.collections) {
        GameState.collections = { letters: [], trophies: [], souvenirs: [] };
    }
    
    switch(type) {
        case 'letter':
            if (!GameState.collections.letters.find(l => l.id === item.id)) {
                GameState.collections.letters.push(item);
                addLog(`✉️ 获得特殊信件: ${item.name}`, 'positive');
            }
            break;
        case 'trophy':
            if (!GameState.collections.trophies.find(t => t.id === item.id)) {
                GameState.collections.trophies.push(item);
                addLog(`🏆 获得奖杯: ${item.name}`, 'positive');
            }
            break;
        case 'souvenir':
            if (!GameState.collections.souvenirs.find(s => s.id === item.id)) {
                GameState.collections.souvenirs.push(item);
                addLog(`🎁 获得纪念品: ${item.name}`, 'positive');
            }
            break;
    }
}

// 打开陈列室
function openShowroom() {
    const modal = document.getElementById('showroom-modal');
    if (!modal) {
        createShowroomModal();
    }
    document.getElementById('showroom-modal').style.display = 'flex';
    updateShowroom();
}

// 创建陈列室HTML
function createShowroomModal() {
    const modal = document.createElement('div');
    modal.id = 'showroom-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>🏛️ 陈列室</h2>
                <button class="close-btn" onclick="closeShowroom()">×</button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="showShowroomTab('letters')" id="tab-letters">✉️ 信件 (${GameState.collections?.letters?.length || 0})</button>
                    <button class="btn btn-primary" onclick="showShowroomTab('trophies')" id="tab-trophies">🏆 奖杯 (${GameState.collections?.trophies?.length || 0})</button>
                    <button class="btn btn-primary" onclick="showShowroomTab('souvenirs')" id="tab-souvenirs">🎁 纪念品 (${GameState.collections?.souvenirs?.length || 0})</button>
                </div>
                <div id="showroom-content">
                    <!-- 动态更新内容 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示陈列室标签页
function showShowroomTab(tab) {
    const contentEl = document.getElementById('showroom-content');
    if (!contentEl) return;
    
    // 更新按钮状态
    ['letters', 'trophies', 'souvenirs'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (btn) {
            btn.style.background = t === tab ? 'var(--primary)' : '';
        }
    });
    
    let items = [];
    let title = '';
    
    switch(tab) {
        case 'letters':
            items = GameState.collections.letters || [];
            title = '✉️ 特殊客户信件';
            break;
        case 'trophies':
            items = GameState.collections.trophies || [];
            title = '🏆 比赛奖杯';
            break;
        case 'souvenirs':
            items = GameState.collections.souvenirs || [];
            title = '🎁 活动纪念品';
            break;
    }
    
    if (items.length === 0) {
        contentEl.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                <div style="font-size: 1.2rem;">暂无${title.split(' ')[1]}</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">继续游戏来收集吧！</div>
            </div>
        `;
        return;
    }
    
    contentEl.innerHTML = `
        <h3 style="margin-bottom: 15px;">${title}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
            ${items.map(item => `
                <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid var(--border);">
                    <div style="font-size: 2rem; margin-bottom: 10px;">${item.icon || '📄'}</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">${item.description || ''}</div>
                    ${item.date ? `<div style="font-size: 0.75rem; color: #999; margin-top: 8px;">获得于: 第${item.date}天</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// 关闭陈列室
function closeShowroom() {
    const modal = document.getElementById('showroom-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==================== 皮肤/主题系统 ====================

// 切换皮肤
function changeSkin(skinId) {
    if (!CONFIG.SKINS[skinId]) {
        alert('无效的皮肤ID！');
        return;
    }
    
    // 检查是否已解锁
    if (!GameState.unlockedSkins.includes(skinId)) {
        const skin = CONFIG.SKINS[skinId];
        if (skin.unlockCondition && !skin.unlockCondition(GameState)) {
            alert('该皮肤尚未解锁！');
            return;
        }
    }
    
    // 移除旧主题类
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
    
    // 应用新主题
    GameState.currentSkin = skinId;
    const newSkin = CONFIG.SKINS[skinId];
    if (newSkin.cssClass) {
        document.body.classList.add(newSkin.cssClass);
    }
    
    addLog(`🎨 切换主题为: ${newSkin.name}`, 'neutral');
    saveGame();
}

// 打开皮肤商店
function openSkinShop() {
    const modal = document.getElementById('skin-shop-modal');
    if (!modal) {
        createSkinShopModal();
    }
    document.getElementById('skin-shop-modal').style.display = 'flex';
    updateSkinShop();
}

// 创建皮肤商店HTML
function createSkinShopModal() {
    const modal = document.createElement('div');
    modal.id = 'skin-shop-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>🎨 主题商店</h2>
                <button class="close-btn" onclick="closeSkinShop()">×</button>
            </div>
            <div class="modal-body">
                <div id="skin-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
                    <!-- 动态更新皮肤列表 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 更新皮肤商店
function updateSkinShop() {
    const listEl = document.getElementById('skin-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    // 获取解锁条件描述
    function getUnlockConditionDesc(skinId, skin) {
        if (!skin.unlockCondition) return '默认解锁';
        
        switch(skinId) {
            case 'dark':
                return '资金达到 ¥1,000,000';
            case 'retro':
                return '累计授权 50,000 个';
            case 'pixel':
                return '游戏进行到第 50 天';
            case 'gold':
                return '资金达到 ¥10,000,000';
            case 'nature':
                return '解锁 10 个成就';
            default:
                return '完成特定条件';
        }
    }
    
    Object.entries(CONFIG.SKINS).forEach(([id, skin]) => {
        const isUnlocked = GameState.unlockedSkins.includes(id);
        const isCurrent = GameState.currentSkin === id;
        
        // 检查解锁条件
        let canUnlock = true;
        if (skin.unlockCondition && !isUnlocked) {
            canUnlock = skin.unlockCondition(GameState);
            if (canUnlock) {
                GameState.unlockedSkins.push(id);
            }
        }
        
        const unlockDesc = getUnlockConditionDesc(id, skin);
        
        const card = document.createElement('div');
        card.className = 'skin-card';
        card.style.cssText = `
            background: ${isCurrent ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : (isUnlocked ? '#f0f8ff' : '#f5f5f5')};
            color: ${isCurrent ? 'white' : '#333'};
            padding: 20px;
            border-radius: 12px;
            border: 3px solid ${isCurrent ? '#667eea' : (isUnlocked ? '#4CAF50' : '#ddd')};
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        card.onmouseenter = () => {
            if (!isCurrent) card.style.transform = 'translateY(-5px)';
        };
        card.onmouseleave = () => {
            card.style.transform = '';
        };
        
        card.onclick = () => {
            if (isUnlocked && !isCurrent) {
                changeSkin(id);
                updateSkinShop();
            } else if (!isUnlocked) {
                alert(`该皮肤尚未解锁！\n\n解锁条件：${unlockDesc}`);
            }
        };
        
        card.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${isCurrent ? '⭐' : (isUnlocked ? '✓' : '🔒')}</div>
                <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 5px;">${skin.name}</div>
                <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 8px;">${skin.description}</div>
                <div style="font-size: 0.75rem; padding: 4px 8px; background: ${isUnlocked ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)'}; border-radius: 4px; color: ${isUnlocked ? '#4CAF50' : '#FF9800'};">
                    ${isUnlocked ? '✓ 已解锁' : '🔓 ' + unlockDesc}
                </div>
            </div>
            <div style="text-align: center; padding: 8px; background: ${isCurrent ? 'rgba(255,255,255,0.2)' : '#e0e0e0'}; border-radius: 6px; font-size: 0.85rem;">
                ${isCurrent ? '当前使用' : (isUnlocked ? '点击使用' : '未解锁')}
            </div>
        `;
        
        listEl.appendChild(card);
    });
}

// 关闭皮肤商店
function closeSkinShop() {
    const modal = document.getElementById('skin-shop-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 初始化时应用当前皮肤
function applyCurrentSkin() {
    if (GameState.currentSkin && GameState.currentSkin !== 'default') {
        const skin = CONFIG.SKINS[GameState.currentSkin];
        if (skin && skin.cssClass) {
            document.body.classList.add(skin.cssClass);
        }
    }
}

// ==================== 客户系统 ====================

// 获取客户关系等级
function getRelationshipLevel(customerType) {
    if (!GameState.customers.relationships[customerType]) {
        return 0;
    }
    
    const relationship = GameState.customers.relationships[customerType];
    let level = 0;
    
    for (let i = CONFIG.RELATIONSHIP_LEVELS.length - 1; i >= 0; i--) {
        if (relationship >= CONFIG.RELATIONSHIP_LEVELS[i].minRelationship) {
            level = i;
            break;
        }
    }
    
    return level;
}

// 增加客户关系值
function addRelationship(customerType, amount) {
    if (!GameState.customers.relationships[customerType]) {
        GameState.customers.relationships[customerType] = 0;
    }
    
    const oldLevel = getRelationshipLevel(customerType);
    GameState.customers.relationships[customerType] += amount;
    const newLevel = getRelationshipLevel(customerType);
    
    if (newLevel > oldLevel) {
        const newLevelInfo = CONFIG.RELATIONSHIP_LEVELS[newLevel];
        addLog(`🤝 与${CONFIG.CUSTOMER_TYPES[customerType].name}的关系提升至: ${newLevelInfo.name}!`, 'positive');
        
        // 创建关系升级提示
        showRelationshipUpgradePopup(customerType, newLevelInfo);
    }
}

// 显示关系升级弹窗
function showRelationshipUpgradePopup(customerType, levelInfo) {
    const customer = CONFIG.CUSTOMER_TYPES[customerType];
    const popup = document.createElement('div');
    popup.className = 'relationship-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInLeft 0.5s ease-out;
        max-width: 300px;
        cursor: pointer;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2.5rem;">${customer.icon}</div>
            <div style="flex: 1;">
                <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 4px;">关系提升!</div>
                <div style="font-weight: bold;">${customer.name}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">${levelInfo.name} (Lv.${levelInfo.level})</div>
                <div style="font-size: 0.75rem; opacity: 0.8; margin-top: 4px;">
                    折扣: ${(levelInfo.discount * 100).toFixed(0)}% | 额外订单: ${(levelInfo.bonusOrderChance * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    `;
    
    // 添加动画样式
    if (!document.getElementById('relationship-popup-styles')) {
        const style = document.createElement('style');
        style.id = 'relationship-popup-styles';
        style.textContent = `
            @keyframes slideInLeft {
                from { transform: translateX(-400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    popup.onclick = () => {
        popup.style.animation = 'slideOutLeft 0.3s ease-in';
        setTimeout(() => popup.remove(), 300);
    };
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentElement) {
            popup.style.animation = 'slideOutLeft 0.3s ease-in';
            setTimeout(() => popup.remove(), 300);
        }
    }, 3000);
}

// 检查今日特殊客户
function checkDailyCustomer() {
    // 基础概率：每天30%概率出现特殊客户
    const baseChance = 0.3;
    
    if (Math.random() > baseChance) {
        GameState.customers.todaySpecialCustomer = null;
        return;
    }
    
    // 随机选择客户类型
    const customerTypes = Object.keys(CONFIG.CUSTOMER_TYPES);
    const randomType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
    
    GameState.customers.todaySpecialCustomer = randomType;
    
    const customer = CONFIG.CUSTOMER_TYPES[randomType];
    addLog(`${customer.icon} 今日特殊客户: ${customer.name} - ${customer.description}`, 'neutral');
}

// 处理学生群体客户
function handleStudentCustomer() {
    const customer = CONFIG.CUSTOMER_TYPES.student;
    const relationshipLevel = getRelationshipLevel('student');
    const relationshipBonus = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    // 计算授权数量（受关系折扣影响）
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    
    // 关系越好，购买量越多
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.1));
    
    // 学生群体对价格敏感
    const maxAcceptablePrice = Math.floor(GameState.currentPrice / customer.priceSensitivity);
    const actualPrice = Math.min(GameState.currentPrice, maxAcceptablePrice);
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    if (purchaseAmount <= 0) {
        addLog('🎓 学生群体来访，但库存不足', 'neutral');
        return { quantity: 0, revenue: 0 };
    }
    
    const revenue = purchaseAmount * actualPrice;
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    // 增加关系值
    addRelationship('student', customer.relationshipBonus);
    
    addLog(`🎓 学生群体购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
    
    // 检查口碑传播
    if (Math.random() < customer.wordOfMouthChance) {
        const bonus = Math.floor(purchaseAmount * customer.wordOfMouthBonus);
        GameState.customers.wordOfMouthBonus = bonus;
        addLog(`📢 学生群体触发了口碑传播！明日基础销量将增加 ${formatNumber(bonus)} 个！`, 'positive');
    }
    
    return { quantity: purchaseAmount, revenue: revenue };
}

// 处理政府机构客户
function handleGovernmentCustomer() {
    const customer = CONFIG.CUSTOMER_TYPES.government;
    const relationshipLevel = getRelationshipLevel('government');
    const relationshipBonus = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    // 计算授权数量
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    
    // 关系越好，采购量越大
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.15));
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    if (purchaseAmount <= 0) {
        addLog('🏛️ 政府机构来访，但库存不足', 'neutral');
        return { quantity: 0, revenue: 0 };
    }
    
    // 政府压价
    const discountedPrice = Math.floor(GameState.currentPrice * (1 - customer.priceDiscount + relationshipBonus.discount));
    const revenue = purchaseAmount * discountedPrice;
    
    // 显示确认对话框
    const confirm = window.confirm(
        `🏛️ 省级竞赛组委会希望采购模拟器\n\n` +
        `• 采购数量: ${formatNumber(purchaseAmount)} 个\n` +
        `• 单套授权费: ${formatMoney(discountedPrice)} (原价${formatMoney(GameState.currentPrice)}的${((1 - customer.priceDiscount) * 100).toFixed(0)}%)\n` +
        `• 总获得研发经费: ${formatMoney(revenue)}\n` +
        `• 完成后声誉: +${customer.reputationBonus}\n\n` +
        `是否接受？`
    );
    
    if (!confirm) {
        addLog('🏛️ 你拒绝了政府机构的采购请求', 'neutral');
        return { quantity: 0, revenue: 0 };
    }
    
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    GameState.reputation += customer.reputationBonus;
    
    // 增加关系值
    addRelationship('government', customer.relationshipBonus);
    
    addLog(`🏛️ 政府机构采购了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}，声誉 +${customer.reputationBonus}`, 'positive');
    
    return { quantity: purchaseAmount, revenue: revenue };
}

// 处理黑客客户
function handleHackerCustomer() {
    const customer = CONFIG.CUSTOMER_TYPES.hacker;
    const relationshipLevel = getRelationshipLevel('hacker');
    
    // 随机决定黑客行为
    const rand = Math.random();
    
    // 30%概率窃取库存
    if (rand < customer.stealChance) {
        const stealAmount = Math.floor(GameState.inventory * customer.stealAmount);
        GameState.inventory -= stealAmount;
        
        addLog(`💻 黑客入侵！窃取了 ${formatNumber(stealAmount)} 个模拟器！`, 'negative');
        
        // 即使被偷，也增加少量关系（因为黑客"认可"了你的价值）
        addRelationship('hacker', customer.relationshipBonus * 0.5);
        
        return { quantity: 0, revenue: 0, stolen: stealAmount };
    }
    
    // 40%概率高价购买
    if (rand < customer.stealChance + customer.highPriceChance) {
        const purchaseAmount = randomInt(50, 200);
        
        if (GameState.inventory < purchaseAmount) {
            addLog('💻 黑客想高价购买，但库存不足', 'neutral');
            return { quantity: 0, revenue: 0 };
        }
        
        const highPrice = Math.floor(GameState.currentPrice * customer.highPriceMultiplier);
        const revenue = purchaseAmount * highPrice;
        
        GameState.inventory -= purchaseAmount;
        GameState.money += revenue;
        GameState.totalSold += purchaseAmount;
        
        // 增加关系值
        addRelationship('hacker', customer.relationshipBonus * 2);
        
        addLog(`💻 黑客以高价 ${formatMoney(highPrice)}/个 购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
        
        // 30%概率留下技术
        if (Math.random() < customer.techGiftChance) {
            const techPoints = randomInt(5, 15);
            GameState.techPoints += techPoints;
            addLog(`💻 黑客留下了技术资料，获得 ${techPoints} 研究点数！`, 'positive');
            
            // 添加到收集品
            addCollectionItem('souvenir', {
                id: `hacker_tech_${Date.now()}`,
                name: '黑客的技术资料',
                description: '神秘的黑客留下的宝贵技术',
                icon: '💾',
                date: GameState.day
            });
        }
        
        return { quantity: purchaseAmount, revenue: revenue };
    }
    
    // 其他情况：正常购买
    const purchaseAmount = randomInt(20, 100);
    
    if (GameState.inventory < purchaseAmount) {
        return { quantity: 0, revenue: 0 };
    }
    
    const revenue = purchaseAmount * GameState.currentPrice;
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('hacker', customer.relationshipBonus);
    
    addLog(`💻 黑客购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'neutral');
    
    return { quantity: purchaseAmount, revenue: revenue };
}

// 处理特殊客户
function handleSpecialCustomer() {
    if (!GameState.customers.todaySpecialCustomer) {
        return null;
    }
    
    const customerType = GameState.customers.todaySpecialCustomer;
    let result = null;
    
    switch (customerType) {
        case 'student':
            result = handleStudentCustomer();
            break;
        case 'government':
            result = handleGovernmentCustomer();
            break;
        case 'hacker':
            result = handleHackerCustomer();
            break;
    }
    
    // 清除今日特殊客户
    GameState.customers.todaySpecialCustomer = null;
    
    return result;
}

// 打开客户面板
function openCustomerPanel() {
    const modal = document.getElementById('customer-modal');
    if (!modal) {
        createCustomerModal();
    }
    document.getElementById('customer-modal').style.display = 'flex';
    updateCustomerPanel();
}

// 创建客户面板HTML
function createCustomerModal() {
    const modal = document.createElement('div');
    modal.id = 'customer-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>👥 客户关系</h2>
                <button class="close-btn" onclick="closeCustomerPanel()">×</button>
            </div>
            <div class="modal-body">
                <div id="today-customer" style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
                    <!-- 动态更新今日客户 -->
                </div>
                <div id="relationship-list" style="display: grid; gap: 15px;">
                    <!-- 动态更新关系列表 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 更新客户面板
function updateCustomerPanel() {
    const todayEl = document.getElementById('today-customer');
    const listEl = document.getElementById('relationship-list');
    
    if (!todayEl || !listEl) return;
    
    // 更新今日客户
    if (GameState.customers.todaySpecialCustomer) {
        const customer = CONFIG.CUSTOMER_TYPES[GameState.customers.todaySpecialCustomer];
        todayEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 3rem;">${customer.icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 1.3rem; font-weight: bold;">今日特殊客户: ${customer.name}</div>
                    <div style="opacity: 0.9;">${customer.description}</div>
                </div>
            </div>
        `;
    } else {
        todayEl.innerHTML = `
            <div style="text-align: center; opacity: 0.9;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
                <div>今日暂无特殊客户</div>
                <div style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8;">明天可能会有新客户来访</div>
            </div>
        `;
    }
    
    // 更新关系列表
    listEl.innerHTML = '';
    Object.entries(CONFIG.CUSTOMER_TYPES).forEach(([type, customer]) => {
        const relationshipLevel = getRelationshipLevel(type);
        const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
        const currentRelationship = GameState.customers.relationships[type] || 0;
        const nextLevel = CONFIG.RELATIONSHIP_LEVELS[Math.min(relationshipLevel + 1, CONFIG.RELATIONSHIP_LEVELS.length - 1)];
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid var(--border);
        `;
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                <div style="font-size: 2.5rem;">${customer.icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 1.2rem; font-weight: bold;">${customer.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">${customer.description}</div>
                </div>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: bold; color: var(--primary);">${levelInfo.name} (Lv.${levelInfo.level})</span>
                    <span style="color: #666;">关系值: ${currentRelationship.toFixed(1)}</span>
                </div>
                <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${(currentRelationship / nextLevel.minRelationship * 100).toFixed(0)}%; transition: width 0.3s;"></div>
                </div>
                ${relationshipLevel < CONFIG.RELATIONSHIP_LEVELS.length - 1 ? 
                    `<div style="font-size: 0.75rem; color: #999; margin-top: 5px;">还需 ${(nextLevel.minRelationship - currentRelationship).toFixed(1)} 达到 ${nextLevel.name}</div>` : 
                    '<div style="font-size: 0.75rem; color: #4CAF50; margin-top: 5px;">✓ 已达最高等级</div>'
                }
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.85rem;">
                <div style="background: #e8f5e9; padding: 8px; border-radius: 4px;">
                    <div style="color: #666; font-size: 0.75rem;">当前折扣</div>
                    <div style="font-weight: bold; color: #4CAF50;">${(levelInfo.discount * 100).toFixed(0)}%</div>
                </div>
                <div style="background: #fff3e0; padding: 8px; border-radius: 4px;">
                    <div style="color: #666; font-size: 0.75rem;">额外订单概率</div>
                    <div style="font-weight: bold; color: #FF9800;">${(levelInfo.bonusOrderChance * 100).toFixed(0)}%</div>
                </div>
            </div>
        `;
        
        listEl.appendChild(card);
    });
}

// 关闭客户面板
function closeCustomerPanel() {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 在nextDay中重置口碑传播加成
function resetDailyCustomerBonuses() {
    // 重置口碑传播加成
    GameState.customers.wordOfMouthBonus = 0;
}

// ==================== 导出全局函数供HTML调用 ====================
window.joinEvent = joinEvent;
window.skipEvent = skipEvent;
window.buyMarketing = buyMarketing;
window.buyAllMarketing = buyAllMarketing;
window.nextDay = nextDay;
window.unlockStockMarket = unlockStockMarket;
window.showStockDetail = showStockDetail;
window.closeStockDetail = closeStockDetail;
window.updateStockTradeAmount = updateStockTradeAmount;
window.updateStockTradeFromInput = updateStockTradeFromInput;
window.buyStock = buyStock;
window.sellStock = sellStock;
window.redeemCode = redeemCode;
window.exportSave = exportSave;
window.importSave = importSave;
window.startEndlessMode = startEndlessMode;
window.upgradeToRestaurant = upgradeToRestaurant;
window.upgradeToFactory = upgradeToFactory;
window.upgradeToLab = upgradeToLab;
window.unlockAcademyFromUpgrade = unlockAcademyFromUpgrade;
window.executeExperiment = executeExperiment;
window.executeCulture = executeCulture;
window.sacrificeSimulator = sacrificeSimulator;
window.exchangeSimulator = exchangeSimulator;
window.exchangeMoney = exchangeMoney;
window.exchangeSalesBonus = exchangeSalesBonus;
window.hostCustomEvent = hostCustomEvent;
window.purchaseWholesale = purchaseWholesale;

// ==================== 客户交互对话框 ====================

// 显示学生客户对话框
function showStudentDialog(customer) {
    const relationshipLevel = getRelationshipLevel('student');
    const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.1));
    
    const maxAcceptablePrice = Math.floor(GameState.currentPrice / customer.priceSensitivity);
    const actualPrice = Math.min(GameState.currentPrice, maxAcceptablePrice);
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    const revenue = purchaseAmount * actualPrice;
    
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>授权数量:</span>
                    <strong>${formatNumber(purchaseAmount)} 个</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>单套授权费:</span>
                    <strong>${formatMoney(actualPrice)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>关系等级:</span>
                    <strong>${levelInfo.name} (Lv.${levelInfo.level})</strong>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                        <span>总获得研发经费:</span>
                        <strong style="color: #FFD700;">${formatMoney(revenue)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #4CAF50; font-weight: bold;" onclick="acceptStudentDeal(${purchaseAmount}, ${revenue}, ${actualPrice})">
                    ✓ 接受授权
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受学生交易
window.acceptStudentDeal = function(purchaseAmount, revenue, actualPrice) {
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('student', CONFIG.CUSTOMER_TYPES.student.relationshipBonus);
    addLog(`🎓 学生群体购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
    
    // 检查口碑传播
    if (Math.random() < CONFIG.CUSTOMER_TYPES.student.wordOfMouthChance) {
        const bonus = Math.floor(purchaseAmount * CONFIG.CUSTOMER_TYPES.student.wordOfMouthBonus);
        GameState.customers.wordOfMouthBonus = bonus;
        addLog(`📢 学生群体触发了口碑传播！明日基础销量将增加 ${formatNumber(bonus)} 个！`, 'positive');
    }
    
    document.querySelector('.customer-dialog').remove();
};

// 显示政府客户对话框
function showGovernmentDialog(customer) {
    const relationshipLevel = getRelationshipLevel('government');
    const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.15));
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    const discountedPrice = Math.floor(GameState.currentPrice * (1 - customer.priceDiscount + levelInfo.discount));
    const revenue = purchaseAmount * discountedPrice;
    
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>采购数量:</span>
                    <strong>${formatNumber(purchaseAmount)} 个</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>原单套授权费:</span>
                    <strong style="text-decoration: line-through;">${formatMoney(GameState.currentPrice)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>折扣单套授权费:</span>
                    <strong style="color: #FFD700;">${formatMoney(discountedPrice)} (${((1 - customer.priceDiscount) * 100).toFixed(0)}%)</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>声誉提升:</span>
                    <strong style="color: #4CAF50;">+${customer.reputationBonus}</strong>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                        <span>总获得研发经费:</span>
                        <strong style="color: #FFD700;">${formatMoney(revenue)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #2196F3; font-weight: bold;" onclick="acceptGovernmentDeal(${purchaseAmount}, ${revenue}, ${discountedPrice})">
                    ✓ 接受采购
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受政府交易
window.acceptGovernmentDeal = function(purchaseAmount, revenue, discountedPrice) {
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    GameState.reputation += CONFIG.CUSTOMER_TYPES.government.reputationBonus;
    
    addRelationship('government', CONFIG.CUSTOMER_TYPES.government.relationshipBonus);
    addLog(`🏛️ 政府机构采购了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}，声誉 +${CONFIG.CUSTOMER_TYPES.government.reputationBonus}`, 'positive');
    
    document.querySelector('.customer-dialog').remove();
};

// 显示黑客对话框
function showHackerDialog(customer) {
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="text-align: center; font-style: italic;">
                    "我听说你有一些有趣的模拟器...让我们做个交易吧。"
                </p>
                <p style="text-align: center; font-size: 0.85rem; opacity: 0.8; margin-top: 10px;">
                    ⚠️ 警告：此人身份不明，交易存在风险
                </p>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #9C27B0; font-weight: bold;" onclick="acceptHackerDeal()">
                    🤝 接触黑客
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    🚫 无视
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受黑客交互
window.acceptHackerDeal = function() {
    const customer = CONFIG.CUSTOMER_TYPES.hacker;
    const rand = Math.random();
    
    document.querySelector('.customer-dialog').remove();
    
    // 30%概率窃取库存
    if (rand < customer.stealChance) {
        const stealAmount = Math.floor(GameState.inventory * customer.stealAmount);
        GameState.inventory -= stealAmount;
        
        addLog(`💻 黑客入侵！窃取了 ${formatNumber(stealAmount)} 个模拟器！`, 'negative');
        addRelationship('hacker', customer.relationshipBonus * 0.5);
        
        // 显示被偷提示
        setTimeout(() => {
            const alert = document.createElement('div');
            alert.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
                z-index: 10002;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            `;
            alert.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 10px;">⚠️</div>
                <h3>被黑客攻击！</h3>
                <p>损失了 ${formatNumber(stealAmount)} 个模拟器</p>
            `;
            document.body.appendChild(alert);
            setTimeout(() => alert.remove(), 2000);
        }, 500);
        
        return;
    }
    
    // 40%概率高价购买
    if (rand < customer.stealChance + customer.highPriceChance) {
        const purchaseAmount = randomInt(50, 200);
        
        if (GameState.inventory < purchaseAmount) {
            addLog('💻 黑客想高价购买，但库存不足', 'neutral');
            return;
        }
        
        const highPrice = Math.floor(GameState.currentPrice * customer.highPriceMultiplier);
        const revenue = purchaseAmount * highPrice;
        
        GameState.inventory -= purchaseAmount;
        GameState.money += revenue;
        GameState.totalSold += purchaseAmount;
        
        addRelationship('hacker', customer.relationshipBonus * 2);
        addLog(`💻 黑客以高价 ${formatMoney(highPrice)}/个 购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
        
        // 30%概率留下技术
        if (Math.random() < customer.techGiftChance) {
            const techPoints = randomInt(5, 15);
            GameState.techPoints += techPoints;
            addLog(`💻 黑客留下了技术资料，获得 ${techPoints} 研究点数！`, 'positive');
            
            addCollectionItem('souvenir', {
                id: `hacker_tech_${Date.now()}`,
                name: '黑客的技术资料',
                description: '神秘的黑客留下的宝贵技术',
                icon: '💾',
                date: GameState.day
            });
        }
        
        // 显示成功提示
        setTimeout(() => {
            const alert = document.createElement('div');
            alert.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
                z-index: 10002;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            `;
            alert.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 10px;">💰</div>
                <h3>交易成功！</h3>
                <p>获得了 ${formatMoney(revenue)}</p>
            `;
            document.body.appendChild(alert);
            setTimeout(() => alert.remove(), 2000);
        }, 500);
        
        return;
    }
    
    // 其他情况：正常购买
    const purchaseAmount = randomInt(20, 100);
    
    if (GameState.inventory < purchaseAmount) {
        addLog('💻 黑客想购买，但库存不足', 'neutral');
        return;
    }
    
    const revenue = purchaseAmount * GameState.currentPrice;
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('hacker', customer.relationshipBonus);
    addLog(`💻 黑客购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'neutral');
};

// 拒绝客户
window.rejectCustomer = function() {
    addLog('你拒绝了这位特殊客户', 'neutral');
    document.querySelector('.customer-dialog').remove();
};

// 修改checkDailyCustomer以使用对话框
function checkDailyCustomerWithDialog() {
    // 每4天出现一次客户（第4、8、12、16...天）
    if (GameState.day % 4 !== 0) {
        GameState.customers.todaySpecialCustomer = null;
        return;
    }
    
    // 根据概率选择客户类型
    const rand = Math.random();
    let selectedType = 'normal';  // 默认普通客户
    
    let cumulativeProb = 0;
    for (const [type, prob] of Object.entries(CONFIG.CUSTOMER_PROBABILITIES)) {
        cumulativeProb += prob;
        if (rand < cumulativeProb) {
            selectedType = type;
            break;
        }
    }
    
    GameState.customers.todaySpecialCustomer = selectedType;
    const customer = CONFIG.CUSTOMER_TYPES[selectedType];
    
    addLog(`${customer.icon} 今日特殊客户: ${customer.name}`, 'neutral');
    
    // 延迟显示对话框
    setTimeout(() => {
        switch(selectedType) {
            case 'normal':
                showNormalCustomerDialog(customer);
                break;
            case 'blogger':
                showBloggerDialog(customer);
                break;
            case 'distributor':
                showDistributorDialog(customer);
                break;
            case 'student':
                showStudentDialog(customer);
                break;
            case 'government':
                showGovernmentDialog(customer);
                break;
            case 'hacker':
                showHackerDialog(customer);
                break;
        }
    }, 500);
}

// 显示普通客户对话框
function showNormalCustomerDialog(customer) {
    const relationshipLevel = getRelationshipLevel('normal');
    const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    // 关系越好，购买量越多
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.1));
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    const revenue = purchaseAmount * GameState.currentPrice;
    
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>授权数量:</span>
                    <strong>${formatNumber(purchaseAmount)} 个</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>单套授权费:</span>
                    <strong>${formatMoney(GameState.currentPrice)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>关系等级:</span>
                    <strong>${levelInfo.name} (Lv.${levelInfo.level})</strong>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                        <span>总获得研发经费:</span>
                        <strong style="color: #FFD700;">${formatMoney(revenue)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #FF9800; font-weight: bold;" onclick="acceptNormalCustomerDeal(${purchaseAmount}, ${revenue})">
                    ✓ 接受授权
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受普通客户交易
window.acceptNormalCustomerDeal = function(purchaseAmount, revenue) {
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('normal', CONFIG.CUSTOMER_TYPES.normal.relationshipBonus);
    addLog(`👤 普通顾客购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
    
    document.querySelector('.customer-dialog').remove();
};

// 显示模拟器博主对话框
function showBloggerDialog(customer) {
    const relationshipLevel = getRelationshipLevel('blogger');
    const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.1));
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    const revenue = purchaseAmount * GameState.currentPrice;
    
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>授权数量:</span>
                    <strong>${formatNumber(purchaseAmount)} 个</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>单套授权费:</span>
                    <strong>${formatMoney(GameState.currentPrice)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>关系等级:</span>
                    <strong>${levelInfo.name} (Lv.${levelInfo.level})</strong>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                        <span>总获得研发经费:</span>
                        <strong style="color: #FFD700;">${formatMoney(revenue)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.85rem;">
                <div style="text-align: center;">
                    📊 博主会制作评测视频<br>
                    <span style="color: #4CAF50;">正面评价: +${customer.heatBonus}热度, +${customer.reputationBonus}声誉</span><br>
                    <span style="color: #f44336;">负面评价: ${customer.heatPenalty}热度</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #E91E63; font-weight: bold;" onclick="acceptBloggerDeal(${purchaseAmount}, ${revenue})">
                    ✓ 接受合作
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受博主交易
window.acceptBloggerDeal = function(purchaseAmount, revenue) {
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('blogger', CONFIG.CUSTOMER_TYPES.blogger.relationshipBonus);
    
    // 随机决定评价类型
    const isPositive = Math.random() < CONFIG.CUSTOMER_TYPES.blogger.positiveReviewChance;
    
    if (isPositive) {
        updateCommunityHeat('marketing', CONFIG.CUSTOMER_TYPES.blogger.heatBonus);
        GameState.reputation += CONFIG.CUSTOMER_TYPES.blogger.reputationBonus;
        addLog(`📹 模拟器博主发布了正面评测！热度 +${CONFIG.CUSTOMER_TYPES.blogger.heatBonus}, 声誉 +${CONFIG.CUSTOMER_TYPES.blogger.reputationBonus}`, 'positive');
        
        // 添加到收集品
        addCollectionItem('souvenir', {
            id: `blogger_review_${Date.now()}`,
            name: '博主的正面评测',
            description: '模拟器博主制作的精彩评测视频',
            icon: '🎬',
            date: GameState.day
        });
    } else {
        updateCommunityHeat('price_change', CONFIG.CUSTOMER_TYPES.blogger.heatPenalty);
        addLog(`📹 模拟器博主发布了负面评测... 热度 ${CONFIG.CUSTOMER_TYPES.blogger.heatPenalty}`, 'negative');
    }
    
    addLog(`📹 模拟器博主购买了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
    
    document.querySelector('.customer-dialog').remove();
};

// 显示模拟器经销商对话框
function showDistributorDialog(customer) {
    const relationshipLevel = getRelationshipLevel('distributor');
    const levelInfo = CONFIG.RELATIONSHIP_LEVELS[relationshipLevel];
    
    let purchaseAmount = randomInt(customer.basePurchaseMin, customer.basePurchaseMax);
    purchaseAmount = Math.floor(purchaseAmount * (1 + relationshipLevel * 0.15));
    
    if (GameState.inventory < purchaseAmount) {
        purchaseAmount = GameState.inventory;
    }
    
    const discountedPrice = Math.floor(GameState.currentPrice * (1 - customer.priceDiscount + levelInfo.discount));
    const revenue = purchaseAmount * discountedPrice;
    
    const modal = document.createElement('div');
    modal.className = 'customer-dialog';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); padding: 30px; border-radius: 16px; max-width: 500px; width: 90%; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 4rem; margin-bottom: 10px;">${customer.icon}</div>
                <h2 style="margin: 0;">${customer.name}</h2>
                <p style="opacity: 0.9; font-size: 0.9rem;">${customer.description}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>采购数量:</span>
                    <strong>${formatNumber(purchaseAmount)} 个</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>原单套授权费:</span>
                    <strong style="text-decoration: line-through;">${formatMoney(GameState.currentPrice)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>批发单套授权费:</span>
                    <strong style="color: #FFD700;">${formatMoney(discountedPrice)} (${((1 - customer.priceDiscount) * 100).toFixed(0)}%)</strong>
                </div>
                <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem;">
                        <span>总获得研发经费:</span>
                        <strong style="color: #FFD700;">${formatMoney(revenue)}</strong>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn" style="flex: 1; background: white; color: #00BCD4; font-weight: bold;" onclick="acceptDistributorDeal(${purchaseAmount}, ${revenue}, ${discountedPrice})">
                    ✓ 接受批发
                </button>
                <button class="btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white;" onclick="rejectCustomer()">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 接受经销商交易
window.acceptDistributorDeal = function(purchaseAmount, revenue, discountedPrice) {
    GameState.inventory -= purchaseAmount;
    GameState.money += revenue;
    GameState.totalSold += purchaseAmount;
    
    addRelationship('distributor', CONFIG.CUSTOMER_TYPES.distributor.relationshipBonus);
    addLog(`🚚 模拟器经销商批发了 ${formatNumber(purchaseAmount)} 个模拟器，获得研发经费 ${formatMoney(revenue)}`, 'positive');
    
    document.querySelector('.customer-dialog').remove();
};

// ==================== 社区论坛系统 ====================

// 初始化社区论坛数据
function initCommunityForum() {
    if (!GameState.community) {
        GameState.community = {
            heat: 50,              // 初始热度50
            posts: 0,
            comments: 0,
            positiveRate: 0.5,       // 50%正面评价
            todayTopic: '',
            historyTopics: [],
            behaviorLog: []       // 记录影响热度的行为
        };
    }
}

// 更新社区热度
function updateCommunityHeat(action, value) {
    if (!GameState.community) {
        initCommunityForum();
    }
    
    let heatChange = 0;
    
    switch(action) {
        case 'sales':  // 销售行为
            heatChange = Math.floor(value / 1000);  // 每1000个销量+1热度
            break;
        case 'price_change':  // 价格变动
            heatChange = value > 0 ? -2 : 1;  // 涨价减热度，降价加热度
            break;
        case 'marketing':  // 营销活动
            heatChange = Math.floor(value * 0.5);  // 营销效果的一半转化为热度
            break;
        case 'event_win':  // 比赛获胜
            heatChange = 10;
            break;
        case 'achievement':  // 解锁成就
            heatChange = 5;
            break;
        case 'upgrade':  // 升级店铺
            heatChange = 8;
            break;
        case 'daily_decay':  // 每日自然衰减
            heatChange = -2;
            break;
    }
    
    GameState.community.heat = clamp(GameState.community.heat + heatChange, 0, 100);
    GameState.community.behaviorLog.push({
        action: action,
        change: heatChange,
        day: GameState.day
    });
    
    // 只保留最近30条记录
    if (GameState.community.behaviorLog.length > 30) {
        GameState.community.behaviorLog = GameState.community.behaviorLog.slice(-30);
    }
    
    if (heatChange !== 0) {
        addLog(`📱 社区热度${heatChange > 0 ? '上升' : '下降'} ${Math.abs(heatChange)}点 (当前: ${GameState.community.heat})`, heatChange > 0 ? 'positive' : 'neutral');
    }
}

// 计算社区对销量的影响
function getCommunitySalesBonus() {
    if (!GameState.community) {
        initCommunityForum();
    }
    
    const heat = GameState.community.heat;
    
    // 热度越高，销量加成越大
    // 0热度: -20%销量
    // 50热度: 0%加成
    // 100热度: +50%销量
    const bonus = ((heat - 50) / 50) * 0.7;  // -0.2 到 +0.7
    
    return bonus;
}

// 生成今日社区话题
function generateDailyTopic() {
    if (!GameState.community) {
        initCommunityForum();
    }
    
    const topics = [
        { text: '今天模拟器的价格怎么样？', effect: 'neutral' },
        { text: '听说有人囤积了很多模拟器...', effect: 'stockpile' },
        { text: '模拟器的质量越来越好了！', effect: 'positive' },
        { text: '价格太高了，买不起啊', effect: 'negative' },
        { text: '有没有人在用这家店的模拟器？', effect: 'neutral' },
        { text: '推荐一家靠谱的模拟器店', effect: 'positive' },
        { text: '今天的销量如何？', effect: 'neutral' },
        { text: '模拟器行业竞争好激烈', effect: 'competition' }
    ];
    
    const topic = topics[Math.floor(Math.random() * topics.length)];
    GameState.community.todayTopic = topic.text;
    GameState.community.historyTopics.push({
        text: topic.text,
        day: GameState.day,
        effect: topic.effect
    });
    
    // 根据话题影响热度
    if (topic.effect === 'positive') {
        updateCommunityHeat('daily_decay', 0);  // 正面话题不衰减
    } else {
        updateCommunityHeat('daily_decay', 0);
    }
}

// 打开社区论坛
function openCommunityForum() {
    const modal = document.getElementById('community-modal');
    if (!modal) {
        createCommunityModal();
    }
    document.getElementById('community-modal').style.display = 'flex';
    updateCommunityForum();
}

// 创建社区论坛HTML
function createCommunityModal() {
    const modal = document.createElement('div');
    modal.id = 'community-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>📱 模拟器社区论坛</h2>
                <button class="close-btn" onclick="closeCommunityForum()">×</button>
            </div>
            <div class="modal-body">
                <div id="community-stats" style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
                    <!-- 动态更新统计数据 -->
                </div>
                <div id="today-topic" style="margin-bottom: 20px; padding: 15px; background: #fff3e0; border-left: 4px solid #FF9800; border-radius: 4px;">
                    <!-- 动态更新今日话题 -->
                </div>
                <div id="heat-history" style="padding: 15px; background: #f5f5f5; border-radius: 8px;">
                    <h3 style="margin-bottom: 10px;">热度变化记录</h3>
                    <div id="heat-log" style="max-height: 300px; overflow-y: auto;">
                        <!-- 动态更新历史记录 -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 更新社区论坛
function updateCommunityForum() {
    const statsEl = document.getElementById('community-stats');
    const topicEl = document.getElementById('today-topic');
    const logEl = document.getElementById('heat-log');
    
    if (!statsEl || !topicEl || !logEl) return;
    
    const heat = GameState.community.heat;
    const salesBonus = getCommunitySalesBonus();
    const bonusPercent = (salesBonus * 100).toFixed(0);
    
    // 热度颜色
    let heatColor = '#4CAF50';  // 绿色
    if (heat < 30) heatColor = '#f44336';  // 红色
    else if (heat < 50) heatColor = '#FF9800';  // 橙色
    
    statsEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
            <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: ${heatColor};">${heat}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">社区热度</div>
            </div>
            <div>
                <div style="font-size: 2.5rem; font-weight: bold; color: ${salesBonus > 0 ? '#4CAF50' : '#f44336'};">${bonusPercent > 0 ? '+' : ''}${bonusPercent}%</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">销量影响</div>
            </div>
            <div>
                <div style="font-size: 2.5rem; font-weight: bold;">${GameState.community.historyTopics.length}</div>
                <div style="font-size: 0.9rem; opacity: 0.9;">讨论天数</div>
            </div>
        </div>
    `;
    
    if (GameState.community.todayTopic) {
        topicEl.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px; color: #FF9800;">📌 今日热门话题</div>
            <div style="font-size: 1.1rem;">"${GameState.community.todayTopic}"</div>
        `;
    } else {
        topicEl.innerHTML = `
            <div style="text-align: center; color: #999;">
                <div>暂无今日话题</div>
                <div style="font-size: 0.85rem; margin-top: 5px;">明天会有新的讨论</div>
            </div>
        `;
    }
    
    // 热度历史记录
    const recentLogs = GameState.community.behaviorLog.slice(-10).reverse();
    
    if (recentLogs.length === 0) {
        logEl.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">暂无记录</div>';
    } else {
        logEl.innerHTML = recentLogs.map(log => {
            const actionNames = {
                sales: '销售',
                price_change: '调价',
                marketing: '营销',
                event_win: '比赛获胜',
                achievement: '成就解锁',
                upgrade: '店铺升级',
                daily_decay: '自然衰减'
            };
            
            return `
                <div style="display: flex; justify-content: space-between; padding: 8px; background: white; margin-bottom: 5px; border-radius: 4px; font-size: 0.85rem;">
                    <span>第${log.day}天 - ${actionNames[log.action] || log.action}</span>
                    <span style="color: ${log.change > 0 ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                        ${log.change > 0 ? '+' : ''}${log.change}
                    </span>
                </div>
            `;
        }).join('');
    }
}

// 关闭社区论坛
function closeCommunityForum() {
    const modal = document.getElementById('community-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 导出所有新函数
window.openAchievementPanel = openAchievementPanel;
window.closeAchievementPanel = closeAchievementPanel;
window.openShowroom = openShowroom;
window.closeShowroom = closeShowroom;
window.showShowroomTab = showShowroomTab;
window.openSkinShop = openSkinShop;
window.closeSkinShop = closeSkinShop;
window.changeSkin = changeSkin;
window.openCustomerPanel = openCustomerPanel;
window.closeCustomerPanel = closeCustomerPanel;
window.acceptNormalCustomerDeal = acceptNormalCustomerDeal;
window.acceptBloggerDeal = acceptBloggerDeal;
window.acceptDistributorDeal = acceptDistributorDeal;
window.acceptStudentDeal = acceptStudentDeal;
window.rejectCustomer = rejectCustomer;
window.acceptGovernmentDeal = acceptGovernmentDeal;
window.acceptHackerDeal = acceptHackerDeal;
window.openCommunityForum = openCommunityForum;
window.closeCommunityForum = closeCommunityForum;
