import { atom } from 'jotai';

export const pushSubAtom = atom<PushSubscription | null>(null);
