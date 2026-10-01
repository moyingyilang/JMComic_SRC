
import CryptoJS from "crypto-js";
import md5 from "md5";
import GlobalStore from "../config/GlobalStore";
import { getTaipeiTimeString } from "../utils/Function";
import { showErrorModal } from "../utils/showErrorModal";
import apiPaths from "./apiPaths";

const maxRetries = 3;
let getRetryCount = 0;
let postRetryCount = 0;

const version = process.env.REACT_APP_VERSION;
let d1 = new Date();
let gmtTime = new Date(d1.toUTCString());
let time = Math.floor(gmtTime.getTime() / 1000);
export let tokenParam = time + "," + version;
export let token = md5(String(time) + apiPaths.token);

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

const fetchWithTimeout = (url: string, method: string, fetchPromise: Promise<Response>): Promise<Response> => {
    const TIMEOUT = 15000;
    const defaultErrorMsg = `${method} 發生錯誤(timeout)，請回報管理員 \n\n現在時間：${getTaipeiTimeString()} ,\nsource=${getApiHostInfo()?.hostName}\nkey=${parseUrl(url)}\n\n＊目前版本為 ${version} 版，最新版本為 ${version} 版\n\n若仍有問題請截圖到官方Discord群\nhttps://discord.gg/V74p7HM\n#網站與app問題回報\n\n`;
    return Promise.race([
        fetchPromise,
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error(defaultErrorMsg)), TIMEOUT)
        ),
    ]);
};

const buildErrorMsg = (method: string, url: string) =>
    `${method} 發生錯誤，請回報管理員 \n\n現在時間：${getTaipeiTimeString()} ,\nsource=${getApiHostInfo()?.hostName}\nkey=${parseUrl(url)}\n\n＊目前版本為 ${version} 版，最新版本為 ${version} 版\n\n若仍有問題請截圖到官方Discord群\nhttps://discord.gg/V74p7HM\n#網站與app問題回報\n\n`;

const HttpUtil = {
    fetchImage: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (result: string | Record<string, any>) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {
        const filteredParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
        const searchParams = new URLSearchParams(filteredParams);
        const fullUrl = Object.keys(filteredParams).length ? `${url}?${searchParams.toString()}` : url;

        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetchWithTimeout(
                fullUrl,
                "GET",
                fetch(fullUrl, {
                    credentials: "include",
                    referrerPolicy: "no-referrer",
                    headers: {
                        "Tokenparam": tokenParam,
                        "Token": token,
                        "Authorization": jwttoken ? `Bearer ${jwttoken}` : "",
                        "Cookie": memberInfo ? `AVS=${memberInfo?.s}` : "",
                    },
                }),
            );

            if (!response.ok) {
                const msg = buildErrorMsg("GET", fullUrl);
                failCallback(`${response.status}\n${msg}`);
                return;
            }

            const blob = await response.blob();
            successCallback(URL.createObjectURL(blob));
        } catch (error: any) {
            failCallback(error);
            throw new Error(error?.message || error);
        }
    },
    fetchGet: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (responseObj: any) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {
        const filteredParams = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
        const searchParams = new URLSearchParams(filteredParams);
        if (!searchParams.has("lang")) {
            searchParams.set("lang", localStorage.getItem("lang") || "TW");
        }
        url += "?" + searchParams.toString();
        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetchWithTimeout(
                url,
                "GET",
                fetch(url, {
                    credentials: "include",
                    referrerPolicy: "no-referrer",
                    headers: {
                        "Tokenparam": tokenParam,
                        "Token": token,
                        "Authorization": jwttoken ? `Bearer ${jwttoken}` : "",
                        "Cookie": memberInfo ? `AVS=${memberInfo?.s}` : "",
                    },
                }),
            );

            if (!response.ok && response.status !== 401) {
                const msg = buildErrorMsg("GET", url);
                if (getRetryCount < maxRetries) {
                    getRetryCount++;
                    failCallback(`${response.status}\n${msg}`);
                    HttpUtil.fetchGet(url, {}, successCallback, failCallback);
                    return;
                }
                failCallback(`達到最大重試次數\n${msg}`);
                showErrorModal(url, `${response.status}\n${msg}`);
            }

            await tryDecryption(response, successCallback, url);

        } catch (error: any) {
            failCallback(error);
            const errorMessage = error?.message || error;
            if (errorMessage.includes("timeout")) {
                showErrorModal(url, `錯誤：${errorMessage}`);
            }
            throw new Error(errorMessage);
        }

    },
    fetchPost: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (responseObj: any) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {

        const formData = new FormData();
        Object.entries(params).forEach(([key, value]) => formData.append(key, value));
        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetchWithTimeout(
                url,
                "POST",
                fetch(url, {
                    method: "POST",
                    credentials: "include",
                    referrerPolicy: "no-referrer",
                    headers: {
                        "Tokenparam": tokenParam,
                        "Token": token,
                        "Authorization": jwttoken ? `Bearer ${jwttoken}` : "",
                        "Cookie": memberInfo ? `AVS=${memberInfo?.s}` : "",
                    },
                    body: formData,
                }),
            );

            // 400 是業務邏輯/驗證錯誤（如驗證碼錯誤、重複回報），不重試，直接把回應內容交給 successCallback 讓上層依 code/errorMsg 處理
            if (!response.ok && response.status !== 401 && response.status !== 400) {
                const msg = buildErrorMsg("POST", url);
                if (postRetryCount < maxRetries) {
                    postRetryCount++;
                    failCallback(`${response.status}\n${msg}`);
                    HttpUtil.fetchPost(url, {}, successCallback, failCallback);
                    return;
                }
                failCallback(`達到最大重試次數\n${msg}`);
                showErrorModal(url, `${response.status}\n${msg}`);
            }

            await tryDecryption(response, successCallback, url);

        } catch (error: any) {
            failCallback(error);
            const errorMessage = error?.message || error;
            if (errorMessage.includes("timeout")) {
                showErrorModal(url, errorMessage);
            }
            throw new Error(errorMessage);
        }
    },
    // 給需要真正 JSON body（Content-Type: application/json，而非 multipart/form-data）的 API 用，
    // 例如 body 裡帶陣列/巢狀物件的情況
    fetchPostJson: async (
        url: string,
        params: Record<string, any> = {},
        successCallback: (responseObj: any) => void,
        failCallback: (error: any) => void,
    ): Promise<any> => {
        try {
            const jwttoken = JSON.parse(localStorage.getItem("jwttoken") as string) || "";
            const memberInfo = JSON.parse(localStorage.getItem("memberInfo") as string) || "";

            const response = await fetchWithTimeout(
                url,
                "POST",
                fetch(url, {
                    method: "POST",
                    credentials: "include",
                    referrerPolicy: "no-referrer",
                    headers: {
                        "Content-Type": "application/json",
                        "Tokenparam": tokenParam,
                        "Token": token,
                        "Authorization": jwttoken ? `Bearer ${jwttoken}` : "",
                        "Cookie": memberInfo ? `AVS=${memberInfo?.s}` : "",
                    },
                    body: JSON.stringify(params),
                }),
            );

            // 400 是業務邏輯/驗證錯誤，不重試，直接把回應內容交給 successCallback 讓上層依 status/msg 處理
            if (!response.ok && response.status !== 401 && response.status !== 400) {
                const msg = buildErrorMsg("POST", url);
                if (postRetryCount < maxRetries) {
                    postRetryCount++;
                    failCallback(`${response.status}\n${msg}`);
                    HttpUtil.fetchPostJson(url, params, successCallback, failCallback);
                    return;
                }
                failCallback(`達到最大重試次數\n${msg}`);
                showErrorModal(url, `${response.status}\n${msg}`);
            }

            await tryDecryption(response, successCallback, url);

        } catch (error: any) {
            failCallback(error);
            const errorMessage = error?.message || error;
            if (errorMessage.includes("timeout")) {
                showErrorModal(url, errorMessage);
            }
            throw new Error(errorMessage);
        }
    },
};

export default HttpUtil;






