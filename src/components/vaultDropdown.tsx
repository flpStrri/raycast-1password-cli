import { List } from "@raycast/api";

export function VaultDropdown(props: { vaults: string[]; onVaultChange: (vaultName: string) => void }) {
  const { vaults, onVaultChange } = props;
  return (
    <List.Dropdown
      tooltip="Sellect Password Vault"
      onChange={(newValue) => {
        onVaultChange(newValue);
      }}
    >
      {vaults.map((vaultName: string) =>
        vaultName === "All" ? (
          <List.Dropdown.Item title={vaultName} value="" key={vaultName} />
        ) : (
          <List.Dropdown.Item title={vaultName} value={vaultName} key={vaultName} />
        )
      )}
    </List.Dropdown>
  );
}
