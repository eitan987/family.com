// מידלוור לעטיפת פונקציות אסינכרוניות וטיפול בשגיאות

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler; 