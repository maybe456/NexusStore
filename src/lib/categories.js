import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// Default categories (used for initial seeding)
export const DEFAULT_CATEGORY_TREE = {
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

// Fetch categories from Firestore
export const fetchCategories = async () => {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    if (snapshot.empty) {
      // If no categories exist, seed with defaults
      await seedDefaultCategories();
      return DEFAULT_CATEGORY_TREE;
    }
    
    const categoryTree = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      categoryTree[doc.id] = data.subCategories || [];
    });
    return categoryTree;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return DEFAULT_CATEGORY_TREE;
  }
};

// Seed default categories to Firestore
export const seedDefaultCategories = async () => {
  try {
    for (const [category, subCategories] of Object.entries(DEFAULT_CATEGORY_TREE)) {
      await setDoc(doc(db, "categories", category), {
        name: category,
        subCategories: subCategories,
        createdAt: new Date()
      });
    }
    console.log("Default categories seeded");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};

// Add a new category
export const addCategory = async (categoryName) => {
  try {
    await setDoc(doc(db, "categories", categoryName), {
      name: categoryName,
      subCategories: [],
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error("Error adding category:", error);
    return false;
  }
};

// Add a subcategory to a category
export const addSubCategory = async (categoryName, subCategoryName) => {
  try {
    const categoryRef = doc(db, "categories", categoryName);
    const snapshot = await getDocs(collection(db, "categories"));
    const categoryDoc = snapshot.docs.find(d => d.id === categoryName);
    
    if (categoryDoc) {
      const currentSubs = categoryDoc.data().subCategories || [];
      if (!currentSubs.includes(subCategoryName)) {
        await setDoc(categoryRef, {
          ...categoryDoc.data(),
          subCategories: [...currentSubs, subCategoryName]
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error adding subcategory:", error);
    return false;
  }
};

// Delete a category
export const deleteCategory = async (categoryName) => {
  try {
    await deleteDoc(doc(db, "categories", categoryName));
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    return false;
  }
};

// Remove a subcategory from a category
export const removeSubCategory = async (categoryName, subCategoryName) => {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    const categoryDoc = snapshot.docs.find(d => d.id === categoryName);
    
    if (categoryDoc) {
      const currentSubs = categoryDoc.data().subCategories || [];
      await setDoc(doc(db, "categories", categoryName), {
        ...categoryDoc.data(),
        subCategories: currentSubs.filter(s => s !== subCategoryName)
      });
    }
    return true;
  } catch (error) {
    console.error("Error removing subcategory:", error);
    return false;
  }
};

// Helper to check if a category needs sizes
export const hasSizes = (category) => {
  return ["Fashion"].includes(category) || ["Shoes", "Men's Clothing", "Women's Clothing"].includes(category);
};

// Format categories for AI prompt
export const formatCategoriesForAI = (categoryTree) => {
  return Object.entries(categoryTree)
    .map(([cat, subs]) => `- ${cat}: ${subs.join(", ")}`)
    .join("\n");
};