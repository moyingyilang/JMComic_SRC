
import CryptoJS from "crypto-js";
import md5 from "md5";
import { showErrorModal } from "../utils/showErrorModal";
import { getTaipeiTimeString } from "../utils/Function";
import apiPaths from "./apiPaths";
import GlobalStore from "../config/GlobalStore";

const maxRetries = 3;
let getRetryCount = 0;
let postRetryCount = 0;

const version = process.env.REACT_APP_VERSION;
let d1 = new Date();
let gmtTime = new Date(d1.toUTCString());
let time = Math.floor(gmtTime.getTime() / 1000);
let tokenParam = time + "," + version;
let token = md5(String(time) + apiPaths.token);

export const tryDecryption = async (response: any, successCallback: (responseObj: any) => void, url: string) => {
    const responseObj = await response.json();
    const possibleKeys = [
        [49, 56, 53, 72, 99, 111, 109, 105, 99, 51, 80, 65, 80, 80, 55, 82],
        [49, 56, 99, 111, 109, 105, 99, 65, 80, 80, 67, 111, 110, 116, 101, 110, 116],
    ];
    let decryptionSuccessful = false;
    for (const key of possibleKeys) {
        const content = String.fromCharCode.apply(null, key);
        const adKey = ["ad_content_all", "advertise_all"];
        const searchTerm = adKey.some(term => url.includes(term));
        const keyToTry = searchTerm ? md5(content) : md5(time + content);
        const keyObj = CryptoJS.enc.Utf8.parse(keyToTry);
        try {
            const decrypt = CryptoJS.AES.decrypt(responseObj.data, keyObj, {
                mode: CryptoJS.mode.ECB,
            });
            const decryptedData = decrypt.toString(CryptoJS.enc.Utf8);

            try {
                responseObj.data = JSON.parse(decryptedData);
                decryptionSuccessful = true;
                break;
            } catch (e) { }
        } catch (e) { }
    }
    if (!decryptionSuccessful) {
        responseObj.data = "";
    }
    successCallback(responseObj);
};

const parseUrl = (inputUrl: string) => {
    const urlObj = new URL(inputUrl);
    const path = urlObj.pathname;
    const lastSegment = path.split('/').filter(Boolean).pop() || "";

    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return lastSegment;
};

const getApiHostInfo = () => {
    const apiHost = new URL(GlobalStore.apiUrl).host;
    const match = GlobalStore.hostServer.find(([host, label]: [string, string]) => host === apiHost);
    return {
        hostName: match?.[1] ?? null,
    };
};

const HttpUtil = {
    fetchGet: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (responseObj: any) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {
        if (params) {
            const paramsBody = Object.keys(params)
                .reduce((a: string[], k: string) => {
                    a.push(k + "=" + encodeURIComponent(params[k]));
                    return a;
                }, [])
                .join("&");

            if (paramsBody) {
                url += "?" + paramsBody;
            }
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetch(url, {
                credentials: 'include',
                signal: controller.signal,
                headers: {
                    "Cookie": "AVS=" + memberInfo?.s,
                    "Tokenparam": tokenParam,
                    "Token": token,
                    "Authorization": `Bearer ${jwttoken}`,
                },
            });

            clearTimeout(timeout);

            if (!response.ok && response.status !== 401) {
                const error = new Error("HTTP error") as any;
                error.statusCode = response.status;
                error.retryLimitReached = getRetryCount >= maxRetries;
                throw error;
            }

            await tryDecryption(response, successCallback, url);

        } catch (error: any) {
            clearTimeout(timeout);
            const statusCode = error?.statusCode ?? "未知";
            const errorMsg = `Get 發生錯誤，狀態碼：${statusCode} 請回報管理員 \n\n現在時間：${getTaipeiTimeString()} ,\nsource=${getApiHostInfo()?.hostName}\nkey=${parseUrl(url)}\n\n＊目前版本為 ${version} 版，最新版本為 ${version} 版\n\n若仍有問題請截圖到官方Discord群\nhttps://discord.gg/V74p7HM\n#網站與app問題回報\n\n`;

            if (error.name === "AbortError") {
                failCallback("請求逾時 (Timeout)");
                showErrorModal("請求逾時 (Timeout)\n" + errorMsg);
            } else if (error.retryLimitReached) {
                failCallback("達到最大重試次數");
                showErrorModal(errorMsg);
            } else {
                getRetryCount++;
                failCallback(errorMsg);
                return HttpUtil.fetchGet(url, {}, successCallback, failCallback);
            }
        }
    },
    fetchPost: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (responseObj: any) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {
        const formData = new FormData();

        if (Object.keys(params).length > 0) {
            Object.entries(params).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                signal: controller.signal,
                headers: {
                    "Cookie": "AVS=" + memberInfo?.s,
                    "Tokenparam": tokenParam,
                    "Token": token,
                    "Authorization": `Bearer ${jwttoken}`,
                },
                body: formData,
            });

            clearTimeout(timeout);

            if (!response.ok && response.status !== 401) {
                const error = new Error("HTTP error") as any;
                error.statusCode = response.status;
                error.retryLimitReached = getRetryCount >= maxRetries;
                throw error;
            }

            await tryDecryption(response, successCallback, url);

        } catch (error: any) {
            clearTimeout(timeout);
            const statusCode = error?.statusCode ?? "未知";
            const errorMsg = `POST 發生錯誤，狀態碼：${statusCode} 請回報管理員 \n\n現在時間：${getTaipeiTimeString()} ,\nsource=${getApiHostInfo()?.hostName}\nkey=${parseUrl(url)}\n\n＊目前版本為 ${version} 版，最新版本為 ${version} 版\n\n若仍有問題請截圖到官方Discord群\nhttps://discord.gg/V74p7HM\n#網站與app問題回報\n\n`;

            if (error.name === "AbortError") {
                failCallback("請求逾時 (Timeout)");
                showErrorModal("請求逾時 (Timeout)\n" + errorMsg);
            } else if (error.retryLimitReached) {
                failCallback("達到最大重試次數");
                showErrorModal(errorMsg);
            } else {
                getRetryCount++;
                failCallback(errorMsg);
                return HttpUtil.fetchGet(url, {}, successCallback, failCallback);
            }
        }
    },
};

export default HttpUtil;






