import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        gap: 10,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Animelists Project</Text>
      <Button title="Browse Anime" onPress={() => router.navigate("/(auth)/signup")} />
      <Button title="Join Now" onPress={() => router.navigate("/(auth)/signup")} />
    </View>
  );
}
