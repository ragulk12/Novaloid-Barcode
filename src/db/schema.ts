import * as SQLite from "expo-sqlite";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
  createdAt: string;
}

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase) {
  // Create products table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      barcode TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

// Hook to get all products reacting to screen focus
export function useProducts() {
  const db = SQLite.useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    const result = await db.getAllAsync<Product>('SELECT * FROM products ORDER BY id DESC');
    setProducts(result);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const deleteProduct = useCallback(async (id: number) => {
    await db.runAsync('DELETE FROM products WHERE id = ?', id);
    await fetchProducts();
  }, [db, fetchProducts]);

  return { products, fetchProducts, deleteProduct };
}
