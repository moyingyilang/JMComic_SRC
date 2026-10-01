const GlobalStore = {
    apiUrl: localStorage.getItem("apiUrl") || "",
    hostServer: JSON.parse(localStorage.getItem("hostServer") || "[]"),
    // FirstCover 測過的各線路延遲／吞吐量，讓 SpeedTest.tsx 沿用不用重測
    lineLatency: {} as Record<string, number | null>,
    lineDownloadSpeed: {} as Record<string, number | null>,
    lineImageLoadTime: {} as Record<string, number | null>,

    updateApiUrl(newApiUrl: string) {
        this.apiUrl = newApiUrl;
        localStorage.setItem("apiUrl", newApiUrl);
    },

    updateHostServer(newHostServer: any[]) {
        this.hostServer = newHostServer;
        localStorage.setItem("hostServer", JSON.stringify(newHostServer));
    },

    updateLineLatency(
        label: string,
        latency: number | null,
        downloadSpeed: number | null = null,
        imageLoadTime: number | null | undefined = undefined
    ) {
        this.lineLatency = { ...this.lineLatency, [label]: latency };
        this.lineDownloadSpeed = { ...this.lineDownloadSpeed, [label]: downloadSpeed };
        if (imageLoadTime !== undefined) {
            this.lineImageLoadTime = { ...this.lineImageLoadTime, [label]: imageLoadTime };
        }
    },
};

export default GlobalStore;
