// src/lib/ota-updater.ts
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import JSZip from 'jszip';
import { WebView, Capacitor } from '@capacitor/core';
import CryptoJS from 'crypto-js';
import { RootState, AppDispatch } from '../store';
import { SET_HOT_UPDATE_ENABLED, SET_HOT_UPDATE_MODAL_PROGRESS, SET_NEW_VERSION, SET_SHOW_HOT_UPDATE_MODAL } from '../reducers/hotUpdateReducer';
import GlobalStore from "../config/GlobalStore";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const LOCAL_VERSION_KEY = 'buildVersion';
/* ------------------------------------------------------------------ */
/* Version helpers                                                    */
/* ------------------------------------------------------------------ */

function waitForApiUrl(): Promise<void> {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (GlobalStore.apiUrl) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

export async function fetchRemoteVersion(): Promise<string> {
    // await waitForApiUrl();
    const VERSION_URL = `${GlobalStore.apiUrl}static/jmapp3apk/version.json`;
    const res = await fetch(VERSION_URL);
    const data = await res.json();
    return data.version ?? DEFAULT_VERSION;
}

export const DEFAULT_VERSION = process.env.REACT_APP_VERSION || "2.0.0";
export async function getLocalVersion(): Promise<string> {
    const { value } = await Preferences.get({ key: LOCAL_VERSION_KEY });
    return value ?? DEFAULT_VERSION;
}

export async function setLocalVersion(v: string) {
    await Preferences.set({ key: LOCAL_VERSION_KEY, value: v });
}

export function isNewerVersion(remote: string, local: string): boolean {
    const r = remote.split('.').map(Number);
    const l = local.split('.').map(Number);
    while (r.length < 3) r.push(0);
    while (l.length < 3) l.push(0);

    for (let i = 0; i < 3; i++) {
        if (r[i] > l[i]) return true;
        if (r[i] < l[i]) return false;
    }
    return false;
}

export async function needUpdate(): Promise<string> {
    const [remote, local] = await Promise.all([fetchRemoteVersion(), getLocalVersion()]);
    if (isNewerVersion(remote, local)) {
        return remote;
    }
    return '';
}


/* ------------------------------------------------------------------ */
/* Download build.zip                                                 */
/* ------------------------------------------------------------------ */

async function downloadBuildZip(): Promise<ArrayBuffer> {
    // await waitForApiUrl();
    const ZIP_URL = `${GlobalStore.apiUrl}static/jmapp3apk/build.enc`;
    const res = await fetch(ZIP_URL);
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    return await res.arrayBuffer();
}

/* ------------------------------------------------------------------ */
/* Save build.zip for debugging (optional)                            */
/* ------------------------------------------------------------------ */

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(new Blob([buffer]));
    });
}

function wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const length = wordArray.sigBytes;
    const u8_array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        u8_array[i] = (wordArray.words[Math.floor(i / 4)] >> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8_array;
}

async function getDecrypt() {
    if (!GlobalStore.apiUrl) {
        console.log("Waiting for API URL...");
        await waitForApiUrl();
    }
    const url = `${GlobalStore.apiUrl}static/jmapp3apk/get.php?target=encrypt_key.json`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error fetching the data:", error);
    }
}

function decryptAesCBC(encryptedBuffer: ArrayBuffer, json: { ivHex: string, keyHex: string; }): Uint8Array {
    const { keyHex, ivHex } = json;

    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    const encryptedWords = CryptoJS.lib.WordArray.create(new Uint8Array(encryptedBuffer) as any);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: encryptedWords });
    const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );
    return wordArrayToUint8Array(decrypted);
}

/* ------------------------------------------------------------------ */
/* Unzip to Cache/update_<ver>/...                                    */
/* ------------------------------------------------------------------ */

async function unzipToCache(buf: ArrayBuffer, folder: string, batchSize = 5) {
    const zip = await JSZip.loadAsync(buf);
    // 刪除舊資料夾
    try {
        await Filesystem.stat({ path: folder, directory: Directory.Cache });
        await Filesystem.rmdir({ path: folder, directory: Directory.Cache, recursive: true });
        console.log(`📁 Removed existing folder: ${folder}`);
    } catch (e) {
        console.warn(`⚠️ Folder ${folder} not found or failed to remove`, e);
    }
    // 建立根目錄
    try {
        await Filesystem.mkdir({ path: folder, directory: Directory.Cache, recursive: true });
    } catch (e) {
        console.warn(`⚠️ Failed to create folder ${folder}`, e);
    }
    // 收集所有需要建立的目錄
    const dirSet = new Set<string>();
    zip.forEach((relPath: string, file: any) => {
        if (!file.dir) {
            const lastSlashIndex = relPath.lastIndexOf('/');
            if (lastSlashIndex !== -1) {
                const dirPath = `${folder}/${relPath.substring(0, lastSlashIndex)}`;
                dirSet.add(dirPath);
            }
        }
    });
    // 建立目錄
    for (const dirPath of dirSet) {
        try {
            await Filesystem.mkdir({ path: dirPath, directory: Directory.Cache, recursive: true });
        } catch {
            // 忽略錯誤
        }
    }
    // 將所有檔案收集成陣列（明確指定類型）
    const files: { relPath: string; file: any; }[] = [];
    zip.forEach((relPath: string, file: any) => {
        if (!file.dir) {
            files.push({ relPath, file });
        }
    });
    // 分批寫入檔案的輔助函式
    async function writeBatch(batch: { relPath: string; file: any; }[]) {
        await Promise.all(batch.map(async ({ relPath, file }) => {
            try {
                const content = await file.async('uint8array');
                const base64Data = await arrayBufferToBase64(content);
                const dest = `${folder}/${relPath}`;
                await Filesystem.writeFile({
                    path: dest,
                    data: base64Data,
                    directory: Directory.Cache,
                });
                console.log(`✅ Wrote file: ${dest}`);
            } catch (err) {
                console.error(`❌ Failed to write file: ${relPath}`, err);
            }
        }));
    }
    // 按 batchSize 批次處理
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        await writeBatch(batch);
    }
}


/* ------------------------------------------------------------------ */
/* Simple MIME helper                                                 */
/* ------------------------------------------------------------------ */

function getMime(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'html': return 'text/html';
        case 'js': return 'application/javascript';
        case 'css': return 'text/css';
        case 'json': return 'application/json';
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'svg': return 'image/svg+xml';
        case 'woff': return 'font/woff';
        case 'woff2': return 'font/woff2';
        default: return 'application/octet-stream';
    }
}

/* ------------------------------------------------------------------ */
/* Local WebServer → http://localhost:18181                           */
/* ------------------------------------------------------------------ */

async function startLocalServer(baseDir: string) {
    try {
        const { uri } = await Filesystem.stat({
            directory: Directory.Cache,
            path: `${baseDir}/index.html`,
        });
        const basePath = uri.replace(/^file:\/\//, '').replace(/\/index\.html$/, '');
        console.log('[OTA] Base path:', basePath);

        await WebView.setServerBasePath({ path: basePath });

        // Optional: 清除快取與 service worker
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
            console.log('[OTA] Unregistered service workers');
        }
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
            console.log('[OTA] Cleared caches');
        }

        try {
            await WebView.persistServerBasePath();
            console.log('[OTA] BasePath 已永續化 ✅');
        } catch (err) {
            console.error('[OTA] 永續化失敗 ❌', err);
        }

        window.location.reload();
    } catch (error) {
        console.warn('[OTA] 無法啟用本地更新資源，可能缺少 index.html', error);
    }
}

/* ------------------------------------------------------------------ */
/* One‑shot flow: download → unzip → serve                            */
/* ------------------------------------------------------------------ */

export async function runOtaFlow(dispatch: AppDispatch, state: RootState) {
    try {
        const newVer = state.hotUpdate.newVersion;
        const folder = `update_${newVer}`;

        dispatch(SET_HOT_UPDATE_MODAL_PROGRESS(25));
        const buf = await downloadBuildZip();
        dispatch(SET_HOT_UPDATE_MODAL_PROGRESS(50));

        const json = await getDecrypt();
        const decryptedBuf = decryptAesCBC(buf, json);
        // const decryptedBuf = decryptAesCBC(buf);
        const slicedBuffer = (decryptedBuf.buffer as ArrayBuffer).slice(0, decryptedBuf.length);
        dispatch(SET_HOT_UPDATE_MODAL_PROGRESS(75));

        await unzipToCache(slicedBuffer, folder);

        // ✅ 清除舊版本快取
        await cleanOldCaches(newVer);

        // ✅ 儲存版本資訊
        await setLocalVersion(newVer);
        console.log("[✅] 已儲存 local version:", newVer);
        await Preferences.set({ key: `update_${newVer}`, value: 'true' });

        dispatch(SET_HOT_UPDATE_MODAL_PROGRESS(100));
        dispatch(SET_HOT_UPDATE_ENABLED(false));
        dispatch(SET_HOT_UPDATE_MODAL_PROGRESS(0));

        // ✅ 切換至新版本的本地資源路徑
        await startLocalServer(`${folder}/build`);
    } catch (err) {
        dispatch(SET_SHOW_HOT_UPDATE_MODAL(false));
        alert("⚠️ 更新失敗，將繼續使用舊版本");
        console.error('[OTA] update failed – keep old version', err);
    }
}

// 🔽 清除舊版本資料夾（非必要，但推薦）
async function cleanOldCaches(currentVersion: string) {
    const keys = await Preferences.keys();
    for (const key of keys.keys) {
        if (/^update_\d+\.\d+\.\d+/.test(key) && key !== `update_${currentVersion}`) {
            const folder = `${key}/build`;
            try {
                await Filesystem.rmdir({ path: folder, directory: Directory.Cache, recursive: true });
                await Preferences.remove({ key });
                console.log(`🧹 清除舊版本快取: ${key}`);
            } catch (e) {
                console.warn(`⚠️ 清除失敗: ${key}`, e);
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* App foreground listener                                            */
/* ------------------------------------------------------------------ */

export async function setupOtaChecker(dispatch: AppDispatch) {
    try {
        const ver = await needUpdate();
        if (ver) {
            dispatch(SET_SHOW_HOT_UPDATE_MODAL(true));
            dispatch(SET_NEW_VERSION(ver));
            console.log(`[OTA] updating to v${ver}`);
        } else {
            dispatch(SET_SHOW_HOT_UPDATE_MODAL(false));
        }
    } catch (err) {
        console.error('[OTA] update failed – keep old version', err);
    }
}

export async function checkCache(baseDir: string): Promise<string | null> {
    try {
        const { uri } = await Filesystem.stat({
            directory: Directory.Cache,
            path: `${baseDir}/index.html`
        });
        console.log('檔案存在:', uri);
        return uri;
    } catch (error) {
        console.warn('找不到檔案:', error);
        return null;
    }
}

export async function initHotUpdate(dispatch: AppDispatch) {
    try {
        const isNative = Capacitor.isNativePlatform();
        if (!isNative) {
            dispatch(SET_SHOW_HOT_UPDATE_MODAL(false));
            localStorage.setItem("newVersion", DEFAULT_VERSION);
            return;
        }
        let localVersion = await getLocalVersion(); // ✅ 總是透過 helper 取得版本

        if (!localVersion || localVersion === '') {
            localVersion = DEFAULT_VERSION;
            await setLocalVersion(localVersion);
            console.log("🆕 第一次啟動，設定為預設版本");
        }

        const cacheFolder = `update_${localVersion}/build`;
        const cachedFlag = (await Preferences.get({ key: `update_${localVersion}` })).value;

        // 檢查遠端版本
        const remoteVersion = await fetchRemoteVersion();
        if (isNewerVersion(remoteVersion, localVersion)) {
            console.log(`🚀 發現新版本：${remoteVersion}，本地版本：${localVersion}`);
            dispatch(SET_NEW_VERSION(remoteVersion));
            dispatch(SET_SHOW_HOT_UPDATE_MODAL(true));
            localStorage.setItem("newVersion", remoteVersion);
            return;
        }

        // 沒有新版本 → 檢查快取
        if (cachedFlag === "true") {
            const fileUri = await checkCache(cacheFolder);
            if (fileUri) {
                console.log("✅ 快取有效，使用快取版本");
                return dispatch(SET_SHOW_HOT_UPDATE_MODAL(false));
            } else {
                console.warn("⚠️ 快取標記存在，但實際遺失");
            }
        }

        // 無快取也無新版本 → 保守處理
        console.log("🔄 快取遺失，強制再檢查更新");
        await setupOtaChecker(dispatch);

    } catch (err) {
        console.error("❌ 初始化更新流程失敗:", err);
        dispatch(SET_SHOW_HOT_UPDATE_MODAL(false));
    }
}




