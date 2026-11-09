import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/utils/locales";

/**
 * Where the confirmation email's link used to land (`?token=`). Since
 * 2026-10-28 the email carries a 6-digit code instead, entered on Confirm
 * Email, so an old link goes there, keeping any address or code it carries.
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const keep = new URLSearchParams();
  for (const key of ["email", "code"]) {
    const value = query[key];
    if (typeof value === "string") keep.set(key, value);
  }
  redirect(`/${locale}/confirm-email${keep.size ? `?${keep}` : ""}`);
}
