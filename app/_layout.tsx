import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "../src/db/schema";
import "../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SQLiteProvider databaseName="barcode.db" onInit={migrateDbIfNeeded}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1e293b", // Slate 800
            },
            headerTintColor: "#f1f5f9", // Slate 100
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: "#0f172a", // Slate 900
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Inventory" }} />
          <Stack.Screen name="add-product" options={{ title: "Add Product" }} />
          <Stack.Screen name="scanner" options={{ title: "Scan Code" }} />
          <Stack.Screen name="billing" options={{ title: "Billing" }} />
        </Stack>
      </SQLiteProvider>
    </Provider>
  );
}
