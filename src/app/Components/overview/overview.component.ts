import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  [x: string]: any;

  loading: boolean = false;
  @Input() problemSet: any = [];
  contestId: any;
  contests: any;

  constructor(
    private titleService: Title,
  ) {}

  trackByProblemCode(index: number, problem: any): string {
    return problem.problemCode;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Contest Overview');
  }

}