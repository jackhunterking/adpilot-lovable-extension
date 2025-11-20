/**
 * Feature: Lovable Integration - Type Exports
 * Purpose: Central export point for extension types
 * 
 * NOTE: Types copied from adpilot/lib/types/lovable/
 * These are standalone copies for extension independence
 */

// Project types
export type {
  LovableProjectLink,
  LovableProjectMetadata,
  LinkProjectInput,
  LovableProjectContext,
  LovableImage,
  CampaignSnapshot,
  ServiceResult,
  ValidationResult,
} from './project';

// Bridge message types
export {
  BridgeMessageType,
  isBridgeMessage,
  isProjectContextMessage,
  isNewImagesMessage,
  isStartMonitoringMessage,
  isImportImageMessage,
  isErrorMessage,
} from './bridge-messages';

export type {
  BridgeMessage,
  ProjectContextMessage,
  NewImagesMessage,
  SupabaseDetectedMessage,
  SyncEventMessage,
  RequestContextMessage,
  StartMonitoringMessage,
  StopMonitoringMessage,
  ImportImageMessage,
  ErrorMessage,
  PingMessage,
  PongMessage,
} from './bridge-messages';

