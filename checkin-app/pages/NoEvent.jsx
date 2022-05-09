import { SafeAreaView, TouchableOpacity, Text, View} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const NoEvent = () => {
    return (
        <View style={{
            width: "100%",
            height: "100%",
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <View style={{
                backgroundColor: "#fff",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                borderRadius: 20,
                overflow: 'hidden',
                
            }}>
                <Ionicons
                name="alert-circle-outline"
                color="#db951d"
                size={100}
                />
                <Text style={{
                    marginTop: "10%",
                    fontSize: 24,
                }}>
                    Event Not Selected
                </Text>
            </View>

        </View>
    )
}

export default NoEvent;