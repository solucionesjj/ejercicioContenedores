import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActivityService } from '../../services/activity.service';
import { Activity, CreateActivityRequest, UpdateActivityRequest } from '../../models/activity.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div class="container">
          <a class="navbar-brand" href="#">
            <i class="fas fa-tasks me-2"></i>
            To-Do List
          </a>
          <div class="navbar-nav ms-auto">
            <div class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i>
                {{ currentUser?.name || 'User' }}
              </a>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div class="container">
        <!-- Header Section -->
        <div class="row mb-4">
          <div class="col-12">
            <h1 class="h3 mb-3">My Tasks</h1>
            
            <!-- Add New Task Form -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Add New Task</h5>
                <form (ngSubmit)="addActivity()" #taskForm="ngForm">
                  <div class="row">
                    <div class="col-md-8">
                      <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Enter your task..."
                        [(ngModel)]="newActivity.activity"
                        name="activity"
                        required
                        #activity="ngModel">
                    </div>
                    <div class="col-md-2">
                      <select 
                        class="form-select" 
                        [(ngModel)]="newActivity.status"
                        name="status">
                        <option value="To do">To do</option>
                        <option value="Doing">Doing</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <button 
                        type="submit" 
                        class="btn btn-primary w-100"
                        [disabled]="taskForm.invalid || isLoading">
                        <i class="fas fa-plus me-1"></i>
                        Add
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Pills -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="filter-pills">
              <button 
                *ngFor="let filter of statusFilters" 
                class="btn"
                [class.btn-primary]="currentFilter === filter.value"
                [class.btn-outline-primary]="currentFilter !== filter.value"
                (click)="setFilter(filter.value)">
                {{ filter.label }}
                <span *ngIf="filter.count !== undefined" class="badge bg-light text-dark ms-1">
                  {{ filter.count }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tasks Grid -->
        <div class="row" *ngIf="!isLoading; else loadingTemplate">
          <div class="col-12" *ngIf="activities.length === 0">
            <div class="text-center py-5">
              <i class="fas fa-tasks fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">No tasks found</h4>
              <p class="text-muted">Add your first task to get started!</p>
            </div>
          </div>
          
          <div class="col-md-6 col-lg-4 mb-3" *ngFor="let activity of activities; trackBy: trackByActivity">
            <div class="card task-card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge badge-status" 
                        [class.status-todo]="activity.status === 'To do'"
                        [class.status-doing]="activity.status === 'Doing'"
                        [class.status-done]="activity.status === 'Done'">
                    {{ activity.status }}
                  </span>
                  <button 
                    class="btn btn-delete btn-sm"
                    (click)="deleteActivity(activity.id)"
                    title="Delete task">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                
                <div *ngIf="editingId !== activity.id">
                  <h6 class="card-title">{{ activity.activity }}</h6>
                  <small class="text-muted">
                    Created: {{ formatDate(activity.insertDate) }}
                  </small>
                  <div class="mt-2">
                    <button 
                      class="btn btn-sm btn-outline-primary me-2"
                      (click)="startEdit(activity)">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <select 
                      class="form-select form-select-sm d-inline-block w-auto"
                      [value]="activity.status"
                      (change)="updateStatus(activity, $event)">
                      <option value="To do">To do</option>
                      <option value="Doing">Doing</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
                
                <div *ngIf="editingId === activity.id">
                  <form (ngSubmit)="saveEdit()">
                    <div class="mb-2">
                      <input 
                        type="text" 
                        class="form-control form-control-sm"
                        [(ngModel)]="editingActivity.activity"
                        name="editActivity"
                        required>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button type="submit" class="btn btn-success">
                        <i class="fas fa-check"></i>
                      </button>
                      <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="row mt-4" *ngIf="pagination && pagination.totalPages > 1">
          <div class="col-12">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="!pagination.hasPrevPage">
                  <a class="page-link" href="#" (click)="changePage(pagination.currentPage - 1)">
                    Previous
                  </a>
                </li>
                <li class="page-item" 
                    *ngFor="let page of getPageNumbers()" 
                    [class.active]="page === pagination.currentPage">
                  <a class="page-link" href="#" (click)="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" [class.disabled]="!pagination.hasNextPage">
                  <a class="page-link" href="#" (click)="changePage(pagination.currentPage + 1)">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading tasks...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .task-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      border: none;
      border-radius: 12px;
    }
    
    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .badge-status {
      font-size: 0.75rem;
      padding: 0.35rem 0.65rem;
      border-radius: 20px;
    }
    
    .status-todo {
      background-color: #007bff;
      color: white;
    }
    
    .status-doing {
      background-color: #ffc107;
      color: #212529;
    }
    
    .status-done {
      background-color: #28a745;
      color: white;
    }
    
    .btn-delete {
      background-color: transparent;
      border: none;
      color: #dc3545;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .btn-delete:hover {
      background-color: #dc3545;
      color: white;
    }
    
    .filter-pills .btn {
      border-radius: 20px;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .navbar-brand {
      font-weight: 600;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private activityService = inject(ActivityService);
  private router = inject(Router);

  currentUser: User | null = null;
  activities: Activity[] = [];
  pagination: any = null;
  isLoading = false;
  currentFilter = 'all';
  currentPage = 1;
  
  newActivity: CreateActivityRequest = {
    activity: '',
    status: 'To do'
  };
  
  editingId: number | null = null;
  editingActivity: UpdateActivityRequest = {};
  
  statusFilters = [
    { label: 'All', value: 'all', count: 0 },
    { label: 'To do', value: 'To do', count: 0 },
    { label: 'Doing', value: 'Doing', count: 0 },
    { label: 'Done', value: 'Done', count: 0 }
  ];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
    
    this.loadActivities();
  }

  loadActivities() {
    this.isLoading = true;
    const status = this.currentFilter === 'all' ? undefined : this.currentFilter;
    
    this.activityService.getActivities(status, this.currentPage, 12).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.activities = response.data;
          this.pagination = response.pagination;
          this.updateFilterCounts();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading activities:', error);
      }
    });
  }

  addActivity() {
    if (!this.newActivity.activity.trim()) return;
    
    this.activityService.createActivity(this.newActivity).subscribe({
      next: (response) => {
        if (response.success) {
          this.newActivity = { activity: '', status: 'To do' };
          this.loadActivities();
        }
      },
      error: (error) => {
        console.error('Error adding activity:', error);
      }
    });
  }

  updateStatus(activity: Activity, event: any) {
    const newStatus = event.target.value;
    const updateData: UpdateActivityRequest = { status: newStatus };
    
    this.activityService.updateActivity(activity.id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadActivities();
        }
      },
      error: (error) => {
        console.error('Error updating activity:', error);
      }
    });
  }

  startEdit(activity: Activity) {
    this.editingId = activity.id;
    this.editingActivity = { activity: activity.activity };
  }

  saveEdit() {
    if (this.editingId && this.editingActivity.activity?.trim()) {
      this.activityService.updateActivity(this.editingId, this.editingActivity).subscribe({
        next: (response) => {
          if (response.success) {
            this.cancelEdit();
            this.loadActivities();
          }
        },
        error: (error) => {
          console.error('Error updating activity:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editingActivity = {};
  }

  deleteActivity(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.activityService.deleteActivity(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadActivities();
          }
        },
        error: (error) => {
          console.error('Error deleting activity:', error);
        }
      });
    }
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadActivities();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination?.totalPages) {
      this.currentPage = page;
      this.loadActivities();
    }
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];
    
    const pages = [];
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.currentPage;
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }
    
    return pages;
  }

  updateFilterCounts() {
    // This would typically come from the API, but for now we'll calculate from current data
    this.statusFilters[0].count = this.activities.length; // All
    this.statusFilters[1].count = this.activities.filter(a => a.status === 'To do').length;
    this.statusFilters[2].count = this.activities.filter(a => a.status === 'Doing').length;
    this.statusFilters[3].count = this.activities.filter(a => a.status === 'Done').length;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByActivity(index: number, activity: Activity): number {
    return activity.id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}