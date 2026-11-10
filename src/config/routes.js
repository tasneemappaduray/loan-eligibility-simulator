// The page addresses. The * one catches any address we did not list and shows the not-found page.
export const ROUTES = {
  products: "/",
  simulator: "/simulator/:loanType",
  howItWorks: "/how-it-works",
  notFound: "*",
};

// The address of the simulator page for one loan type, like /simulator/personal_loan.
export function simulatorPath(loanType) {
  return `/simulator/${loanType}`;
}
