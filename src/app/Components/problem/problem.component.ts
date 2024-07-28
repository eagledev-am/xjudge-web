import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OnlineJudgeService } from 'src/app/ApiServices/online-judge.service';
import { ProblemService } from 'src/app/ApiServices/problem.service';
import { UserService } from 'src/app/ApiServices/user.service';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.css']
})
export class ProblemComponent implements OnInit {

  loading: boolean = false;
  Problems: any = [];
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 25;
  pageNo: number = 0;

  onlineJudges: any = [];

  statistics: any = {
    solvedProblems: 0,
    attemptedProblems: 0
  };

  oj: string = '';
  problemCode: string = '';
  title: string = '';
  contestName: string = '';

  constructor(
    private _problemService: ProblemService,
    private onlineJudgeService: OnlineJudgeService,
    private userService: UserService,
    private _Router: Router,
    private titleService: Title) { }

  ngOnInit(): void {
    this.getOnlineJudges();
    this.titleService.setTitle('Problems');
    this.filterProblems();
    if (this.userService.isAuthenticated()) {
      this.getUserStatistics()
    }
    
  }

  trackByProblemCode(index: number, problem: any): string {
    return problem.problemCode; // Assuming problemCode is unique
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageNo = event.pageIndex;
    this.filterProblems();
  }

  onEnterPress() {
    this.pageNo = 0;
    this.filterProblems();
  }

  filterProblems() {
    this.loading = true;
    this._problemService.filterProblem(this.oj, this.problemCode, this.title, this.contestName, this.pageSize, this.pageNo).subscribe({
      next: (response) => {
        this.loading = false;
        this.Problems = response.content;        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      },
      error: (error) => {
        this.loading = false;
        if (error.error.success === false) {
          this._Router.navigate(['/notFound']);

        }
      }
    });
  }

  resetFilters() {
    this.oj = '';
    this.problemCode = '';
    this.title = '';
    this.contestName = '';
    this.filterProblems();
  }

  getSolvedAttemptedProblemsCount() {
    return {
      solved: this.Problems.filter((problem: any) => problem.solved === true).length,
      attempted: this.Problems.filter((problem: any) => problem.solved === false).length
    }
  }

  getOnlineJudges() {
    this.onlineJudgeService.getOnlineJudges().subscribe({
      next: (response) => {
        this.onlineJudges = response;        
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getUserStatistics() {
    this._problemService.getUserStatistics().subscribe({
      next: (response) => {
        this.statistics = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

}
