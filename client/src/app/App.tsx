import GitHubLink from "@/components/common/GitHubLink";

import { AppRouter } from "./router";

export default function App() {
  return (
    <>
      <AppRouter />
      <GitHubLink
        className="fixed bottom-4 right-4 w-10"
        url="https://github.com/ls-capstone-team-one/hook-catcher"
      />
    </>
  );
}
