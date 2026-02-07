import { Image } from "expo-image"
import { View } from "react-native"


const AppIcon = ({ size = 10, rounded = 'rounded-lg', className = "" }) => {
    return (
        // Outer container for the shadow
        <View
            style={{ width: size, height: size }}
            className={`shadow-md shadow-black/40 ${className}`}
        >
            {/* Inner container for rounding and clipping */}
            <View className={`w-full h-full overflow-hidden ${rounded}`}>
                <Image 
                    source={require("../assets/icon.png")}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200} // Smooth fade-in effect
                />
            </View>
        </View>
    )
}

export default AppIcon