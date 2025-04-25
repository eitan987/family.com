/**
 * Utility function to get correct path for assets when deployed to GitHub Pages
 * This handles the case where the app is deployed to a subdirectory
 */

export const getAssetPath = (path) => {
  // Remove leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check if we're in GitHub Pages environment
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Combine the prefix with the path
  return `${prefix}/${cleanPath}`;
}; 