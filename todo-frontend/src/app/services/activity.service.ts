import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Activity, 
  ActivitiesResponse, 
  ActivityResponse, 
  CreateActivityRequest, 
  UpdateActivityRequest 
} from '../models/activity.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getActivities(status?: string, page: number = 1, limit: number = 10): Observable<ActivitiesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    return this.http.get<ActivitiesResponse>(this.apiUrl, { params });
  }

  createActivity(activityData: CreateActivityRequest): Observable<ActivityResponse> {
    return this.http.post<ActivityResponse>(this.apiUrl, activityData);
  }

  updateActivity(id: number, activityData: UpdateActivityRequest): Observable<ActivityResponse> {
    return this.http.put<ActivityResponse>(`${this.apiUrl}/${id}`, activityData);
  }

  deleteActivity(id: number): Observable<ActivityResponse> {
    return this.http.delete<ActivityResponse>(`${this.apiUrl}/${id}`);
  }
}