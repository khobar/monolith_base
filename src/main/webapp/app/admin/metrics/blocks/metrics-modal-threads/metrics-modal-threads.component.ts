import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { Thread, ThreadState } from 'app/admin/metrics/metrics.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BadgeType } from '../../../../shared/material/components/badge/badge.model';

@Component({
  selector: 'jhi-thread-modal',
  templateUrl: './metrics-modal-threads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsModalThreadsComponent implements OnInit {
  ThreadState = ThreadState;
  threadStateFilter?: ThreadState;
  threads?: Thread[];
  threadDumpAll = 0;
  threadDumpBlocked = 0;
  threadDumpRunnable = 0;
  threadDumpTimedWaiting = 0;
  threadDumpWaiting = 0;
  protected readonly BadgeType = BadgeType;

  constructor(public dialogRef: MatDialogRef<MetricsModalThreadsComponent>, @Inject(MAT_DIALOG_DATA) public data: Thread[]) {
    this.threads = data;
  }

  ngOnInit(): void {
    this.threads?.forEach(thread => {
      if (thread.threadState === ThreadState.Runnable) {
        this.threadDumpRunnable += 1;
      } else if (thread.threadState === ThreadState.Waiting) {
        this.threadDumpWaiting += 1;
      } else if (thread.threadState === ThreadState.TimedWaiting) {
        this.threadDumpTimedWaiting += 1;
      } else if (thread.threadState === ThreadState.Blocked) {
        this.threadDumpBlocked += 1;
      }
    });

    this.threadDumpAll = this.threadDumpRunnable + this.threadDumpWaiting + this.threadDumpTimedWaiting + this.threadDumpBlocked;
  }

  getBadgeType(threadState: ThreadState): BadgeType {
    switch (threadState) {
      case ThreadState.Runnable:
        return BadgeType.SUCCESS;
      case ThreadState.Waiting:
        return BadgeType.INFO;
      case ThreadState.TimedWaiting:
        return BadgeType.WARNING;
      case ThreadState.Blocked:
        return BadgeType.ERROR;
      default:
        return BadgeType.INFO;
    }
  }

  getBadgeClass(threadState: ThreadState): string {
    if (threadState === ThreadState.Runnable) {
      return 'bg-success';
    } else if (threadState === ThreadState.Waiting) {
      return 'bg-info';
    } else if (threadState === ThreadState.TimedWaiting) {
      return 'bg-warning';
    } else if (threadState === ThreadState.Blocked) {
      return 'bg-danger';
    }
    return '';
  }

  getThreads(): Thread[] {
    return this.threads?.filter(thread => !this.threadStateFilter || thread.threadState === this.threadStateFilter) ?? [];
  }

  dismiss(): void {
    this.dialogRef.close();
  }
}
