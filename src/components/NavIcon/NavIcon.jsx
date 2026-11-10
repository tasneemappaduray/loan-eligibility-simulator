import styles from "./NavIcon.module.scss";

// The outline of each small picture, drawn on a 24 by 24 grid.
const iconShapes = {
  // three lines, like a list
  products: "M4 6h16M4 12h16M4 18h16",
  // a head and shoulders
  personalLoan: "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  // a car, with its wheels
  vehicleFinance:
    "M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M3 11h18v6H3zM7 17v2M17 17v2M7.5 14h.01M16.5 14h.01",
  // a house, with a roof and a door
  homeLoan: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
  // a circle with an i inside
  howItWorks: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01",
};

// A small icon for a menu item, picked by name: products, personalLoan, vehicleFinance, homeLoan or howItWorks.
export default function NavIcon({ iconName }) {
  return (
    <svg
      className={styles.menuIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconShapes[iconName]} />
    </svg>
  );
}
