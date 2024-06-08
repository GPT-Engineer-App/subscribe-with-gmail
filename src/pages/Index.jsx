import React, { useEffect, useState } from "react";
import { Container, Button, VStack, Text, Box, Spinner } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize Stripe
const stripePromise = loadStripe("YOUR_STRIPE_PUBLIC_KEY");

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        {user ? (
          <>
            <Text fontSize="2xl">Welcome, {user.displayName}</Text>
            <Button colorScheme="red" onClick={handleSignOut}>
              Sign Out
            </Button>
            <SubscriptionForm />
          </>
        ) : (
          <>
            <Text fontSize="2xl">Sign in with Google</Text>
            <Button leftIcon={<FaGoogle />} colorScheme="blue" onClick={handleSignIn}>
              Sign In with Google
            </Button>
          </>
        )}
      </VStack>
    </Container>
  );
};

const SubscriptionForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error("Error creating payment method: ", error);
      setLoading(false);
      return;
    }

    // Here you would send the paymentMethod.id to your server to create a subscription
    // For demonstration purposes, we'll just log it
    console.log("Payment Method ID: ", paymentMethod.id);

    setLoading(false);
  };

  return (
    <Box width="100%" maxW="md" mt={8}>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <Button mt={4} colorScheme="teal" type="submit" isLoading={loading} isDisabled={!stripe || !elements}>
          Subscribe
        </Button>
      </form>
    </Box>
  );
};

const App = () => (
  <Elements stripe={stripePromise}>
    <Index />
  </Elements>
);

export default App;
