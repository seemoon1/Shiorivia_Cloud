import { useState, useEffect } from "react";
import { Session, ChatFolder } from "../types";

export const useLocalFileSync = (isGlobalGenerating: boolean, showToast: (msg: string) => void) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [folders, setFolders] = useState<ChatFolder[]>([]);
    const [globalWorldInfo, setGlobalWorldInfo] = useState("");
    const [bgImage, setBgImage] = useState<string | null>(null);
    
    const [status, setStatus] = useState<'idle'|'success'|'error'>('idle');
    const [initLoaded, setInitLoaded] = useState(false);

    useEffect(() => {
        try {
            const localData = localStorage.getItem("shiorivia_cloud_storage");
            if (localData) {
                const parsed = JSON.parse(localData);
                setSessions(parsed.sessions || []);
                setFolders(parsed.folders || []);
                setGlobalWorldInfo(parsed.globalWorldInfo || "");
                setBgImage(parsed.bgImage || null);
            }
        } catch (e) {
            console.error("读取浏览器记忆失败", e);
            showToast("⚠️ 本地数据损坏！");
        } finally {
            setInitLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!initLoaded || isGlobalGenerating) return;

        const timer = setTimeout(() => {
            try {
                const payload = { sessions, folders, globalWorldInfo, bgImage };
                localStorage.setItem("shiorivia_cloud_storage", JSON.stringify(payload));
            } catch (e) {
                console.error("存储空间不足", e);
                showToast("❌ 浏览器存储已满！请立刻导出 JSON 备份！");
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [sessions, folders, globalWorldInfo, bgImage, initLoaded, isGlobalGenerating]);

    const performSync = () => {
        setStatus('success');
        showToast("💾 记忆已永久固化于本地终端");
        setTimeout(() => setStatus('idle'), 2000);
    };

    return {
        sessions, setSessions, folders, setFolders,
        globalWorldInfo, setGlobalWorldInfo, bgImage, setBgImage,
        status, initLoaded,
        triggerSync: performSync
    };
};