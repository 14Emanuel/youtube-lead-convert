// Import Prisma database client to interact with the database
import { prismadb } from "@/lib/prismadb";

// Import authentication and current user functions from Clerk
import { auth, currentUser } from "@clerk/nextjs";

// Import React for creating the component
import React from "react";

// Import unique username generator based on email
import { generateFromEmail } from "unique-username-generator";

// Import AccountContainer component for rendering account details
import AccountContainer from "./components/AccountContainer";

async function AccountPage() {
  // Fetch the account details or create a new account if it doesn't exist
  const fetchAccount = async (userId: string) => {
    try {
      let account = await prismadb.account.findUnique({ where: { userId } });

      if (!account) {
        const user = await currentUser();
        if (!user) throw new Error("User not found");

        const baseEmail = user.emailAddresses[0].emailAddress;
        account = await prismadb.account.create({
          data: {
            userId,
            email: baseEmail,
            username: generateFromEmail(baseEmail, 3),
          },
        });
      }

      // Print account details and type for debugging
      console.log("Account details:", account);
      console.log("Account type:", typeof account);

      return account;
    } catch (error) {
      console.error("Error fetching account:", error);
      throw error;
    }
  };

  // Mock subscription object for testing
  const mockSubscription = {
    id: "mock-subscription-id",
    userId: "mock-user-id",
    stripeCustomerId: "mock-stripe-customer-id",
    stripeSubscriptionId: "mock-stripe-subscription-id",
    stripeCurrentPeriodEnd: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Retrieve the userId from authentication
  const { userId } = auth();

  // If no userId is found, throw an error
  if (!userId) throw new Error("User not found");

  // Fetch the account (skip fetching subscription and use mock data)
  const account = await fetchAccount(userId);
  const subscription = mockSubscription;

  // Print combined data for debugging
  console.log("Fetched account:", account);
  console.log("Mocked subscription:", subscription);

  // Render the AccountContainer with the fetched data
  return <AccountContainer account={account} subscription={subscription} />;
}

export default AccountPage;
