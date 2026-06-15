import { useEffect, useRef, useCallback, useState } from "react";
import { useDiagram } from "../context/DiagramContext";

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_RECONNECT_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

function getWsUrl() {
  const envUrl = import.meta.env.VITE_REMOTE_CONTROL_WS;
  if (envUrl) return envUrl;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/remote-control`;
}

export default function useRemoteControl() {
  const enabled =
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === "true" ||
    import.meta.env.VITE_REMOTE_CONTROL_ENABLED === true;

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const heartbeatTimer = useRef(null);
  const ctx = useDiagram();

  const handleCommand = useCallback(
    (command, params) => {
      try {
        let data;
        switch (command) {
          case "addEntity":
            data = ctx.addEntity(params.data || params);
            break;
          case "updateEntity":
            data = ctx.updateEntity(params.id || params.entityId, params.updates || params);
            break;
          case "deleteEntity":
            ctx.deleteEntity(params.id || params.entityId);
            data = { deleted: params.id || params.entityId };
            break;
          case "addAttribute":
            data = ctx.addAttribute(params.entityId, params.attribute || params);
            break;
          case "updateAttribute":
            data = ctx.updateAttribute(params.entityId, params.attributeId, params.updates || params);
            break;
          case "deleteAttribute":
            ctx.deleteAttribute(params.entityId, params.attributeId);
            data = { deleted: params.attributeId };
            break;
          case "setIdentifier":
            ctx.setIdentifier(params.entityId, params.attributeIds);
            data = { entityId: params.entityId, attributeIds: params.attributeIds };
            break;
          case "addReference":
            data = ctx.addReference(params.data || params);
            break;
          case "updateReference":
            data = ctx.updateReference(params.id || params.referenceId, params.updates || params);
            break;
          case "deleteReference":
            ctx.deleteReference(params.id || params.referenceId);
            data = { deleted: params.id || params.referenceId };
            break;
          case "addNote":
            data = ctx.addNote(params.data || params);
            break;
          case "updateNote":
            data = ctx.updateNote(params.id || params.noteId, params.updates || params);
            break;
          case "deleteNote":
            ctx.deleteNote(params.id || params.noteId);
            data = { deleted: params.id || params.noteId };
            break;
          case "getDiagram":
          case "exportDiagram":
            data = ctx.getDiagram();
            break;
          case "importDiagram":
            ctx.importDiagram(params.diagram, params.clearCurrent);
            data = { imported: true };
            break;
          case "autoLayout":
            ctx.autoLayout(params?.strategy);
            data = { layoutApplied: true };
            break;
          case "validateModel":
            data = ctx.validateModel();
            break;
          default:
            return { success: false, error: `Unknown command: ${command}` };
        }
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [ctx]
  );

  const connect = useCallback(() => {
    if (!enabled) return;

    const url = getWsUrl();
    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Start heartbeat
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "pong") return;

      if (msg.id && msg.command) {
        const result = handleCommand(msg.command, msg.params || {});
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ id: msg.id, ...result }));
        }
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearInterval(heartbeatTimer.current);
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled, handleCommand]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) return;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), MAX_RECONNECT_DELAY);
    reconnectAttempts.current += 1;
    clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(heartbeatTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
