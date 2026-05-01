/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    admin?: {
      id: string;
      email: string;
      local_id: string;
    };
  }
}
