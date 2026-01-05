export const CATEGORY_TREE = {
  Electronics: [
    "Smartphones", 
    "Laptops", 
    "Headsets", 
    "Keyboards", 
    "Mice", 
    "Cameras", 
    "Monitors"
  ],
  Fashion: [
    "Men's Clothing", 
    "Women's Clothing", 
    "Shoes", 
    "Watches", 
    "Accessories"
  ],
  Home: [
    "Furniture", 
    "Decor", 
    "Kitchen", 
    "Lighting"
  ]
};

// Helper to check if a category needs sizes
export const hasSizes = (category) => {
  return ["Fashion"].includes(category) || ["Shoes", "Men's Clothing", "Women's Clothing"].includes(category);
};