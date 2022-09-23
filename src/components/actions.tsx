import { Icon, Color, Action } from "@raycast/api";
import { Fragment } from "react";

export function CredentialsActions(props: {
  id: string;
  copyPassword: (id: string) => void;
  copyUsername: (id: string) => void;
}) {
  const { id, copyPassword, copyUsername } = props;

  const usernameAction = (
    <Action title="Copy Username" key="copyUsername" icon={Icon.Person} onAction={async () => await copyUsername(id)} />
  );
  const passwordAction = (
    <Action
      title="Copy Password"
      key="copyPassword"
      icon={Icon.Clipboard}
      onAction={async () => await copyPassword(id)}
    />
  );
  return <Fragment>{[passwordAction, usernameAction]}</Fragment>;
}

export function VaultActions(props: { syncItems: () => void; lockVault: () => void; logoutVault: () => void }) {
  return (
    <Fragment>
      <Action
        title="Sync Vault"
        shortcut={{ modifiers: ["cmd"], key: "r" }}
        icon={Icon.ArrowClockwise}
        onAction={props.syncItems}
      />
      <Action
        icon={{ source: "sf_symbols_lock.svg", tintColor: Color.PrimaryText }}
        title="Lock Vault"
        shortcut={{ modifiers: ["cmd", "shift"], key: "l" }}
        onAction={props.lockVault}
      />
      <Action title="Logout Vault" icon={Icon.XMarkCircle} onAction={props.logoutVault} />
    </Fragment>
  );
}
