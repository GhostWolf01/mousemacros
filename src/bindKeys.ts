import { appWindow } from "@tauri-apps/api/window";
import type { UnlistenFn, EventCallback, Event as TauriEvent } from "@tauri-apps/api/event";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { config } from "./app";
// import { sleep } from "./utils/sleep";

type BindKeysCallback = (event: KeyboardEvent) => void;

type CheckKey = (event: KeyboardEvent) => boolean;

const bindKeysCallbacks: BindKeysCallback[] = [];
// KeybdKey
const KeybdKey = {
  Backquote: "Backquote",
  Add: "Add",
  Subtract: "Subtract",
  Multiply: "Multiply",
  Separator: "Separator",
  Decimal: "Decimal",
  Divide: "Divide",
  Numpad0: "Numpad0",
  Numpad1: "Numpad1",
  Numpad2: "Numpad2",
  Numpad3: "Numpad3",
  Numpad4: "Numpad4",
  Numpad5: "Numpad5",
  Numpad6: "Numpad6",
  Numpad7: "Numpad7",
  Numpad8: "Numpad8",
  Numpad9: "Numpad9",
  Shift: "Shift",
  Control: "Control",
  Alt: "Alt",
  LShift: "LShift",
  RShift: "RShift",
  LControl: "LControl",
  RControl: "RControl",
  LAlt: "LAlt",
  RAlt: "RAlt",
} as const;

function addBindKey(nameKey: string, callback: EventCallback<null>) {
  const parts = nameKey.split("_");

  const firstKey = parts[parts.length - 1];
  let secondKey = "";
  let thirdKey = "";
  if (parts.length === 2) secondKey = parts[0];
  else if (parts.length === 3) {
    secondKey = parts[0];
    thirdKey = parts[1];
  }

  function getCheckKey(key: string): CheckKey {
    switch (key) {
      case KeybdKey.Backquote: {
        return (event: KeyboardEvent) =>
          event.key === "`" || event.key === "'" || event.key === "ё";
      }
      case KeybdKey.Add: {
        return (event: KeyboardEvent) => event.key === "+";
      }
      case KeybdKey.Subtract: {
        return (event: KeyboardEvent) => event.key === "-";
      }
      case KeybdKey.Multiply: {
        return (event: KeyboardEvent) => event.key === "*";
      }
      case KeybdKey.Divide: {
        return (event: KeyboardEvent) => event.key === "/";
      }
      case KeybdKey.Decimal: {
        return (event: KeyboardEvent) => event.key === "." || event.key === ",";
      }
      case KeybdKey.Numpad0: {
        return (event: KeyboardEvent) => event.key === "0";
      }
      case KeybdKey.Numpad1: {
        return (event: KeyboardEvent) => event.key === "1";
      }
      case KeybdKey.Numpad2: {
        return (event: KeyboardEvent) => event.key === "2";
      }
      case KeybdKey.Numpad3: {
        return (event: KeyboardEvent) => event.key === "3";
      }
      case KeybdKey.Numpad4: {
        return (event: KeyboardEvent) => event.key === "4";
      }
      case KeybdKey.Numpad5: {
        return (event: KeyboardEvent) => event.key === "5";
      }
      case KeybdKey.Numpad6: {
        return (event: KeyboardEvent) => event.key === "6";
      }
      case KeybdKey.Numpad7: {
        return (event: KeyboardEvent) => event.key === "7";
      }
      case KeybdKey.Numpad8: {
        return (event: KeyboardEvent) => event.key === "8";
      }
      case KeybdKey.Numpad9: {
        return (event: KeyboardEvent) => event.key === "9";
      }
      default: {
        return (event: KeyboardEvent) => event.key === key;
      }
    }
  }

  function getModifierKeys(key: string): CheckKey {
    switch (key) {
      case KeybdKey.Alt:
      case KeybdKey.LAlt:
      case KeybdKey.RAlt: {
        return (event: KeyboardEvent) => event.altKey;
      }
      case KeybdKey.Control:
      case KeybdKey.LControl:
      case KeybdKey.RControl: {
        return (event: KeyboardEvent) => event.ctrlKey;
      }
      case KeybdKey.Shift:
      case KeybdKey.LShift:
      case KeybdKey.RShift: {
        return (event: KeyboardEvent) => event.shiftKey;
      }
      default: {
        return () => true;
      }
    }
  }

  const isActiveFirstKey: CheckKey = getCheckKey(firstKey);
  const isActiveSecondKey: CheckKey = getModifierKeys(secondKey);
  const isActiveThirdKey: CheckKey = getModifierKeys(thirdKey);

  function isActiveKey(event: KeyboardEvent): boolean {
    return isActiveFirstKey(event) && isActiveSecondKey(event) && isActiveThirdKey(event);
  }

  const eventTauri: TauriEvent<null> = {
    event: nameKey,
    windowLabel: appWindow.label,
    id: 0,
    payload: null,
  };

  const cl: BindKeysCallback = (event: KeyboardEvent) => {
    if (isActiveKey(event)) {
      callback(eventTauri);
    }
  };
  bindKeysCallbacks.push(cl);
}

export async function bindKey<T>(
  nameKey: string,
  callback: EventCallback<T | null>
): Promise<UnlistenFn> {
  addBindKey(nameKey, callback);
  invoke("bind_key", { nameKey });
  return await listen<T>(`press${nameKey}`, callback);
}

export async function bindHoldKey<T>(
  nameKey: string,
  callback: EventCallback<T | null>
): Promise<UnlistenFn> {
  addBindKey(nameKey, callback);
  invoke("bind_hold_key", { nameKey });
  return await listen<T>(`hold${nameKey}`, callback);
}

export async function activeBindKeys() {
  window.addEventListener("keydown", (event) => {
    bindKeysCallbacks.forEach((cl) => cl(event));
  });
  invoke("active_handle");
}

export const actions = {
  mouseMoveAction: false,
  mouseClickAction: false,
};

export async function mouseMove() {
  if (config.activeScript.value && !actions.mouseMoveAction) {
    actions.mouseMoveAction = true;
    await invoke<boolean>("mouse_move", {
      sensitivity: config.mainConfig.main.value.sensitivity,
      times: config.mainConfig.main.value.times,
      rate: config.mainConfig.main.value.rate,
    });
    actions.mouseMoveAction = false;
  }
}

export async function mouseClick() {
  if (config.activeScript.value && config.activeMouseClick.value && !actions.mouseClickAction) {
    actions.mouseClickAction = true;
    await invoke<boolean>("mouse_click", {
      times: config.mainConfig.click.value.times,
      rate: config.mainConfig.click.value.rate,
    });
    actions.mouseClickAction = false;
  }
}
