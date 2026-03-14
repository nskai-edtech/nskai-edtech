"use client";

import { create } from "zustand";

export type ConnectionState =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected"
    | "failed";

interface LiveStreamState {
    connectionState: ConnectionState;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    remoteUserCount: number;
    error: string | null;
}

interface LiveStreamActions {
    setConnectionState: (state: ConnectionState) => void;
    setVideoEnabled: (enabled: boolean) => void;
    setAudioEnabled: (enabled: boolean) => void;
    setRemoteUserCount: (count: number) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export type LiveStreamStore = LiveStreamState & LiveStreamActions;

const initialState: LiveStreamState = {
    connectionState: "idle",
    isVideoEnabled: true,
    isAudioEnabled: true,
    remoteUserCount: 0,
    error: null,
};

export const useLiveStreamStore = create<LiveStreamStore>((set) => ({
    ...initialState,

    setConnectionState: (connectionState) => set({ connectionState }),
    setVideoEnabled: (isVideoEnabled) => set({ isVideoEnabled }),
    setAudioEnabled: (isAudioEnabled) => set({ isAudioEnabled }),
    setRemoteUserCount: (remoteUserCount) => set({ remoteUserCount }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
