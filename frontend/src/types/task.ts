export type TaskStatus = 'COMPLETED' | 'PROCESSING' | 'ERROR' | 'PENDING';

export interface Task {
    id: string;
    name: string;
    status: TaskStatus;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
}

export interface TaskUpdate {
    taskId: string;
    status: TaskStatus;
    progress: number;
    timestamp: string;
}

export interface CreateTaskRequest {
    description: string;
} 