import { userCacheService } from './services/userCache'

// src/lib/cache/index.js
export * from './hooks/useUserCache'
export * from './services/userCache'
// export * from './services/articleCache' // When you add article caching

// Main exports for easy imports
export const { getUser, cacheUser, deleteUser, saveUserOnUnload } =
  userCacheService
