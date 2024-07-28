import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/ApiServices/auth.service';
import { GroupService } from 'src/app/ApiServices/group.service';
import { InviteUserComponent } from '../invite-user/invite-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { CreateContestComponent } from '../create-contest/create-contest.component';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  groupId: any;
  group: any = {};
  members: any = [];
  contests: any = [];
  isLeader: boolean = false;
  isMember: boolean = false;

  constructor(
    private groupService: GroupService,
    private titleService: Title,
    private activatedRoute: ActivatedRoute, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.groupId = param.get('groupId');
    });
    this.getGroupDetails(this.groupId);
    this.getGroupMembers(this.groupId);
    this.getGroupContests(this.groupId);
  }

  getGroupDetails(id: number) {
    this.groupService.getSpecificGroup(id).subscribe({
      next: (response: any) => {
        this.group = response;
        this.isLeader = this.group.leader;
        this.isMember = this.group.member;
        console.log('lol');
        
        console.log(this.group);
        this.titleService.setTitle(this.group.name);
      },
      error: (error: any) => {
        if (error.error.statusCode == 404) {
          this.router.navigate(['/notFound']);
        }
      }
    });
  }

  getGroupMembers(id: number) {
    this.groupService.getGroupMembers(id, 0, 25).subscribe({
      next: (response: any) => {
        this.members = response.content;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  getGroupContests(id: number) {
    this.groupService.getGroupContests(id).subscribe({
      next: (response: any) => {
        this.contests = response;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

  leaveGroup() {
    let conferm = confirm('Are you sure you want to leave this group?');
    if (!conferm) return;
    this.groupService.leaveGroup(this.groupId).subscribe({
      next: (response: any) => {
        if (this.group.leader == true) {
          this.router.navigate(['/group']);
        }
        window.location.reload();
      },
      error: (error: any) => {
        this.snackBar.open(error.error.message, 'close', {
          duration: 2000,
          verticalPosition: 'top',
        });
      }
    })
  }

  joinGroup() {
    this.groupService.joinGroup(this.groupId).subscribe({
      next: (response: any) => {
        window.location.reload();
      },
      error: (error: any) => {
        if (error.status == 403) {
          this.snackBar.open('You should login to join this group', 'close', {
            duration: 2000,
            verticalPosition: 'top',
          });
        } else {
          this.snackBar.open(error.error.message, 'close', {
            duration: 2000,
            verticalPosition: 'top',
          });
        }
      }
    });
  }

  openInviteUserDialog() {
    this.dialog.open(InviteUserComponent, {
      data: {
        groupId: this.groupId
      },
      width: '50%',
      height: 'auto',
      disableClose: true
    });
  }

  UpdateGroup() {
    this.dialog.open(CreateGroupComponent, {
      data: {
        groupId: this.groupId,
        name: this.group.name,
        description: this.group.description,
        visibility: this.group.visibility,
      },
      width: '50%',
      height: 'auto',
      disableClose: true
    });
  }

  addContest() {
    this.openCreateContestDialog();
  }

  openCreateContestDialog() {
    this.dialog.open(CreateContestComponent, {
      data: {
        inGroup: true,
        groupId: this.groupId
      },
      width: '65%',
      height: 'auto',
      disableClose: true
    });
  }

}
