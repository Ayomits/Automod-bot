import { LocalCache } from "@/cache/local.cache.js";
import type { LiteralEnum } from "@ts-fetcher/types";
import type {
  BaseInteraction,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  Interaction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import type { Client } from "discord.js";
import { singleton } from "tsyringe";

const HandlerType = {
  Modal: "modal",
  StringSelect: "string-select",
  UserSelect: "user-select",
  ChannelSelect: "channel-select",
  RoleSelect: "role-select",
  Button: "button",
} as const;

type HandlerType = LiteralEnum<typeof HandlerType>;
type HandlerKeyType = `${string}-${HandlerType}`;

type InlineHandler<T extends BaseInteraction = Interaction> = (
  interaction: T
) => Promise<void | unknown> | void | unknown;

interface InlineHandlingStore<T extends BaseInteraction = Interaction> {
  handler: InlineHandler<T>;
}

@singleton()
export class InlineHanderService {
  private isInitialized: boolean;
  private modalInteractions: LocalCache<HandlerKeyType, InlineHandlingStore>;
  private stringSelectInteractions: LocalCache<
    HandlerKeyType,
    InlineHandlingStore
  >;
  private buttonInteractions: LocalCache<HandlerKeyType, InlineHandlingStore>;
  private userSelectInteractions: LocalCache<
    HandlerKeyType,
    InlineHandlingStore
  >;
  private roleSelectInteractions: LocalCache<
    HandlerKeyType,
    InlineHandlingStore
  >;
  private channelSelectInteractions: LocalCache<
    HandlerKeyType,
    InlineHandlingStore
  >;

  constructor() {
    this.buttonInteractions = new LocalCache();
    this.modalInteractions = new LocalCache();
    this.stringSelectInteractions = new LocalCache();
    this.userSelectInteractions = new LocalCache();
    this.roleSelectInteractions = new LocalCache();
    this.channelSelectInteractions = new LocalCache();
    this.isInitialized = false;
  }

  public initialize(client: Client) {
    if (this.isInitialized) {
      return this;
    }
    client.on("interactionCreate", (interaction: Interaction) => {
      if (interaction.isButton()) {
        return this.safeExecute("button", interaction);
      } else if (interaction.isStringSelectMenu()) {
        return this.safeExecute("string-select", interaction);
      } else if (interaction.isRoleSelectMenu()) {
        return this.safeExecute("role-select", interaction);
      } else if (interaction.isUserSelectMenu()) {
        return this.safeExecute("user-select", interaction);
      } else if (interaction.isChannelSelectMenu()) {
        return this.safeExecute("channel-select", interaction);
      } else if (interaction.isModalSubmit()) {
        return this.safeExecute("modal", interaction);
      }
      return;
    });
    this.isInitialized = true;
    return this;
  }

  public registerModalHandler(
    customId: string,
    callback: InlineHandler<ModalSubmitInteraction>,
    ttl = 300_000
  ) {
    if (this.modalInteractions.get(this.generateCacheId(customId, "modal"))) {
      return false;
    }
    return this.modalInteractions.set<
      InlineHandlingStore<ModalSubmitInteraction>
    >(
      this.generateCacheId(customId, "modal"),
      {
        handler: callback,
      },
      ttl
    );
  }

  public registerButtonHandler(
    customId: string,
    callback: InlineHandler<ButtonInteraction>,
    ttl = 300_000
  ) {
    if (this.buttonInteractions.get(this.generateCacheId(customId, "button"))) {
      return false;
    }
    return this.buttonInteractions.set<InlineHandlingStore<ButtonInteraction>>(
      this.generateCacheId(customId, "button"),
      {
        handler: callback,
      },
      ttl
    );
  }

  public registerStringSelectHandler(
    customId: string,
    callback: InlineHandler<StringSelectMenuInteraction>,
    ttl = 300_000
  ) {
    if (
      this.stringSelectInteractions.get(
        this.generateCacheId(customId, "string-select")
      )
    ) {
      return false;
    }
    return this.stringSelectInteractions.set<
      InlineHandlingStore<StringSelectMenuInteraction>
    >(
      this.generateCacheId(customId, "string-select"),
      {
        handler: callback,
      },
      ttl
    );
  }

  public registerUserSelectHandler(
    customId: string,
    callback: InlineHandler<UserSelectMenuInteraction>,
    ttl = 300_000
  ) {
    if (
      this.userSelectInteractions.get(
        this.generateCacheId(customId, "user-select")
      )
    ) {
      return false;
    }
    return this.userSelectInteractions.set<
      InlineHandlingStore<UserSelectMenuInteraction>
    >(
      this.generateCacheId(customId, "user-select"),
      {
        handler: callback,
      },
      ttl
    );
  }

  public registerChannelSelectHandler(
    customId: string,
    callback: InlineHandler<ChannelSelectMenuInteraction>,
    ttl = 300_000
  ) {
    if (
      this.channelSelectInteractions.get(
        this.generateCacheId(customId, "channel-select")
      )
    ) {
      return false;
    }
    return this.channelSelectInteractions.set<
      InlineHandlingStore<ChannelSelectMenuInteraction>
    >(
      this.generateCacheId(customId, "channel-select"),
      {
        handler: callback,
      },
      ttl
    );
  }

  public registerRoleSelectHandler(
    customId: string,
    callback: InlineHandler<RoleSelectMenuInteraction>,
    ttl = 300_000
  ) {
    if (
      this.roleSelectInteractions.get(
        this.generateCacheId(customId, "role-select")
      )
    ) {
      return false;
    }
    return this.roleSelectInteractions.set<
      InlineHandlingStore<RoleSelectMenuInteraction>
    >(
      this.generateCacheId(customId, "role-select"),
      {
        handler: callback,
      },
      ttl
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private safeExecute(type: HandlerType, inter: any) {
    try {
      const customId = inter.customId.split(":")[0];
      if (type === "button") {
        return this.buttonInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      } else if (type === "string-select") {
        return this.stringSelectInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      } else if (type === "role-select") {
        return this.roleSelectInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      } else if (type === "user-select") {
        return this.userSelectInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      } else if (type === "channel-select") {
        return this.channelSelectInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      } else if (type === "modal") {
        return this.modalInteractions
          .get<InlineHandlingStore>(this.generateCacheId(customId, type))
          ?.handler(inter);
      }
    } catch {
      return;
    }
    return;
  }

  private generateCacheId<
    C extends string = string,
    T extends HandlerType = HandlerType,
  >(customId: C, type: T): HandlerKeyType {
    return `${customId}-${type}`;
  }
}
