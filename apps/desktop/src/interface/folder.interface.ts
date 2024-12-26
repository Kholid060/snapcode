export interface FolderNewPayloadMetadata {
  id?: string;
  parentId?: string;
}
export interface FolderNewPayload {
  path: string;
  metadata?: FolderNewPayloadMetadata;
}
