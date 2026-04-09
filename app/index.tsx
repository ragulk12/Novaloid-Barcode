import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useProducts, Product } from "../src/db/schema";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

export default function InventoryScreen() {
  const router = useRouter();
  const { products, deleteProduct } = useProducts();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
        className="bg-surface p-4 mb-3 rounded-xl border border-slate-700"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-slate-100 text-lg font-bold">{item.name}</Text>
            <Text className="text-secondary font-semibold">${item.price.toFixed(2)}</Text>
          </View>
          <View className="flex-row items-center">
            <View className="items-end mr-4">
              {/* <Text className="text-slate-100 font-bold text-xl">{item.quantity}</Text> */}
              <Text className="text-slate-500 text-xs">Available</Text>
            </View>

            <TouchableOpacity
              onPress={() => deleteProduct(item.id)}
              className="p-2 bg-red-500/20 rounded-full mr-3"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>

            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#64748b"
            />
          </View>
        </View>
        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-slate-700 items-center">
            <Text className="text-slate-400 mb-2 font-mono text-sm tracking-widest">{item.barcode}</Text>
            <View className="bg-white p-3 rounded-xl shadow-lg mt-2">
              <QRCode
                value={item.barcode}
                size={150}
                color="black"
                backgroundColor="white"
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-slate-100 text-2xl font-extrabold uppercase tracking-widest">
          Stock <Text className="text-primary">List</Text>
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/billing")}
          className="bg-accent p-3 rounded-full flex-row items-center"
        >
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text className="text-white font-bold ml-2">Billing</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="mt-20 items-center justify-center">
            <Ionicons name="cube-outline" size={80} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center">No products in inventory yet.</Text>
            <Text className="text-slate-600 text-sm text-center">Tap the button below to add one.</Text>
          </View>
        }
      />

      <View className="flex-row justify-around mb-4">
        <TouchableOpacity
          onPress={() => router.push("/add-product")}
          className="bg-primary flex-1 mx-2 p-4 rounded-xl flex-row justify-center items-center shadow-lg"
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white font-bold ml-2">Add New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/scanner")}
          className="bg-surface flex-1 mx-2 p-4 rounded-xl flex-row justify-center items-center border border-slate-600"
        >
          <Ionicons name="scan-outline" size={24} color="white" />
          <Text className="text-white font-bold ml-2">Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
