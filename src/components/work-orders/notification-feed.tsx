"use client";

import React, { useState, useEffect, useCallback } from "react";
import { NotificationHistoryResponseDTO } from "@/types/notifications";
import { publicNotificationService } from "@/services/public-notification.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCheck,
  Smartphone,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationFeedProps {
  workOrderId: string;
  securityCode: string;
}

/**
 * NotificationFeed Component:
 * Renders the real-time Notification Bell in the PWA header, displays unread badge count,
 * lists morning/offline synchronized historical alerts, and provides 1-click VAPID push enrollment.
 */
export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  workOrderId,
  securityCode,
}) => {
  const [notifications, setNotifications] = useState<NotificationHistoryResponseDTO[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isMarkingRead, setIsMarkingRead] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [pushState, setPushState] = useState<{
    isSubscribed: boolean;
    permission: NotificationPermission;
  }>({ isSubscribed: false, permission: "default" });

  /**
   * Fetches the notification timeline from the backend and checks current browser subscription state.
   */
  const fetchHistoryAndState = useCallback(async () => {
    if (!workOrderId || !securityCode || securityCode === "undefined") {
      setIsLoadingHistory(false);
      return;
    }
    try {
      const [historyData, subscriptionState] = await Promise.all([
        publicNotificationService.getHistory(workOrderId, securityCode),
        publicNotificationService.getSubscriptionState(),
      ]);

      // Ensure chronological ordering (newest first)
      const sortedHistory = [...historyData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sortedHistory);
      setPushState(subscriptionState);
    } catch (error) {
      console.error("[NotificationFeed] Failed to load notification history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [workOrderId, securityCode]);

  /**
   * Initialize Service Worker and subscribe to live postMessage events from sw.js
   */
  useEffect(() => {
    if (!workOrderId || !securityCode || securityCode === "undefined") {
      setTimeout(() => setIsLoadingHistory(false), 0);
      return;
    }

    // 1. Ensure service worker is registered
    publicNotificationService.registerServiceWorker().then(() => {
      fetchHistoryAndState();
    });

    // 2. Listen for live push messages forwarded from sw.js when PWA tab is active
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NEW_PUSH_NOTIFICATION") {
        toast.info(event.data.payload?.title || "Nueva Notificación", {
          description: event.data.payload?.body,
          icon: <BellRing className="w-4 h-4 text-tertiary animate-bounce" />,
        });
        // Refresh local history immediately
        fetchHistoryAndState();
      }
    };

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    // 3. Refresh sync when tab regains focus (e.g. returning to mobile browser in the morning)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchHistoryAndState();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchHistoryAndState, workOrderId, securityCode]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  /**
   * Calls mark-read endpoint on the Go backend and clears local badges.
   */
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingRead) return;
    setIsMarkingRead(true);
    try {
      await publicNotificationService.markAsRead(workOrderId, securityCode);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      toast.success("Notificaciones marcadas como leídas");
    } catch (error) {
      console.error("[NotificationFeed] Failed to mark notifications as read:", error);
      toast.error("Error al actualizar estado de notificaciones");
    } finally {
      setIsMarkingRead(false);
    }
  };

  /**
   * Triggers the VAPID WebPush subscription workflow or unsubscription.
   */
  const handleToggleSubscription = async () => {
    setIsSubscribing(true);
    try {
      if (pushState.isSubscribed) {
        const unsubscribed = await publicNotificationService.unsubscribePush();
        if (unsubscribed) {
          setPushState((prev) => ({ ...prev, isSubscribed: false }));
          toast.success("Alertas Push desactivadas");
        }
      } else {
        const subscribed = await publicNotificationService.requestAndSubscribe(
          workOrderId,
          securityCode
        );
        if (subscribed) {
          setPushState({ isSubscribed: true, permission: "granted" });
          toast.success("¡Dispositivo vinculado con éxito!", {
            description: "Recibirás alertas instantáneas cuando tu orden avance de estado.",
          });
        } else if (Notification.permission === "denied") {
          setPushState((prev) => ({ ...prev, permission: "denied" }));
          toast.error("Permiso bloqueado en el navegador", {
            description: "Debes habilitar las notificaciones desde el candado de la barra de direcciones.",
          });
        }
      }
    } catch (error) {
      console.error("[NotificationFeed] Subscription workflow failed:", error);
      toast.error("No se pudo completar la configuración de alertas");
    } finally {
      setIsSubscribing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "STATUS_CHANGE":
        return <Wrench className="w-4 h-4 text-tertiary shrink-0" />;
      case "DIAGNOSTIC_POINT":
        return <AlertCircle className="w-4 h-4 text-warning shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-tertiary shrink-0" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative bg-card/90 border-border hover:border-tertiary transition-all duration-200 h-9 w-9 rounded-full shadow-sm"
          title="Centro de Notificaciones y Alertas"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-tertiary animate-pulse" />
          ) : (
            <Bell className="h-4 w-4 text-foreground" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-tertiary-foreground shadow-md ring-2 ring-background animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[340px] sm:w-[400px] bg-card/95 backdrop-blur-xl border-border shadow-2xl rounded-2xl p-0 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="bg-secondary/40 border-b border-border/80 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-tertiary" />
            <h4 className="font-bold uppercase text-xs tracking-wider text-foreground">
              Historial de Alertas
            </h4>
            {unreadCount > 0 && (
              <Badge className="bg-tertiary/20 text-tertiary border-tertiary/30 text-[10px] px-1.5 py-0">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              className="h-7 px-2 text-[11px] font-mono uppercase text-tertiary hover:bg-tertiary/10"
              title="Marcar todo como leído"
            >
              {isMarkingRead ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
              )}
              Leídas
            </Button>
          )}
        </div>

        {/* WebPush Subscription Banner Card */}
        <div className="p-3 bg-secondary/20 border-b border-border/60">
          {pushState.isSubscribed ? (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-foreground">Dispositivo Vinculado</p>
                  <p className="text-[10px] text-typography font-mono">Alertas Push en Vivo activas</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSubscription}
                disabled={isSubscribing}
                className="h-7 text-[10px] text-typography hover:text-error hover:bg-error/10 uppercase font-mono"
              >
                {isSubscribing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BellOff className="w-3.5 h-3.5 mr-1" />}
                Apagar
              </Button>
            </div>
          ) : pushState.permission === "denied" ? (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-error/10 border border-error/30 text-xs text-error">
              <BellOff className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[11px] leading-tight">
                Permiso denegado. Habilita las notificaciones en tu navegador.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-tertiary/10 border border-tertiary/30">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-tertiary shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-foreground">¿Deseas avisos en tu móvil?</p>
                  <p className="text-[10px] text-typography font-mono">Recibe alertas al cambiar de estado</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleToggleSubscription}
                disabled={isSubscribing}
                className="h-7 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold text-[10px] tracking-wider uppercase px-2.5 shadow-sm shrink-0"
              >
                {isSubscribing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <BellRing className="w-3 h-3 mr-1" />
                    Activar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Notifications Timeline List */}
        <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40 p-2 space-y-1.5 custom-scrollbar">
          {isLoadingHistory ? (
            <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-typography">
              <Loader2 className="w-6 h-6 animate-spin text-tertiary" />
              <span className="text-xs font-mono uppercase">Sincronizando historial...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-typography px-4">
              <Bell className="w-8 h-8 text-typography/40" />
              <p className="text-xs font-medium text-foreground">No tienes alertas pendientes</p>
              <p className="text-[11px] font-mono text-typography/80">
                Las actualizaciones y observaciones del técnico aparecerán aquí en tiempo real.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card
                  key={item.id}
                  className={`p-3 border transition-all duration-200 ${
                    item.isRead
                      ? "bg-secondary/15 border-border/40 opacity-80"
                      : "bg-tertiary/5 border-tertiary/40 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                      {getNotificationIcon(item.type)}
                      <span className="line-clamp-1">{item.title}</span>
                    </div>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-tertiary shrink-0 animate-ping mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/90 mt-1.5 leading-relaxed font-sans pl-6 whitespace-pre-wrap">
                    {item.body}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/20 pl-6">
                    <span className="text-[10px] font-mono text-typography flex items-center gap-1">
                      <Clock className="w-3 h-3 text-typography/70" />
                      {formattedDate}
                    </span>
                    {item.targetUrl && (
                      <a
                        href={item.targetUrl}
                        className="text-[10px] font-mono text-tertiary hover:underline flex items-center gap-0.5"
                      >
                        Ver Detalle <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-secondary/30 border-t border-border/60 px-4 py-2 text-center">
          <p className="text-[10px] font-mono text-typography">
            Sincronización automática activa • Viking-APP PWA
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
