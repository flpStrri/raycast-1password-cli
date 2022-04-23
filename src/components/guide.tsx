import { showToast, ActionPanel, Toast, Action, Detail } from "@raycast/api";

export function TroubleshootingGuide(): JSX.Element {
  showToast(Toast.Style.Failure, "1Password CLI not found");
  const markdown = `# The 1Password CLI was not found
## Please check that:

1. The 1Password CLI is [correctly installed](https://developer.1password.com/docs/cli/get-started#install)
1. If you did not install 1Password CLI using brew, please check that path of the installation matches the \`1Password CLI Installation Path\` extension setting
`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title={"Copy Homebrew Installation Command"}
            content="brew install --cask 1password/tap/1password-cli"
          />
          <Action.OpenInBrowser url="https://developer.1password.com/docs/cli/get-started#install" />
        </ActionPanel>
      }
    />
  );
}
