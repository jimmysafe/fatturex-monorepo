"use client";
import { I18nextProvider } from "react-i18next";

import { ThemeProvider } from "@repo/ui/providers/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import i18n from "@/lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
  // mutationCache: new MutationCache({
  //   onError: (error: any) => {
  //     console.error(error);

  //     if (error?.name === "Error") {
  //       toast.error(error.message || "Ops! Qualcosa è andato storto.");
  //     }

  //     if (error?.name === "ZodError") {
  //       const err = error as TZSAError<any>;
  //       const issues = JSON.parse(err.data)?.issues as ZodIssue[];
  //       for (const issue of issues) {
  //         toast.error(`[${issue.path[0]}] - ${t(`zod:errors.${issue.code}`, { ...issue })}`);
  //       }
  //     }
  //   },
  // }),
});

export function AppProviders(props: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {props.children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
