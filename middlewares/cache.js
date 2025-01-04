import cache from "../utils/cache.js";

export const cacheMiddleware = (prefix, expireTime = 3600) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = `${prefix}:${req.originalUrl}`;

    try {
      const data = await cache.get(key);
      if (data) {
        return res.json(data);
      }

      // Store original send function
      const originalSend = res.json;

      // Override res.json method
      res.json = function (body) {
        // Restore original send
        res.json = originalSend;

        // Cache the response
        cache.set(key, body, expireTime);

        // Send the response
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      await cache.delByPattern(pattern);
      next();
    } catch (error) {
      next(error);
    }
  };
};
