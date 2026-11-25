import type { Metadata } from "next";
import { SettingsForm } from "@/components/account/settings-form";

export const metadata: Metadata = { title: "Настройки кабинета" };

export default function SettingsPage() {
  return <SettingsForm />;
}
