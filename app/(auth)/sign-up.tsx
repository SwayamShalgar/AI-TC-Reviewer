import { icons, images } from "@/constants";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import InputField from "@/components/InputField";
import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import Modal from "react-native-modal"; // ✅ Correct import
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });

        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({ ...verification, state: 'success' });
      } else {
        setVerification({ ...verification, state: 'failed', error: 'Verification Failed.' });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || 'Something went wrong.',
        state: 'failed',
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.Bg} className="z-0 w-full" />
          <Text className="absolute bottom-5 left-5 text-2xl font-semibold text-black z-10">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter Your Name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter Your Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter Your Password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6" />
          <OAuth />

          <Link href="/sign-in" className="text-lg text-center text-general-200 mt-10">
            <Text>Already have an account? </Text>
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        {/* ✅ Verification Modal */}
        <Modal isVisible={verification.state === 'pending'}
        onModalHide={() => {
          if(verification.state === 'success') setShowSuccessModal(true);
        }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-bold mb-2">Verification</Text>
            <Text className="mb-5">Check your email for the verification code.</Text>

            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(value) => setVerification({ ...verification, code: value })}
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>
            )}

            <CustomButton title="Verify Email" onPress={onVerifyPress} className="mt-5 bg-success-500" />
          </View>
        </Modal>

        {/* ✅ Success Modal */}
        <Modal isVisible={verification.state === 'success'}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] justify-center items-center">
            <Image source={images.check} className="w-[110px] h-[110px] my-5" />
            <Text className="text-3xl text-center font-bold">Verified</Text>
            <Text className="text-base text-gray-400 text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton title="Go to Home" onPress={() => {
              setShowSuccessModal(false);
              router.push('/(root)/(tabs)/home')
              }} className="mt-5" />
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
