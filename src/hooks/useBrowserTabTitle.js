import { useEffect } from "react";

// Shows the page name on the browser tab, and puts the old title back when the page goes away.
export function useBrowserTabTitle(title) {
  useEffect(() => {
    const titleBeforeChange = document.title;
    document.title = `${title} · Loan Eligibility Simulator`;
    return () => {
      document.title = titleBeforeChange;
    };
  }, [title]);
}
