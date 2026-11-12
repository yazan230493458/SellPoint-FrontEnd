"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { useUserStore } from "@/store/user.store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminAppSidebar from "./components/shell/AdminAppSidebar";
import AdminContextMenu from "./components/shell/AdminContextMenu";
import AdminSiteHeader from "./components/shell/AdminSiteHeader";
import DashboardLoadingState from "./components/layout/DashboardLoadingState";
import DashboardForbidden from "./components/layout/DashboardForbidden";
import DashboardLoadingHint from "./components/layout/DashboardLoadingHint";
import DashboardErrorBanner from "./components/layout/DashboardErrorBanner";
import DashboardEmptyState from "./components/layout/DashboardEmptyState";
import DashboardPagination from "./components/layout/DashboardPagination";
import DashboardConfirmDialog from "./components/layout/DashboardConfirmDialog";
import DashboardOverview from "./components/sections/DashboardOverview";
import DashboardUsers from "./components/sections/DashboardUsers";
import DashboardAds from "./components/sections/DashboardAds";
import DashboardReports from "./components/sections/DashboardReports";
import DashboardCategories from "./components/sections/DashboardCategories";
import DashboardSettings from "./components/sections/DashboardSettings";
import DashboardInbox from "./components/sections/DashboardInbox";
import DashboardComments from "./components/sections/DashboardComments";
import DashboardReviews from "./components/sections/DashboardReviews";
import DashboardBilling from "./components/sections/DashboardBilling";
import DashboardAudit from "./components/sections/DashboardAudit";
import { useDashboardData } from "./hooks/useDashboardData";

const DashboardClient = () => {
  const sessionReady = useUserStore((state) => state.sessionReady);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const role = useUserStore((state) => state.user?.role);
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useUserStore.persist.onFinishHydration(onStoreChange),
    () => useUserStore.persist.hasHydrated(),
    () => false,
  );

  const {
    section,
    setSection,
    query,
    setQuery,
    page,
    setPage,
    rows,
    stats,
    trends,
    trendDays,
    setTrendDays,
    loading,
    error,
    forbidden,
    note,
    setNote,
    categoryDraft,
    setCategoryDraft,
    pending,
    setPending,
    ask,
    act,
    refresh,
  } = useDashboardData({
    hydrated,
    sessionReady,
    isAuthenticated,
    role,
  });

  if (!hydrated || !sessionReady) {
    return <DashboardLoadingState />;
  }

  if (!isAuthenticated) return null;

  if (forbidden || (role && role !== "ADMIN" && role !== "OWNER")) {
    return <DashboardForbidden />;
  }

  const showPagination =
    section !== "overview" &&
    section !== "categories" &&
    section !== "settings";

  const showEmpty =
    !loading &&
    section !== "overview" &&
    section !== "categories" &&
    rows.length === 0;

  const openSection = (next: typeof section) => {
    setSection(next);
    setPage(1);
  };

  return (
    <TooltipProvider>
      <AdminContextMenu
        section={section}
        onRefresh={refresh}
        onSelectSection={openSection}
      >
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as CSSProperties
          }
        >
          <AdminAppSidebar
            variant="inset"
            section={section}
            onSelect={openSection}
          />
          <SidebarInset>
            <AdminSiteHeader
              section={section}
              query={query}
              onQueryChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              onOpenReports={() => openSection("reports")}
            />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
                  {loading ? <DashboardLoadingHint /> : null}
                  {error ? <DashboardErrorBanner message={error} /> : null}

                  {section === "overview" && stats ? (
                    <DashboardOverview
                      stats={stats}
                      trends={trends}
                      trendDays={trendDays}
                      onTrendDaysChange={setTrendDays}
                    />
                  ) : null}

                  {showEmpty ? <DashboardEmptyState /> : null}

                  <div className="space-y-3">
                    {section === "users" || section === "administrators" ? (
                      <DashboardUsers rows={rows} role={role} ask={ask} />
                    ) : null}

                    {section === "advertisements" ? (
                      <DashboardAds rows={rows} ask={ask} />
                    ) : null}

                    {section === "reports" ? (
                      <DashboardReports
                        rows={rows}
                        note={note}
                        onNoteChange={setNote}
                        ask={ask}
                      />
                    ) : null}

                    {section === "inbox" ? (
                      <DashboardInbox rows={rows} ask={ask} />
                    ) : null}

                    {section === "categories" ? (
                      <DashboardCategories
                        rows={rows}
                        draft={categoryDraft}
                        setDraft={setCategoryDraft}
                        act={act}
                        ask={ask}
                      />
                    ) : null}

                    {section === "comments" ? (
                      <DashboardComments rows={rows} ask={ask} />
                    ) : null}

                    {section === "reviews" ? (
                      <DashboardReviews rows={rows} ask={ask} />
                    ) : null}

                    {section === "subscriptions" ? (
                      <DashboardBilling rows={rows} kind="subscriptions" />
                    ) : null}

                    {section === "payments" ? (
                      <DashboardBilling rows={rows} kind="payments" />
                    ) : null}

                    {section === "settings" ? (
                      <DashboardSettings rows={rows} role={role} act={act} />
                    ) : null}

                    {section === "audit" ? <DashboardAudit rows={rows} /> : null}
                  </div>

                  {showPagination ? (
                    <DashboardPagination
                      page={page}
                      canGoNext={rows.length >= 10}
                      onPrevious={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      onNext={() => setPage((current) => current + 1)}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </SidebarInset>

          {pending ? (
            <DashboardConfirmDialog
              title={pending.title}
              onCancel={() => setPending(null)}
              onConfirm={() => void act(pending.run)}
            />
          ) : null}
        </SidebarProvider>
      </AdminContextMenu>
    </TooltipProvider>
  );
};

export default DashboardClient;
