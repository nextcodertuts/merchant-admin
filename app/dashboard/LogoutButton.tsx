"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { logout } from "../auth/actions";
import { PowerIcon } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button onClick={() => logout()}>
      <PowerIcon size={25} />
    </Button>
  );
}
