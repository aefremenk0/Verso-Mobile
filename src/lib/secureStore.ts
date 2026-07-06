import AsyncStorage from "@react-native-async-storage/async-storage";
import * as aesjs from "aes-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Encrypted storage adapter for the Supabase auth session (access + refresh
// token + user). Used as `auth.storage` in lib/supabase.ts.
//
// Why not raw SecureStore? SecureStore (iOS Keychain / Android Keystore) caps a
// value at ~2 KB, but the Supabase session blob (two JWTs + the user object) is
// bigger. Pattern (Supabase-recommended "LargeSecureStore"): keep a small
// per-key AES key in SecureStore, and the AES-encrypted ciphertext in
// AsyncStorage (no size limit). The plaintext token never touches AsyncStorage.
//
// Expo-Go-safe: expo-secure-store + expo-crypto + aes-js all run in Expo Go (no
// dev build). On web there is no SecureStore, so we fall back to AsyncStorage.

class LargeSecureStore {
  // Encrypt `value`, stash the fresh AES key in SecureStore under `key`, return
  // the ciphertext (hex) to be stored in AsyncStorage.
  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = Crypto.getRandomBytes(256 / 8); // 256-bit AES key
    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1),
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string): Promise<string | null> {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return null; // no key -> nothing we can decrypt
    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    try {
      return await this.decrypt(key, encrypted);
    } catch {
      // Corrupt or legacy plaintext value -> treat as "no session" so the user
      // just signs in once more (the next setItem writes an encrypted value).
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }
}

// Web has no SecureStore -> plain AsyncStorage. Native -> encrypted store.
export const authStorage =
  Platform.OS === "web" ? AsyncStorage : new LargeSecureStore();
