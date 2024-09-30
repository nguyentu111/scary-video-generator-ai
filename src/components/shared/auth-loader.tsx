"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

export const AuthLoader = ({
  children,
  authLoading,
  unauthenticated,
}: {
  children: React.ReactNode;
  authLoading?: React.ReactNode;
  unauthenticated?: React.ReactNode;
}) => {
  return (
    <>
      {authLoading && <AuthLoading>{authLoading}</AuthLoading>}
      <Authenticated>{children}</Authenticated>
      {unauthenticated && <Unauthenticated>{unauthenticated}</Unauthenticated>}
    </>
  );
};
