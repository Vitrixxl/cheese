import Elysia from "elysia";
import { User } from "../lib/auth";
import socket from "@shared/src/ws";
import { authMacro } from "@backend/macros/auth";

export const players = new Map();
export const games = new Map();
export const hubPlayers = new Map<string, User>();

const a = new Elysia().use(authMacro).ws("/ws", {
  open(a) {
    a.data.user;
  },
  auth: true,
});
