import { Icon, Color, Action } from "@raycast/api";
import { Fragment } from "react";

export function CredentialsActions(props: {
  id: string;
  copyPassword: (id: string) => void;
  copyUsername: (id: string) => void;
  copyOTP: (id: string) => void;
}) {
  const { id, copyPassword, copyUsername, copyOTP } = props;

  const usernameAction = (
    <Action title="Copy Username" key="copyUsername" icon={Icon.Person} onAction={() => copyUsername(id)} />
  );
  const passwordAction = (
    <Action
      title="Copy Password"
      key="copyPassword"
      icon={Icon.Clipboard}
      onAction={() => copyPassword(id)}
    />
  );
  const otpAction = (
    <Action
      title="Copy OTP"
      key="copyOTP"
      icon={Icon.Hourglass}
      shortcut={{ modifiers: ["cmd"], key: "o" }}
      onAction={() => copyOTP(id)}
    />
  );
  return <Fragment>{[passwordAction, usernameAction, otpAction]}</Fragment>;
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
