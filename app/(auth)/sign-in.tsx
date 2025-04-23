import { icons, images } from "@/constants";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native"
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignIn } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Alert } from "react-native";


const SignIn = () => {

  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const onSignInPress = async () => {
    if (!isLoaded) return;
  
    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });
  
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
  
      const errorMessage =
        err?.errors?.[0]?.message || "Something went wrong. Please try again.";
  
      Alert.alert("Sign In Failed", errorMessage);
    }
  };
  


  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.Bg} className="z-0 w-full" />
          <Text className="absolute bottom-5 left-5 text-2xl font-semibold text-black z-10">
            Welcome 👋
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={onSignInPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};


export default SignIn;