import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import TimeModal from "./timeModal";
import PopUp from "./modal";
import { scan_ticket, getStats } from "../../../Server";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import * as ActionTypes from "../../../store/actionTypes";
import { useFocusEffect } from "@react-navigation/native";
import NoEvent from "../../NoEvent";

const TabCamera = () => {
  const MSG_waiting = "Searching For QR...";
  const dispatch = useDispatch();
  const {
    tickets,
    event,
    token,
    user,
    delay_interval: interval,
  } = useSelector((state) => state);
  const [modalVisible, setModalVisible] = useState(false);
  const [permission, setPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState(MSG_waiting);
  const [onScan, setOnScan] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      getStats({ user, event }, dispatch, token);
      setOpenCamera(true);
      return () => setOpenCamera(false);
    }, [])
  );

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setPermission(status === "granted");
    })();
  };
  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  useEffect(() => {
    setScanned(modalVisible);
    if (!modalVisible) {
      setText("MSG_waiting");
    }
  }, [modalVisible]);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    if (onScan) return;
    if (text == "MSG_waiting") {
      setOnScan(false);
      return;
    }
    setOnScan(true);
    setText(data);
    setModalVisible(true);
  };

  // Check permissions and return the screens
  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (permission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button
          title={"Allow Camera"}
          onPress={() => askForCameraPermission()}
        />
      </View>
    );
  }
  const Header = () => {
    return (
      <View style={styles.top_design}>
        <View
          style={{
            alignSelf: "center",
            marginTop: "5%",
            justifyContent: "space-between",
            alignItems: "center",
            height: "100%",
            width: "85%",
            flexDirection: "row",
          }}
        >
          <Text style={[styles.Header_Text, { fontSize: 24 }]}>
            {event.Title}
          </Text>
          <Text style={styles.Header_Text}>
            {tickets.current === "" || tickets.capacity === ""
              ? "Loading Stats"
              : tickets.current + " | " + tickets.capacity}
          </Text>
        </View>
      </View>
    );
  };

  // Return the View
  return (
    <View style={styles.container}>
      <Header />
      <PopUp
        visible={modalVisible}
        setVisible={setModalVisible}
        setScan={setOnScan}
        urlData={text}
        Tinterval={interval}
      />
      <View style={styles.middle}>
        <View style={styles.barcodebox}>
          {openCamera ? (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: "100%", width: "100%" }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};
export default TabCamera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    height: "100%",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    height: "90%",
    width: "90%",
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#eee",
  },
  Header_Text: {
    color: "black",
    fontSize: 24,
    fontWeight: "500",
    fontFamily: "brandon",
  },
  top_design: {
    height: "15%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e88e5",
    width: "100%",
    borderRadius: 20,
  },
  middle: {
    width: "100%",
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
  },
});
