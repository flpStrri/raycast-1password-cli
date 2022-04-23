import { showToast, Form, ActionPanel, Toast, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import { OnePassword } from "../api";

export function UnlockForm(props: { onUnlock: (token: string) => void; opApi: OnePassword }): JSX.Element {
  const { opApi, onUnlock } = props;
  const [vaultStatus, setVaultStatus] = useState("...");

  useEffect(() => {
    opApi.status().then((vaultState) => {
      if (vaultState.status == "unauthenticated") {
        setVaultStatus("Logged out");
      } else {
        setVaultStatus(`Locked (${vaultState.userEmail})`);
      }
    });
  }, []);

  async function onSubmit(values: { password: string }) {
    if (values.password.length == 0) {
      showToast(Toast.Style.Failure, "Failed to unlock vault.", "Missing password.");
      return;
    }
    try {
      const toast = await showToast(Toast.Style.Animated, "Unlocking Vault...", "Please wait.");
      const state = await opApi.status();
      if (state.status == "unauthenticated") {
        try {
          await opApi.login(values.password);
        } catch (error) {
          showToast(Toast.Style.Failure, "Failed to unlock vault.", "Please check your API Key and Secret.");
          return;
        }
      }
      const sessionToken = await opApi.unlock(values.password);
      toast.hide();
      onUnlock(sessionToken);
    } catch (error) {
      console.error(error);
      showToast(Toast.Style.Failure, "Failed to unlock vault.", "Invalid credentials.");
    }
  }
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Unlock" onSubmit={onSubmit} shortcut={{ key: "enter", modifiers: [] }} />
        </ActionPanel>
      }
    >
      <Form.Description title="Vault Status" text={vaultStatus} />
      <Form.PasswordField id="password" title="Master Password" autoFocus />
    </Form>
  );
}
