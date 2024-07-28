import { Component, OnInit, HostListener, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { interval } from 'rxjs';
import { AuthService } from 'src/app/ApiServices/auth.service';
import { ContestService } from 'src/app/ApiServices/contest.service';
import { ProblemService } from 'src/app/ApiServices/problem.service';
import { UpdateContestComponent } from '../update-contest/update-contest.component';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/ApiServices/user.service';

@Component({
  selector: 'app-contest-details',
  templateUrl: './contest-details.component.html',
  styleUrls: ['./contest-details.component.css']
})
export class ContestDetailsComponent implements OnInit {
  loading: boolean = false;
  problemSet: any = [];   
  contestId: any;
  contest: any;
  selectedButton: string = 'overview';
  problemInfo: any = {};
  problemHashtag: any;

  progressBarValue: number = 0;
  countdownTimer: string = '';
  isLeaderOrManager: boolean = false;
  showPasswordForm: boolean = false;

  password: string = '';

  constructor(
    private titleService: Title, 
    private _ActivatedRoute: ActivatedRoute, 
    private contestService: ContestService,
    private _ProblemService: ProblemService,
    private authService: AuthService, 
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe((param) => {
      this.contestId = param.get('contestId');
    });
    this.getContestDetails();
    interval(1000).subscribe(() => {
      this.updateProgressBar();
      this.updateCountdownTimer();
      if (this.contest.contestStatus === 'RUNNING') {
        // this.checkActiveTabAndPrintUrl();
      }
    });
  }

  ngOnDestroy(): void {
    this.titleService.setTitle('Contest Details');
  }

  getContestDetails() {
    this.contestService.getSpecificContestById(this.contestId, this.password).subscribe({
      next: (response) => {
        this.showPasswordForm = false;
        this.contest = response;
        this.isLeaderOrManager = this.authService.getUserHandle() === this.contest.ownerHandle;
        this.titleService.setTitle(this.contest.title);
        this.problemSet = response.problemSet;
        this.problemSet.sort((a: any, b: any) => a.problemHashtag.localeCompare(b.problemHashtag));
        this.updateProgressBar();
        this.updateCountdownTimer();
      },
      error: (err) => {
        if (err.error.statusCode === 403) {
          this.showPasswordForm = true;
        }
        if (err.error.statusCode == 404) {
          this.router.navigate(['/notFound']);
        }
        if (err.error.statusCode == 400 && !this.userService.isAuthenticated()) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getProblemDetailsWithHashtag(problemHashtag: string) {
    this._ProblemService.getSpecificProblemDetailsByHashtag(this.contestId, problemHashtag).subscribe({
      next: (response) => {
        this.problemInfo = response;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onBtnClick(button: string) {
    this.selectedButton = button;
    if (button === 'problem' && this.problemSet.length > 0) {
      this.getProblemDetailsWithHashtag(this.problemSet[0].problemHashtag);
    }
  }

  updateProgressBar() {
    if (this.contest) {
      const currentTime = new Date().getTime();
      const beginTime = this.contest.beginTime * 1000;
      const endTime = this.contest.endTime * 1000;
      const elapsedTime = currentTime - beginTime;
      const totalTime = endTime - beginTime;
      this.progressBarValue = (elapsedTime / totalTime) * 100;
    }
  }

  updateCountdownTimer() {
    if (this.contest) {
      const currentTime = new Date().getTime();
      const beginTime = this.contest.beginTime * 1000;
      const endTime = this.contest.endTime * 1000;
      let remainingTime;

      if (currentTime < beginTime) {
        this.contest.contestStatus = 'SCHEDULED';
        remainingTime = beginTime - currentTime;
      } else if (currentTime < endTime) {
        this.contest.contestStatus = 'RUNNING';
        remainingTime = endTime - currentTime;
      } else {
        this.contest.contestStatus = 'ENDED';
        return;
      }

      const seconds = Math.floor(remainingTime / 1000) % 60;
      const minutes = Math.floor(remainingTime / (1000 * 60)) % 60;
      const hours = Math.floor(remainingTime / (1000 * 60 * 60)) % 24;
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

      if (days > 0) {
        this.countdownTimer = `${days.toString().padStart(2, '0')} : ${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
      } else if (hours > 0) {
        this.countdownTimer = `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
      } else {
        this.countdownTimer = `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
      }
    }
  }

  openUpdateContestDialog() {
    this.dialog.open(UpdateContestComponent, {
      data: {
        contest: this.contest,
        problemSet: this.problemSet
       
      },
      width: '65%',
      height: 'auto',
      disableClose: true
    }); 
  }
  
  handleDeleteContest() {
    if (confirm('Are you sure you want to delete this contest?')) {
      // this.isLoading = true;
      this.contestService.deleteSpecificContestById(this.contest.id).subscribe({
        next: (res) => {
          // this.isLoading = false;
          this.dialog.closeAll();
          this.router.navigate(['/contest']); 
        },
        error: (err) => {
          console.log(err);
          // this.isLoading = false;
        }
      });
    }
  }
}
