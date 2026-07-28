import { describe, expect, it } from "vitest";
import { initialStorySnapshot } from "../story/storyMachine";
import {
  parseSaveGame,
  readSaveGame,
  SAVE_GAME_KEY,
  serializeSaveGame,
  writeSaveGame,
} from "./saveGame";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("save game V1", () => {
  it("serializes and restores story sets", () => {
    const storage = new MemoryStorage();
    const save = serializeSaveGame(
      {
        ...initialStorySnapshot,
        stage: "travel-to-jasnov",
        lanternMemorySeen: true,
        pukAwakened: true,
        renaDeliveryReceived: true,
        collectedEntityIds: new Set(["light-spark"]),
        resolvedEntityIds: new Set(["lantern-memory", "puk-awakening"]),
      },
      "jasnov-outskirts",
      "wave-1-start",
      "2026-07-28T10:00:00.000Z",
    );
    writeSaveGame(storage, save);
    const loaded = readSaveGame(storage);

    expect(loaded?.ok).toBe(true);
    if (loaded?.ok) {
      expect(loaded.snapshot.collectedEntityIds.has("light-spark")).toBe(true);
      expect(loaded.snapshot.pukAwakened).toBe(true);
      expect(loaded.save.savedAt).toBe("2026-07-28T10:00:00.000Z");
    }
  });

  it("rejects malformed JSON, unsupported versions, and unsafe map IDs", () => {
    expect(parseSaveGame("{broken").ok).toBe(false);
    expect(parseSaveGame(JSON.stringify({ version: 99 })).ok).toBe(false);

    const unsafe = serializeSaveGame(
      initialStorySnapshot,
      "jasnov-outskirts",
      "wave-1-start",
    );
    expect(
      parseSaveGame(JSON.stringify({ ...unsafe, currentMapId: "unknown-map" })).ok,
    ).toBe(false);
  });

  it("exposes Continue only when a valid save can be read", () => {
    const storage = new MemoryStorage();
    expect(readSaveGame(storage)).toBeNull();
    storage.setItem(SAVE_GAME_KEY, "not-json");
    expect(readSaveGame(storage)?.ok).toBe(false);
  });
});
