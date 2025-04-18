import { useAuth } from "@clerk/clerk-expo"
import { Redirect } from "expo-router"
import { SafeAreaView, Text } from "react-native"

const Home = () => {

    const { isSignedIn } = useAuth()

    if (isSignedIn) {
      return <Redirect href={'/(root)/(tabs)/home'} />
    }

    return( <Redirect href="/(auth)/sign-up"/>
    )
}

export default Home;