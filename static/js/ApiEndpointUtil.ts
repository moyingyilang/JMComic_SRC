import GlobalStore from "../config/GlobalStore";
import apiPaths from "./apiPaths";
import { decryptData } from "../utils/Function";
import { getRandomItems } from "../utils/Function";


export const getApiEndpoint = (key: keyof typeof apiPaths): string => {
    if (!GlobalStore.apiUrl) {
        throw new Error("API endpoints 尚未初始化");
    }

    return `${GlobalStore.apiUrl}${apiPaths[key]}`;
};

export const FETCH_HOST = async () => {
    const url = process.env.REACT_APP_HOST;
    const url_back_up = process.env.REACT_APP_HOST_BACKUP;
    const url_sec_back_up = process.env.REACT_APP_HOST_BACKUP_SECOND;
    const hostCode = process.env.REACT_APP_HOST_BACKUP_CODE;

    const urls = [url, url_back_up, url_sec_back_up].filter(Boolean);

    if (urls.length === 0) {
        console.warn("無效的 URL，請檢查 REACT_APP_HOST 和 REACT_APP_HOST_BACKUP 是否正確配置");
    }

    try {
        let response: Response | undefined;

        for (const u of urls) {
            try {
                response = await fetch(u!);
                if (response.ok) break;
                console.warn(`請求 ${u} 失敗，嘗試下一個 URL...`);
            } catch (err) {
                console.warn(`嘗試 ${u} 時出錯：`, err);
            }
        }

        // 如果有成功回應
        if (response && response.ok) {
            const text = await response.text();
            const data = await decryptData(text);

            const { items } = getRandomItems(data.Server);
            const newUrl = `https://${items}/`;

            GlobalStore.apiUrl = newUrl;
            GlobalStore.hostServer = data.jm3_Server;

            return data;
        }

        // 所有 URL 請求失敗時，解密備援 hostCode
        console.warn("所有 URL 請求均失敗，改用備援 hostCode ...");

        const backupData = await decryptData(hostCode);
        const { items } = getRandomItems(backupData.Server);
        const newUrl = `https://${items}/`;

        GlobalStore.apiUrl = localStorage.getItem("apiUrl") || newUrl;
        GlobalStore.hostServer = backupData.jm3_Server;

        return backupData;

    } catch (error) {
        console.warn("載入資料失敗：" + (error as Error).message);
    }
};