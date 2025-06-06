import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import {
  SafeAreaView,
  Text,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import Constants from "expo-constants";
import CustomButton from "@/components/CustomButton";
import { fetchAPI } from "@/lib/fetch";

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
      const { success, url, error } = await uploadToCloudinary(result.assets[0].uri);

      if (success && url && user?.id) {
        setImageUrl(url);

        try {
          await fetchAPI("/(api)/images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerkId: user.id,
              imageUrl: url,
            }),
          });
        } catch (err) {
          console.error("Error saving image URL to DB:", err);
          Alert.alert("Database Error", "Failed to save image URL.");
        }
      } else {
        Alert.alert("Upload Failed", error || "Unknown error");
      }
    }
  };

  const uploadToCloudinary = async (
    uri: string
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
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
        return { success: true, url: data.secure_url };
      } else {
        return { success: false, error: "Unable to get image URL" };
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return { success: false, error: "Something went wrong during upload." };
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
