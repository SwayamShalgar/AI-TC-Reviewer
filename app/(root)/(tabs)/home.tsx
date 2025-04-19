import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import Constants from "expo-constants";
import CustomButton from "@/components/CustomButton";

const Home = () => {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("upload_preset", Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        Alert.alert("Upload failed", "Unable to get image URL");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      Alert.alert("Upload Error", "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <SignedIn>
        <Text className="text-lg mb-4">
          Hello {user?.emailAddresses[0].emailAddress}
        </Text>

        <CustomButton
          title={uploading ? "Uploading..." : "Upload Image"}
          onPress={pickImage}
          bgVariant="primary"
          textVariant="default"
        />

        {uploading && <ActivityIndicator size="large" className="my-4" />}

        {imageUrl !== "" && (
          <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: undefined,
            aspectRatio: 1,
            resizeMode: "contain",
          }}
        />
        
        )}
      </SignedIn>

      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </SignedOut>
    </SafeAreaView>
  );
};

export default Home;
