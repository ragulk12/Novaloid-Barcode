import React from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../src/store";
import { updateQuantity, clearCart, removeFromCart } from "../src/store/cartSlice";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Product } from "../src/db/schema";
import { Ionicons } from "@expo/vector-icons";

export default function BillingScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const db = useSQLiteContext();
  const { items, total } = useSelector((state: RootState) => state.cart);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      await db.withTransactionAsync(async () => {
        for (const item of items) {
          const product = await db.getFirstAsync<Product>("SELECT * FROM products WHERE barcode = ?", [item.barcode]);
          if (product) {
            if (product.quantity >= item.quantity) {
              await db.runAsync("UPDATE products SET quantity = quantity - ? WHERE barcode = ?", [item.quantity, item.barcode]);
            } else {
              throw new Error(`Insufficient stock for ${product.name}`);
            }
          } else {
            throw new Error(`Product not found: ${item.name}`);
          }
        }
      });

      Alert.alert("Success", "Purchase completed successfully!", [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearCart());
            router.replace("/");
          }
        }
      ]);
    } catch (e: any) {
      Alert.alert("Checkout Failed", e.message || "An error occurred during checkout.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-surface p-4 mb-3 rounded-xl border border-slate-700 flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-slate-100 text-lg font-bold">{item.name}</Text>
        <Text className="text-secondary font-semibold">${item.price.toFixed(2)}</Text>
      </View>

      <View className="flex-row items-center bg-slate-900 rounded-lg p-1">
        <TouchableOpacity
          onPress={() => dispatch(updateQuantity({ barcode: item.barcode, quantity: item.quantity - 1 }))}
          className="p-2"
        >
          <Ionicons name="remove-circle-outline" size={24} color="#64748b" />
        </TouchableOpacity>

        <Text className="text-slate-100 font-bold mx-3 text-lg">{item.quantity}</Text>

        <TouchableOpacity
          onPress={() => dispatch(updateQuantity({ barcode: item.barcode, quantity: item.quantity + 1 }))}
          className="p-2"
        >
          <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => dispatch(removeFromCart(item.barcode))}
        className="ml-4"
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-100 text-2xl font-extrabold">CART</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/scanner", params: { mode: "bill" } })}
          className="bg-primary p-3 rounded-xl flex-row items-center"
        >
          <Ionicons name="scan-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Scan Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.barcode}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="mt-20 items-center justify-center">
            <Ionicons name="cart-outline" size={80} color="#334155" />
            <Text className="text-slate-500 mt-4">Your cart is empty.</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View className="bg-surface p-6 rounded-t-3xl shadow-2xl absolute bottom-0 left-0 right-0 border-t border-slate-700">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-slate-400 text-lg">Total Amount</Text>
            <Text className="text-secondary text-3xl font-black">${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-secondary p-5 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white text-xl font-black uppercase tracking-widest">Complete Purchase</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
