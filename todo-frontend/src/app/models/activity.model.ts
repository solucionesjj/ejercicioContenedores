export interface Activity {
  id: number;
  activity: string;
  status: 'To do' | 'Doing' | 'Done';
  insertDate: string;
  lastUpdateDate: string;
}

export interface CreateActivityRequest {
  activity: string;
  status?: 'To do' | 'Doing' | 'Done';
}

export interface UpdateActivityRequest {
  activity?: string;
  status?: 'To do' | 'Doing' | 'Done';
}

export interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ActivityResponse {
  success: boolean;
  message: string;
  data?: Activity;
}