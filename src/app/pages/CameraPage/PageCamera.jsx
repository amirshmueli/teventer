import { Text, SafeAreaView, TouchableOpacity, View } from "react-native";
import react, { useState } from "react";

import TabCam from "./camera_assets/cam";
const PageCamera = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fafafa",
      }}
    >
      <TabCam visible={modalVisible} setVisible={setModalVisible} />
    </View>
  );
};

export default PageCamera;
