import { useFonts } from "expo-font";

export default useFonts = async () =>
  await useFonts({
    Lulo: require("./assets/fonts/Lulo Clean One.otf"),
    Brandon: require("./assets/fonts/brandon-grotesque-light.otf"),
  });
