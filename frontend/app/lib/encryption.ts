// // AES-GCM encryption via Web Crypto API
// //
// // WHY AES-GCM instead of RSA-OAEP:
// //   RSA-OAEP with a 2048-bit key can only encrypt ~214 bytes of plaintext.
// //   A typical user/admin object from the API easily exceeds that, causing an
// //   OperationError at runtime. AES-GCM has no practical size limit and is the
// //   correct algorithm for encrypting arbitrary data in the browser.
// //
// // HOW IT WORKS:
// //   - A random 256-bit AES-GCM key is generated once per session (in-memory, non-extractable).
// //   - A fresh random 96-bit IV is generated for every write operation.
// //   - The IV is prepended to the ciphertext before base64-encoding, so decrypt
// //     can always find it without a separate storage slot.
// //   - The key never leaves memory; refreshing the tab regenerates it, making
// //     any previously stored blobs unreadable (forward secrecy per session).

// let _aesKey: CryptoKey | null = null;

// async function getKey(): Promise<CryptoKey> {
//   if (_aesKey) return _aesKey;
//   _aesKey = await window.crypto.subtle.generateKey(
//     { name: 'AES-GCM', length: 256 },
//     false,          // non-extractable — key stays inside the browser's crypto module
//     ['encrypt', 'decrypt']
//   );
//   return _aesKey;
// }

// async function encrypt(data: object): Promise<string> {
//   const key   = await getKey();
//   const iv    = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
//   const bytes = new TextEncoder().encode(JSON.stringify(data));

//   const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);

//   // Concatenate iv (12 bytes) + ciphertext, then base64-encode the whole thing
//   const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
//   combined.set(iv, 0);
//   combined.set(new Uint8Array(cipher), iv.byteLength);

//   return btoa(String.fromCharCode(...combined));
// }

// async function decrypt<T>(blob: string): Promise<T | null> {
//   try {
//     const key      = await getKey();
//     const combined = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
//     const iv       = combined.slice(0, 12);
//     const cipher   = combined.slice(12);

//     const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
//     return JSON.parse(new TextDecoder().decode(plain)) as T;
//   } catch {
//     // Key mismatch (page refresh) or corrupted data — treat as missing
//     return null;
//   }
// }

// const PREFIX = '_sec_';

// export async function secureSet(key: string, value: object): Promise<void> {
//   if (typeof window === 'undefined') return;
//   const enc = await encrypt(value);
//   localStorage.setItem(PREFIX + key, enc);
// }

// export async function secureGet<T>(key: string): Promise<T | null> {
//   if (typeof window === 'undefined') return null;
//   const raw = localStorage.getItem(PREFIX + key);
//   if (!raw) return null;
//   return decrypt<T>(raw);
// }

// export function secureRemove(key: string): void {
//   if (typeof window === 'undefined') return;
//   localStorage.removeItem(PREFIX + key);
// }


// AES-GCM encryption via Web Crypto API
//
// KEY PERSISTENCE STRATEGY:
//   The AES key is generated once and stored in sessionStorage (base64-encoded).
//   This means it survives page refreshes within the same tab, so previously
//   encrypted localStorage blobs remain readable after a refresh.
//   Closing the tab clears sessionStorage, which invalidates all stored blobs —
//   the next session starts fresh. This is the expected and secure behavior.

let _aesKey: CryptoKey | null = null;

const KEY_STORAGE = '_sec_aes_key';

async function getKey(): Promise<CryptoKey> {
  if (_aesKey) return _aesKey;

  // Try to restore the key from sessionStorage (survives page refresh)
  const stored = sessionStorage.getItem(KEY_STORAGE);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
    _aesKey = await window.crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    return _aesKey;
  }

  // No stored key — generate a new one
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable so we can export it to sessionStorage
    ['encrypt', 'decrypt']
  );

  // Export and persist in sessionStorage
  const exported = await window.crypto.subtle.exportKey('raw', key);
  sessionStorage.setItem(
    KEY_STORAGE,
    btoa(String.fromCharCode(...new Uint8Array(exported)))
  );

  // Re-import as non-extractable for runtime safety
  _aesKey = await window.crypto.subtle.importKey(
    'raw',
    exported,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  return _aesKey;
}

async function encrypt(data: object): Promise<string> {
  const key   = await getKey();
  const iv    = window.crypto.getRandomValues(new Uint8Array(12));
  const bytes = new TextEncoder().encode(JSON.stringify(data));

  const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);

  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

async function decrypt<T>(blob: string): Promise<T | null> {
  try {
    const key      = await getKey();
    const combined = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
    const iv       = combined.slice(0, 12);
    const cipher   = combined.slice(12);

    const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    return null;
  }
}

const PREFIX = '_sec_';

export async function secureSet(key: string, value: object): Promise<void> {
  if (typeof window === 'undefined') return;
  const enc = await encrypt(value);
  localStorage.setItem(PREFIX + key, enc);
}

export async function secureGet<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return null;
  return decrypt<T>(raw);
}

export function secureRemove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}