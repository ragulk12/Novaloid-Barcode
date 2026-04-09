import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Product } from "../src/db/schema";
import { useDispatch } from "react-redux";
import { addToCart } from "../src/store/cartSlice";
import { Ionicons } from "@expo/vector-icons";

export default function ScannerScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const db = useSQLiteContext();
  const { mode } = useLocalSearchParams<{ mode: "add" | "bill" | "find" }>();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
    buttons: { text: string; onPress: () => void; primary?: boolean }[];
  }>({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlertModal = (
    title: string,
    message: string,
    buttons: { text: string; onPress: () => void; primary?: boolean }[],
    type: "success" | "error" | "info" = "info"
  ) => {
    setModalConfig({ visible: true, title, message, buttons, type });
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-slate-100 text-center mb-4">We need your permission to show the camera</Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-primary p-4 rounded-xl"
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (mode === "add") {
      router.replace({ pathname: "/add-product", params: { scancode: data } });
    } else if (mode === "bill") {
      const product = await db.getFirstAsync<Product>("SELECT * FROM products WHERE barcode = ?", [data]);
      if (product) {
        dispatch(addToCart({
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          barcode: product.barcode
        }));
        showAlertModal(
          "Added to Cart",
          `${product.name} added.`,
          [
            { text: "Scan More", onPress: () => setScanned(false) },
            { text: "Go to Checkout", onPress: () => router.push("/billing"), primary: true }
          ],
          "success"
        );
      } else {
        showAlertModal(
          "Not Found",
          "Product not found in inventory. Add it first?",
          [
            { text: "Add New", onPress: () => router.push({ pathname: "/add-product", params: { scancode: data } }), primary: true },
            { text: "Cancel", onPress: () => setScanned(false) }
          ],
          "error"
        );
      }
    } else {
      // Find mode or default
      const product = await db.getFirstAsync<Product>("SELECT * FROM products WHERE barcode = ?", [data]);
      if (product) {
        showAlertModal(
          "Product Details",
          `Name: ${product.name}\nPrice: $${product.price.toFixed(2)}\nStock: ${product.quantity}`,
          [{ text: "OK", onPress: () => setScanned(false), primary: true }],
          "info"
        );
      } else {
        showAlertModal(
          "Not Found",
          "Barcode: " + data,
          [{ text: "OK", onPress: () => setScanned(false) }],
          "error"
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39", "code93", "itf14", "codabar", "aztec", "pdf417"],
        }}
      />
      
      <View className="absolute top-10 left-0 right-0 items-center">
        <View className="bg-black/50 px-6 py-2 rounded-full">
          <Text className="text-white font-bold uppercase tracking-widest">
            {mode === "bill" ? "Billing Mode" : mode === "add" ? "Adding Mode" : "Scanning..."}
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="w-64 h-64 border-2 border-primary/50 rounded-3xl items-center justify-center">
          <View className="w-48 h-1 bg-primary/30 absolute" />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute bottom-10 self-center bg-white/20 p-4 rounded-full border border-white/30 backdrop-blur-md"
      >
        <Ionicons name="close" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalConfig.visible}
        onRequestClose={() => setModalConfig({ ...modalConfig, visible: false })}
      >
        <View className="flex-1 justify-center items-center bg-black/80 px-6">
          <View className="bg-surface w-full rounded-3xl p-6 border border-slate-700 shadow-2xl items-center">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
              modalConfig.type === "success" ? "bg-green-500/10" : 
              modalConfig.type === "error" ? "bg-red-500/10" : "bg-blue-500/10"
            }`}>
              <Ionicons 
                name={
                  modalConfig.type === "success" ? "checkmark-circle" : 
                  modalConfig.type === "error" ? "alert-circle" : "information-circle"
                } 
                size={40} 
                color={
                  modalConfig.type === "success" ? "#22c55e" : 
                  modalConfig.type === "error" ? "#ef4444" : "#3b82f6"
                } 
              />
            </View>

            <Text className="text-xl font-bold text-slate-100 mb-2 text-center">{modalConfig.title}</Text>
            <Text className="text-slate-400 mb-8 text-center leading-relaxed">{modalConfig.message}</Text>

            <View className="w-full flex-row gap-3">
              {modalConfig.buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setModalConfig({ ...modalConfig, visible: false });
                    btn.onPress();
                  }}
                  className={`flex-1 py-4 rounded-2xl items-center justify-center ${
                    btn.primary ? "bg-primary" : "bg-slate-800/50 border border-slate-700"
                  }`}
                >
                  <Text className={`font-bold ${btn.primary ? "text-white" : "text-slate-400"}`}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
