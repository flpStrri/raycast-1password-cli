import { ActionPanel, List, Icon, Color } from "@raycast/api";
import { OpItem } from "../types";
import { useMemo } from "react";
import { VaultActions, CredentialsActions } from "./actions";
import { URL } from "url";
import { head } from "ramda";

function extractUrl(item: OpItem): string | undefined {
  const firstUrl = head(item.urls || []);
  if (!firstUrl?.href) {
    return;
  }
  try {
    return new URL(firstUrl.href).host;
  } catch (error) {
    // Invalid hostname
  }
}

function extractKeywords(item: OpItem): string[] {
  const keywords: (string | null | undefined)[] = [item.title, item.additional_information];
  const itemUrlHost = extractUrl(item);
  if (itemUrlHost) {
    keywords.push(itemUrlHost);
  }

  const uniqueKeywords = new Set(keywords.filter((keyword): keyword is string => !!keyword));
  return [...uniqueKeywords];
}

function createItemAccessories(item: OpItem): List.Item.Accessory[] {
  const { favorite, additional_information } = item;
  let accessories: List.Item.Accessory[] = [];

  if (favorite) {
    accessories = accessories.concat([{ icon: { source: Icon.Star, tintColor: Color.Yellow }, tooltip: "Favorite" }]);
  }
  if (additional_information != "—") {
    accessories = accessories.concat([{ icon: Icon.Person, tooltip: "Username", text: additional_information }]);
  }
  return accessories;
}

export function VaultItem(props: {
  item: OpItem;
  syncItems: () => void;
  lockVault: () => void;
  logoutVault: () => void;
  copyPassword: (id: string) => void;
  copyUsername: (id: string) => void;
}) {
  const { item, syncItems, lockVault, logoutVault, copyPassword, copyUsername } = props;
  const { id, title, additional_information } = item;

  const keywords = useMemo(() => extractKeywords(item), [item]);
  const accessories = useMemo(() => createItemAccessories(item), [item]);
  const itemHost = useMemo(() => extractUrl(item), [item]);

  return (
    <List.Item
      id={id}
      title={title}
      keywords={keywords}
      accessories={accessories}
      subtitle={itemHost}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <CredentialsActions id={id} copyPassword={copyPassword} copyUsername={copyUsername} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <VaultActions syncItems={syncItems} lockVault={lockVault} logoutVault={logoutVault} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
