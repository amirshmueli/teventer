import React from "react";
import Stacknav from "./navigation/stacknav";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import AppLoading from "expo-app-loading";
import { get_token } from "./Server";
import { View } from "react-native";
const App = () => {
  const [loaded] = useFonts({
    lulo: require("./assets/fonts/lulo.otf"),
    brandon: require("./assets/fonts/brandon-grotesque-light.otf"),
  });

  if (!loaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stacknav />
    </NavigationContainer>
  );
};
export default App;
