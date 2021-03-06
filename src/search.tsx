import {
  ActionPanel,
  List,
  Icon,
  showToast,
  getPreferenceValues,
  closeMainWindow,
  Toast,
  Clipboard,
  LocalStorage,
} from "@raycast/api";
import { OpItem } from "./types";
import { useEffect, useState } from "react";
import { sleep } from "./utils";
import { OnePassword } from "./api";
import { SESSION_KEY } from "./const";
import { TroubleshootingGuide } from "./components/guide";
import { UnlockForm } from "./components/unlock";
import { VaultActions } from "./components/actions";
import { VaultItem } from "./components/vaultItem";
import { VaultDropdown } from "./components/vaultDropdown";

function useSession() {
  const [state, setState] = useState<{ isLoading: boolean; token?: string }>({ isLoading: true });

  useEffect(() => {
    LocalStorage.getItem<string>(SESSION_KEY).then((token) => setState({ isLoading: false, token }));
  }, []);

  return {
    token: state.token,
    active: !state.isLoading,
    setToken: async (token: string) => {
      await LocalStorage.setItem(SESSION_KEY, token);
      setState({ isLoading: false, token });
    },
    deleteToken: async () => {
      await LocalStorage.removeItem(SESSION_KEY);
      setState({ isLoading: false });
    },
  };
}

export default function Search() {
  const { cliPath, emailAddress, secretKey, signInAddress } = getPreferenceValues();
  try {
    const api = new OnePassword(emailAddress, secretKey, cliPath, signInAddress);
    return <VaultItemList api={api} />;
  } catch (e) {
    return <TroubleshootingGuide />;
  }
}

function VaultItemList(props: { api: OnePassword }) {
  const opApi = props.api;
  const session = useSession();
  const [state, setState] = useState<{
    items: OpItem[];
    isLocked: boolean;
    isLoading: boolean;
    vaults: string[];
    selectedVault: string;
  }>({
    items: [],
    isLocked: false,
    isLoading: true,
    vaults: ["All"],
    selectedVault: "",
  });

  useEffect(() => {
    const token = session.token;
    if (!session.active) {
      return;
    }
    if (!token) {
      setState((previous) => ({ ...previous, isLocked: true }));
    } else {
      loadVaults(token);
      loadItems(token, state.selectedVault);
    }
  }, [session.token, session.active]);

  async function onVaultChange(vaultName: string) {
    const previousSelectedVault = state.selectedVault;
    if (previousSelectedVault === vaultName) {
      return;
    }
    if (!session.token) {
      return;
    }

    setState((previous) => ({ ...previous, isLoading: true, selectedVault: vaultName }));
    loadItems(session.token, vaultName);
  }

  async function loadVaults(sessionToken: string) {
    try {
      const loadedVaults = await opApi.listVaults(sessionToken);
      const vaults = ["All"].concat(loadedVaults);
      setState((previous) => ({ ...previous, vaults }));
    } catch (error) {
      setState((previous) => ({ ...previous, isLocked: true }));
    }
  }

  async function loadItems(sessionToken: string, selectedVault: string) {
    try {
      const items = await opApi.listItems(sessionToken, selectedVault);
      setState((previous) => ({ ...previous, isLoading: false, items }));
    } catch (error) {
      setState((previous) => ({ ...previous, isLocked: true }));
    }
  }

  async function copyPassword(id: string) {
    const toast = await showToast(Toast.Style.Animated, "Copying password...");
    try {
      const password = await opApi.getItemField("password", id, session.token);
      if (!password) {
        toast.style = Toast.Style.Failure;
        toast.message = "No password found.";
        return;
      }
      await Clipboard.copy(password);
      await toast.hide();
      await closeMainWindow({ clearRootSearch: true });
    } catch (error) {
      setState((previous) => ({ ...previous, isLocked: true }));
    }
  }

  async function copyUsername(id: string) {
    const toast = await showToast(Toast.Style.Animated, "Copying username...");
    try {
      const password = await opApi.getItemField("username", id, session.token);
      if (!password) {
        toast.style = Toast.Style.Failure;
        toast.message = "No username found.";
        return;
      }
      await Clipboard.copy(password);
      await toast.hide();
      await closeMainWindow({ clearRootSearch: true });
    } catch (error) {
      setState((previous) => ({ ...previous, isLocked: true }));
    }
  }

  async function syncItems() {
    if (session.token) {
      const toast = await showToast(Toast.Style.Animated, "Syncing Items...");
      try {
        await loadItems(session.token, state.selectedVault);
        await toast.hide();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.message = "Failed to sync. Please try unlocking again.";
        setState((previous) => ({ ...previous, isLocked: true }));
      }
    }
  }

  async function lockVault() {
    const toast = await showToast({ title: "Locking Vault...", style: Toast.Style.Animated });
    await session.deleteToken();
    await toast.hide();
  }

  async function logoutVault() {
    console.debug(
      "TODO: NOT WORKING PROPERLY. It says it cant delete because is sign in but when signing out it fails"
    );
    const toast = await showToast({
      title: "Logging Out is currently not working, will just unlock",
      style: Toast.Style.Animated,
    });
    await sleep(2000);
    await toast.hide();
    await lockVault();
  }

  if (state.isLocked) {
    return (
      <UnlockForm
        opApi={opApi}
        onUnlock={async (token) => {
          await session.setToken(token);
          setState((previous) => ({ ...previous, isLocked: false }));
        }}
      />
    );
  }

  const vaultEmpty = state.items.length == 0;

  return (
    <List
      isLoading={state.isLoading}
      searchBarAccessory={<VaultDropdown vaults={state.vaults} onVaultChange={onVaultChange} />}
    >
      {state.items.map((item) => (
        <VaultItem
          key={item.id}
          item={item}
          lockVault={lockVault}
          logoutVault={logoutVault}
          syncItems={syncItems}
          copyPassword={copyPassword}
          copyUsername={copyUsername}
        />
      ))}
      {state.isLoading ? (
        <List.EmptyView icon={Icon.TwoArrowsClockwise} title="Loading..." description="Please wait." />
      ) : (
        <List.EmptyView
          icon={{ source: "op-128.png" }}
          title={vaultEmpty ? "Vault empty." : "No matching items found."}
          description={
            vaultEmpty
              ? "Hit the sync button to sync your vault or try logging in again."
              : "Hit the sync button to sync your vault."
          }
          actions={
            !state.isLoading && (
              <ActionPanel>
                <VaultActions syncItems={syncItems} lockVault={lockVault} logoutVault={logoutVault} />
              </ActionPanel>
            )
          }
        />
      )}
    </List>
  );
}
