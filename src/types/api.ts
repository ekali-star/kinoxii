export interface ApiResponse<T> {
  data: T
}

export interface MessageResponse {
  message: string
}

export interface ValidationErrorResponse extends MessageResponse {
  errors: Record<string, string[]>
}
