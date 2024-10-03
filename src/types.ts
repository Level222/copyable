import { z } from 'zod';

export const ConfigStorage = z.object({
  patterns: z.array(z.string()),
  eventTypes: z.array(z.string()),
  css: z.string(),
  cssOrigin: z.enum(['USER', 'AUTHOR']),
});

export type ConfigStorage = z.infer<typeof ConfigStorage>;

export const SyncStorage = z.object({
  version: z.literal(1),
  config: ConfigStorage,
});

export type SyncStorage = z.infer<typeof SyncStorage>;

export const SyncStoragePartial = SyncStorage.partial();

export type SyncStoragePartial = z.infer<typeof SyncStoragePartial>;

export const UpdateCSSMessage = z.object({
  type: z.literal('UPDATE_CSS'),
  action: z.enum(['INSERT', 'REMOVE']),
  css: ConfigStorage.shape.css,
  cssOrigin: ConfigStorage.shape.cssOrigin,
});

export type UpdateCSSMessage = z.infer<typeof UpdateCSSMessage>;

export const RuntimeMessage = UpdateCSSMessage;

export type RuntimeMessage = z.infer<typeof RuntimeMessage>;

export const CopyableInitEventDetail = z.object({
  messageEventType: z.string(),
});

export type CopyableInitEventDetail = z.infer<typeof CopyableInitEventDetail>;

export const UpdateEventTypesMessage = z.object({
  type: z.literal('UPDATE_EVENT_TYPES'),
  eventTypes: ConfigStorage.shape.eventTypes,
});

export type UpdateEventTypesMessage = z.infer<typeof UpdateEventTypesMessage>;

export const ContentMessage = UpdateEventTypesMessage;

export type ContentMessage = z.infer<typeof ContentMessage>;

export const CopyableMessageEventDetail = z.object({
  message: ContentMessage,
});

export type CopyableMessageEventDetail = z.infer<typeof CopyableMessageEventDetail>;
