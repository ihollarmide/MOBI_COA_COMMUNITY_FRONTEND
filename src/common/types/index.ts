export interface ApiErrorResponse {
  // data: {
  // error: {
  //   code: number;
  //   message: string[];
  //   type: string;
  //   timestamp: string;
  //   path: string;
  //   method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  // };
  data: string;
  message: string;
  status: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: boolean;
}
