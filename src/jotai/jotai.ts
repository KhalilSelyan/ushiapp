import { atom } from "jotai";

export const guestViewMessages = atom<
  {
    name: string;
    message: string;
  }[]
>([]);

export const hostViewMessages = atom<
  {
    name: string;
    message: string;
  }[]
>([]);
