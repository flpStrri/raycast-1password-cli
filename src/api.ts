import { execa } from "execa";
import { existsSync } from "fs";
import { dirname } from "path/posix";
import { VaultState, OpAccount, OpItem, OpField, OpVAult } from "./types";
import { filter, length, sort, pipe, map, prop, head } from "ramda";

export class OnePassword {
  private env: Record<string, string>;
  private email: string;
  cliPath: string;
  signInAddress: string;

  constructor(email: string, clientSecret: string, cliPath?: string, signInAddress?: string) {
    if (!cliPath) {
      cliPath = process.arch == "arm64" ? "/opt/homebrew/bin/op" : "/usr/local/bin/op";
    }
    if (!signInAddress) {
      signInAddress = "my.1password.com";
    }
    if (!existsSync(cliPath)) {
      throw new Error(`1Password CLI not found at ${cliPath}`);
    }
    this.cliPath = cliPath;
    this.signInAddress = signInAddress;
    this.email = email;
    this.env = {
      OP_SECRET_KEY: clientSecret.trim(),
      OP_FORMAT: "json",
      PATH: dirname(process.execPath),
    };
  }

  async login(password: string): Promise<void> {
    await execa(
      this.cliPath,
      ["account", "add", "--shorthand", "raycast", "--address", this.signInAddress, "--email", this.email],
      { env: this.env, input: password }
    );
  }

  async listItems(sessionToken: string, vault: string): Promise<OpItem[]> {
    const { stdout } = await execa(
      this.cliPath,
      ["item", "list", "--categories", "login,password", "--vault", vault, "--cache", "--session", sessionToken],
      { env: this.env }
    );
    const items: OpItem[] = JSON.parse(stdout);
    const sortAlphabeticalyWithFavoriteUp = (fieldLeft: OpItem, fieldRight: OpItem) => {
      if (fieldLeft.favorite && fieldRight.favorite) return fieldLeft.title < fieldRight.title ? -1 : 0;
      if (fieldLeft.favorite) return -1;
      if (fieldRight.favorite) return 0;
      return fieldLeft.title < fieldRight.title ? -1 : 1;
    };
    return pipe(sort(sortAlphabeticalyWithFavoriteUp))(items);
  }

  async listVaults(sessionToken: string): Promise<string[]> {
    const { stdout } = await execa(this.cliPath, ["vault", "list", "--cache", "--session", sessionToken], {
      env: this.env,
    });
    const items: OpVAult[] = JSON.parse(stdout);
    const vaults = map(prop("name"), items);

    return vaults.sort();
  }

  async getItemField(fieldPurpose: "PASSWORD" | "USERNAME", itemId: string, sessionToken?: string): Promise<string | undefined> {
    const { stdout } = await execa(
      this.cliPath,
      ["item", "get", itemId, "--cache", "--session", sessionToken || ""],
      { env: this.env }
    );
    const item: OpItem = JSON.parse(stdout);
    const filterFieldWithPurpose = (itemField: OpField) => itemField?.purpose === fieldPurpose
    const maybeField: OpField | undefined = head(filter(filterFieldWithPurpose, item.fields))
    return maybeField?.value;
  }

  async unlock(password: string): Promise<string> {
    const { stdout: sessionToken } = await execa(this.cliPath, ["signin", "--raw", "--account", "raycast"], {
      env: this.env,
      input: password,
    });
    return sessionToken;
  }

  async status(): Promise<VaultState> {
    const isRaycastManaged = (account: OpAccount) => account.shorthand === "raycast";
    const { stdout } = await execa(this.cliPath, ["account", "list"], { env: this.env, input: "" });
    const raycastAccounts = filter(isRaycastManaged, JSON.parse(stdout));
    return length(raycastAccounts) > 0
      ? { status: "unlocked", userEmail: this.email }
      : { status: "unauthenticated", userEmail: this.email };
  }
}
