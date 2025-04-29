import React from 'react';
import { DataTable } from '@/components/DataTable';
import type { UserRole, AttendanceStatus, LeaveType, RequestStatus, ShiftStatus } from '@/lib/supabase/client';

export function TableViews() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <DataTable
          tableName="users"
          columns={[
            { key: 'user_id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'status', header: 'Status' },
          ]}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Attendance</h2>
        <DataTable
          tableName="attendance"
          columns={[
            { key: 'attendance_id', header: 'ID' },
            { key: 'user_id', header: 'User ID' },
            { key: 'date', header: 'Date' },
            { key: 'status', header: 'Status' },
          ]}
          orderBy={{ column: 'date', ascending: false }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
        <DataTable
          tableName="leave_requests"
          columns={[
            { key: 'leave_id', header: 'ID' },
            { key: 'user_id', header: 'User ID' },
            { key: 'leave_type', header: 'Type' },
            { key: 'start_datetime', header: 'Start' },
            { key: 'end_datetime', header: 'End' },
            { key: 'status', header: 'Status' },
          ]}
          orderBy={{ column: 'start_datetime', ascending: false }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Shift Schedule</h2>
        <DataTable
          tableName="shift_schedule"
          columns={[
            { key: 'shift_id', header: 'ID' },
            { key: 'user_id', header: 'User ID' },
            { key: 'date', header: 'Date' },
            { key: 'shift_start_time', header: 'Start Time' },
            { key: 'shift_end_time', header: 'End Time' },
            { key: 'shift_status', header: 'Status' },
          ]}
          orderBy={{ column: 'date', ascending: true }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Shift Swap Requests</h2>
        <DataTable
          tableName="shift_swap_requests"
          columns={[
            { key: 'swap_id', header: 'ID' },
            { key: 'requester_user_id', header: 'Requester ID' },
            { key: 'requested_user_id', header: 'Requested ID' },
            { key: 'shift_id', header: 'Shift ID' },
            { key: 'status', header: 'Status' },
          ]}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <DataTable
          tableName="messages"
          columns={[
            { key: 'message_id', header: 'ID' },
            { key: 'sender_id', header: 'From' },
            { key: 'recipient_id', header: 'To' },
            { key: 'subject', header: 'Subject' },
            { key: 'channel', header: 'Channel' },
          ]}
          orderBy={{ column: 'created_at', ascending: false }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        <DataTable
          tableName="notifications"
          columns={[
            { key: 'notification_id', header: 'ID' },
            { key: 'user_id', header: 'User ID' },
            { key: 'type', header: 'Type' },
            { key: 'content', header: 'Content' },
            { key: 'read_status', header: 'Status' },
          ]}
          orderBy={{ column: 'created_at', ascending: false }}
        />
      </section>
    </div>
  );
} 