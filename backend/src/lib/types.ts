import { ValidationError } from "elysia";

export type UnauthorizedError = {
  status: 401;
  value: {
    message: "Unauthorized";
  };
};

export type ApiError =
  | {
      status: number;
      value: {
        message: string;
      } & { [x: string]: any };
    }
  | UnauthorizedError
  | ValidationError;
