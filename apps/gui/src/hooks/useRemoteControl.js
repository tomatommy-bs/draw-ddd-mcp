import { useEffect, useRef, useCallback, useState } from "react";
import { useDiagram } from "../context/DiagramContext";

export function useRemoteControl(enabled = false) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const ctx = useDiagram();
  const ctxRef = useRef(ctx);

  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);

  const sendResponse = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const respondToPrompt = useCallback(
    (response) => {
      if (pendingPrompt) {
        sendResponse({ id: pendingPrompt.id, success: true, data: response });
        setPendingPrompt(null);
      }
    },
    [pendingPrompt, sendResponse],
  );

  const handleCommand = useCallback(
    (message) => {
      const { id, command, params } = message;
      const c = ctxRef.current;

      try {
        let data;
        switch (command) {
          case "addEntity":
            data = c.addEntity(params.data || params);
            break;
          case "updateEntity":
            data = c.updateEntity(params.id || params.entityId, params.updates || params);
            break;
          case "deleteEntity":
            c.deleteEntity(params.id || params.entityId);
            data = { deleted: params.id || params.entityId };
            break;
          case "addAttribute":
            data = c.addAttribute(params.entityId, params.attribute || params);
            break;
          case "updateAttribute":
            data = c.updateAttribute(
              params.entityId,
              params.attributeId,
              params.updates || params,
            );
            break;
          case "deleteAttribute":
            c.deleteAttribute(params.entityId, params.attributeId);
            data = { deleted: params.attributeId };
            break;
          case "setIdentifier":
            c.setIdentifier(params.entityId, params.attributeIds);
            data = { entityId: params.entityId, attributeIds: params.attributeIds };
            break;
          case "addReference":
            data = c.addReference(params.data || params);
            break;
          case "updateReference":
            data = c.updateReference(params.id || params.referenceId, params.updates || params);
            break;
          case "deleteReference":
            c.deleteReference(params.id || params.referenceId);
            data = { deleted: params.id || params.referenceId };
            break;
          case "addNote":
            data = c.addNote(params.data || params);
            break;
          case "updateNote":
            data = c.updateNote(params.id || params.noteId, params.updates || params);
            break;
          case "deleteNote":
            c.deleteNote(params.id || params.noteId);
            data = { deleted: params.id || params.noteId };
            break;
          case "getEntity": {
            const diagram = c.getDiagram();
            const found = diagram.entities.find(
              (e) =>
                (params.entityId && e.id === params.entityId) ||
                (params.entityName && e.name === params.entityName),
            );
            if (!found) throw new Error("Entity not found");
            data = found;
            break;
          }
          case "getEntities": {
            const all = c.getDiagram();
            let filtered = all.entities;
            if (params.type) filtered = filtered.filter((e) => e.type === params.type);
            if (params.subtype) filtered = filtered.filter((e) => e.subtype === params.subtype);
            data = filtered;
            break;
          }
          case "getDiagram":
          case "exportDiagram":
            data = c.getDiagram();
            break;
          case "importDiagram":
            c.importDiagram(params.diagram, params.clearCurrent);
            data = { imported: true };
            break;
          case "autoLayout":
            c.autoLayout(params?.strategy);
            data = { layoutApplied: true };
            break;
          case "validateModel":
            data = c.validateModel();
            break;
          case "addTerm":
            data = c.addTerm(params.data || params);
            break;
          case "updateTerm":
            data = c.updateTerm(params.id || params.termId, params.updates || params);
            break;
          case "deleteTerm":
            c.deleteTerm(params.id || params.termId);
            data = { deleted: params.id || params.termId };
            break;
          case "listTerms":
            data = { terms: c.getDiagram().terms || [] };
            break;
          case "setHighlight":
            c.setUsecaseHighlight(params);
            data = { highlighted: true };
            break;
          case "clearHighlight":
            c.clearUsecaseHighlight();
            data = { cleared: true };
            break;
          case "activateUsecase":
            c.activateUsecase(params.id);
            data = { activated: params.id };
            break;
          case "deleteUsecase":
            c.deleteUsecase(params.id);
            data = { deleted: params.id };
            break;
          case "listUsecases":
            data = { usecases: c.usecases || [] };
            break;
          case "promptUser":
            setPendingPrompt({ id, ...params });
            return;
          default:
            throw new Error(`Unknown command: ${command}`);
        }

        sendResponse({ id, success: true, data });
      } catch (error) {
        console.error(`[RemoteControl] Error executing ${command}:`, error);
        sendResponse({ id, success: false, error: error.message });
      }
    },
    [sendResponse],
  );

  useEffect(() => {
    if (!enabled) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const defaultWsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/remote-control`;
    const wsUrl = import.meta.env.VITE_REMOTE_CONTROL_WS || defaultWsUrl;

    const maxReconnectAttempts = 10;
    const baseDelay = 1000;
    const maxDelay = 30000;

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      console.log("[RemoteControl] Connecting to backend...");
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[RemoteControl] Connected to backend");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "pong") return;
          handleCommand(message);
        } catch (error) {
          console.error("[RemoteControl] Failed to parse message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[RemoteControl] WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("[RemoteControl] Disconnected from backend", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        const wasReplaced = event.code === 1000 && event.reason === "Replaced by new connection";
        if (wasReplaced) {
          console.log("[RemoteControl] Connection taken over by another session");
          reconnectAttemptsRef.current = maxReconnectAttempts;
          return;
        }

        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const exponentialDelay = Math.min(
            baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1),
            maxDelay,
          );
          const jitter = Math.random() * 1000;
          const delay = exponentialDelay + jitter;

          console.log(
            `[RemoteControl] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`,
          );

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error("[RemoteControl] Max reconnection attempts reached");
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      setIsConnected(false);
    };
  }, [enabled, handleCommand, sendResponse]);

  return { isConnected, send: sendResponse, pendingPrompt, respondToPrompt };
}

export default useRemoteControl;
