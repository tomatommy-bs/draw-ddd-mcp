import { Injectable, Logger } from '@nestjs/common';
import { TMCommand, TMResponse } from './tm.types.js';

/**
 * Service for managing WebSocket communication with TM modeling client
 */
@Injectable()
export class TMClientService {
  private readonly logger = new Logger(TMClientService.name);
  private ws: any = null;
  private isSettingConnection = false;
  private pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (error: Error) => void; timeout: NodeJS.Timeout }
  >();
  private requestTimeout = 30000; // 30 seconds

  /**
   * Set the WebSocket connection
   * Closes any existing connection to ensure only one GUI is active at a time
   * Uses a lock to prevent race conditions from simultaneous connections
   */
  async setConnection(ws: any) {
    // Wait if another connection is being set up
    let waitCount = 0;
    while (this.isSettingConnection && waitCount < 20) {
      this.logger.warn(`Connection setup already in progress, waiting... (${waitCount + 1}/20)`);
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitCount++;
    }

    if (this.isSettingConnection) {
      this.logger.error('Connection setup timeout - forcing connection replacement');
      this.isSettingConnection = false;
    }

    this.isSettingConnection = true;

    try {
      // Close existing connection if present
      if (this.ws) {
        const oldWs = this.ws;
        const isOpen = oldWs.readyState === 1; // WebSocket.OPEN = 1

        if (isOpen) {
          this.logger.log('Closing previous TM client connection - new client connecting');
          oldWs.removeAllListeners();
          oldWs.close(1000, 'Replaced by new connection');
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          this.logger.debug(`Previous connection already closed (state: ${oldWs.readyState})`);
        }
      }

      this.ws = ws;
      this.logger.log('TM modeling client connected');

      // Setup message handler
      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);

          // Handle ping/pong heartbeat
          if (message.type === 'ping') {
            this.logger.debug('Received ping, sending pong');
            ws.send(JSON.stringify({ type: 'pong' }));
            return;
          }

          // Handle normal command responses
          const response: TMResponse = message;
          this.handleResponse(response);
        } catch (error) {
          this.logger.error('Failed to parse message from TM client:', error);
        }
      });

      // Setup close handler
      ws.on('close', () => {
        this.logger.log('TM modeling client disconnected');
        this.ws = null;
        // Reject all pending requests
        this.pendingRequests.forEach(({ reject, timeout }) => {
          clearTimeout(timeout);
          reject(new Error('TM modeling client disconnected'));
        });
        this.pendingRequests.clear();
      });
    } finally {
      this.isSettingConnection = false;
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === 1;
  }

  /**
   * Send a command to TM client and wait for response
   */
  async sendCommand<T = any>(
    command: string,
    params: Record<string, any> = {},
    timeoutMs?: number,
  ): Promise<T> {
    if (!this.isConnected()) {
      throw new Error(
        'TM modeling client is not connected. Make sure the TM modeling frontend is running with remote control enabled.',
      );
    }

    const id = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: TMCommand = { id, command, params };
    const effectiveTimeout = timeoutMs ?? this.requestTimeout;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Command ${command} timed out after ${effectiveTimeout}ms`));
      }, effectiveTimeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      try {
        this.ws.send(JSON.stringify(message));
        this.logger.debug(`Sent command: ${command} (${id})`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      }
    });
  }

  /**
   * Handle response from TM client
   */
  private handleResponse(response: TMResponse) {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      this.logger.warn(`Received response for unknown request: ${response.id}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.success) {
      this.logger.debug(`Command ${response.id} succeeded`);
      pending.resolve(response.data);
    } else {
      this.logger.error(`Command ${response.id} failed: ${response.error}`);
      pending.reject(new Error(response.error || 'Unknown error'));
    }
  }

  // --- Domain-specific methods ---

  /**
   * Get the current diagram state
   */
  async getDiagram() {
    return this.sendCommand('getDiagram');
  }

  /**
   * Add an entity (Resource or Event) to the diagram
   */
  async addEntity(data: any, addToHistory = true) {
    return this.sendCommand('addEntity', { data, addToHistory });
  }

  /**
   * Update an entity
   */
  async updateEntity(id: string, updates: any) {
    return this.sendCommand('updateEntity', { id, updates });
  }

  /**
   * Delete an entity
   */
  async deleteEntity(id: string, addToHistory = true) {
    return this.sendCommand('deleteEntity', { id, addToHistory });
  }

  /**
   * Add an attribute to an entity
   */
  async addAttribute(entityId: string, attribute: any) {
    return this.sendCommand('addAttribute', { entityId, attribute });
  }

  /**
   * Update an attribute
   */
  async updateAttribute(entityId: string, attributeId: string, updates: any) {
    return this.sendCommand('updateAttribute', { entityId, attributeId, updates });
  }

  /**
   * Delete an attribute
   */
  async deleteAttribute(entityId: string, attributeId: string, addToHistory = true) {
    return this.sendCommand('deleteAttribute', { entityId, attributeId, addToHistory });
  }

  /**
   * Add a reference between entities
   */
  async addReference(data: any, addToHistory = true) {
    return this.sendCommand('addReference', { data, addToHistory });
  }

  /**
   * Update a reference
   */
  async updateReference(id: string, updates: any) {
    return this.sendCommand('updateReference', { id, updates });
  }

  /**
   * Delete a reference
   */
  async deleteReference(id: string, addToHistory = true) {
    return this.sendCommand('deleteReference', { id, addToHistory });
  }

  /**
   * Add a note
   */
  async addNote(data: any, addToHistory = true) {
    return this.sendCommand('addNote', { data, addToHistory });
  }

  /**
   * Update a note
   */
  async updateNote(id: string, updates: any) {
    return this.sendCommand('updateNote', { id, updates });
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string, addToHistory = true) {
    return this.sendCommand('deleteNote', { id, addToHistory });
  }

  /**
   * Import a complete diagram from JSON
   */
  async importDiagram(diagram: any, clearCurrent = true) {
    return this.sendCommand('importDiagram', { diagram, clearCurrent });
  }

  /**
   * Get a specific entity by ID or name
   */
  async getEntity(entityId?: string, entityName?: string) {
    return this.sendCommand('getEntity', { entityId, entityName });
  }

  /**
   * Get all entities with optional filter
   */
  async getEntities(type?: string, subtype?: string) {
    return this.sendCommand('getEntities', { type, subtype });
  }

  /**
   * Auto-layout the diagram
   */
  async autoLayout(strategy: string) {
    return this.sendCommand('autoLayout', { strategy });
  }

  async addTerm(data: any) {
    return this.sendCommand('addTerm', { data });
  }

  async updateTerm(id: string, updates: any) {
    return this.sendCommand('updateTerm', { id, updates });
  }

  async deleteTerm(id: string) {
    return this.sendCommand('deleteTerm', { id });
  }

  async listTerms() {
    return this.sendCommand('listTerms', {});
  }

  /**
   * Prompt the user in the browser GUI and wait for their response.
   * Uses a 5-minute timeout since this requires human interaction.
   */
  async promptUser(prompt: {
    title: string;
    message: string;
    type: 'select' | 'text' | 'confirm';
    options?: string[];
  }) {
    return this.sendCommand('promptUser', prompt, 5 * 60 * 1000);
  }
}
