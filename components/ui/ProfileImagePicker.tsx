import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from "lucide-react-native";

interface ProfileImagePickerProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
}

export const ProfileImagePicker = ({ imageUri, onImageSelected }: ProfileImagePickerProps) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View className="items-center justify-center">
      <TouchableOpacity 
        onPress={pickImage}
        activeOpacity={0.8}
        className="w-40 h-40 rounded-full bg-white/10 border-2 border-dashed border-white/30 items-center justify-center overflow-hidden"
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full" />
        ) : (
          <View className="items-center">
            <View className="bg-white/10 p-4 rounded-full mb-2">
              <User size={40} color="white" opacity={0.5} />
            </View>
            <Text className="text-white/60 text-[10px] font-bold uppercase">Add Photo</Text>
          </View>
        )}
        
        {/* Camera Overlay Badge */}
        <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-[#0891B2]">
          <Camera size={16} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};