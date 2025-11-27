const getUserProfile = () => {
  // In a real application, this data would come from a database based on an authenticated user.
  return {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: '2024-01-15T10:00:00Z',
    membership: 'Premium Member',
    subscription: {
      plan: 'Premium',
      nextBillingDate: '2025-02-15T10:00:00Z',
    },
  };
};

module.exports = { getUserProfile };