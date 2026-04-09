import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

export default function AddProductScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { scancode } = useLocalSearchParams<{ scancode?: string }>();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");


  const handleSave = async () => {

    console.log(name, price, quantity);

    if (!name || !price || !quantity) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseInt(quantity);

    if (isNaN(priceNum) || isNaN(quantityNum)) {
      Alert.alert("Error", "Invalid price or quantity");
      return;
    }

    const generatedBarcode = `PRD-${Date.now()}`;

    try {
      await db.runAsync(
        'INSERT INTO products (name, price, quantity, barcode, createdAt) VALUES (?, ?, ?, ?, ?)',
        [name, priceNum, quantityNum, generatedBarcode, new Date().toISOString()]
      );

      Alert.alert("Success", "Product added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", "Could not save product. Check if the barcode is unique?");
      console.error(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-6">
      <Text className="text-slate-100 text-xl font-bold mb-6">Product Information</Text>



      <View className="mb-4">
        <Text className="text-slate-400 mb-2">Product Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Wireless Mouse"
          placeholderTextColor="#64748b"
          className="bg-surface text-slate-100 p-4 rounded-xl border border-slate-700"
        />
      </View>

      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-slate-400 mb-2">Price ($)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#64748b"
            keyboardType="decimal-pad"
            className="bg-surface text-slate-100 p-4 rounded-xl border border-slate-700"
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-slate-400 mb-2">Initial Quantity</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="10"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            className="bg-surface text-slate-100 p-4 rounded-xl border border-slate-700"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSave}
        className="bg-secondary p-5 rounded-2xl items-center mt-6 shadow-xl mb-10"
      >
        <Text className="text-white text-lg font-bold">Save Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
