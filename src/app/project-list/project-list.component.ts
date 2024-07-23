import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  SecurityContext,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { saveAs } from 'file-saver';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { apiPaths } from '../shared/Config/apiPaths';
import { commonConst } from '../shared/Config/common-const';
import { navigationRoutes } from '../shared/Config/navigation-routes';
import { toastMessages } from '../shared/Config/toastr-messages';
import { AppObservable } from '../shared/app-observable';
import { AuditReportComponent } from '../shared/components/audit-report/audit-report.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { RulesDataViewComponent } from '../shared/components/rules-data-view/rules-data-view.component';
import { ApiService } from '../shared/services/api/api.service';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { WebsocketService } from '../shared/services/websockets/websocket.service';
import { LogoutDialogComponent } from '../shared/components/logout-dialog/logout-dialog.component';
import { TimezoneDatePipe } from '../shared/pipes/TimezoneDate/timezone-date.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export class UsernameValidator {
  static cannotContainSpace(control: AbstractControl): ValidationErrors | null {
    if ((control.value as string)?.indexOf(' ') >= 0) {
      return { cannotContainSpace: true };
    }
    return null;
  }
}
interface User {
  username: string;
  id: number;
  email: string;
}

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter', animate(300, style({ opacity: 1 }))),
      transition(':leave', animate(300, style({ opacity: 0 }))),
    ]),
  ],
})
export class ProjectListComponent implements OnInit, OnDestroy {
  @ViewChild('closeButton') closeButton!: ElementRef;

  createNewProjectForm: FormGroup;
  projectListData: any;
  projectId: any;
  userName: any;
  userData: any;
  userId: any;
  invalidFields: any[] = [];
  isEdit = false;
  editProjectBody: any;
  projectData: any = [];
  goldLayerTablesDataList: any;
  selectedAuditLogsId: any;
  auditLogs: any;
  HideLogsText: boolean = true;
  hideFetchingTablesText: boolean = true;
  auditKeys: any;
  exportCSVAudits: any;
  exportPdf: any;
  auditProjectId: any;
  exportReport: boolean = false;
  searchText: string = '';
  randomColor: string;
  bindingValue: number = 1;
  lastColorIndex: number = -1;
  private socket: WebSocket;
  projectLoader: boolean = false;
  failedWorkflowCount: number = 10;
  colors: string[] = [
    '#FEEEB8',
    '#B8FEE5',
    '#B8FAFE',
    '#FFCDBD',
    '#F9D6FF',
    '#FFDBBA',
    '#E0F0FE',
    '#E0F0FE',
  ];
  triggerAuditLogs: boolean = false;
  userNameAdded: string;
  userRole: string;
  usersAdded: {
    user_name: string;
    role: string;
    user_id: number;
    project_id: any;
    created_by: string;
    created_at: String;
    modified_by: String;
    modified_at: String;
  }[] = [];
  selectedProjectName: string;
  users: User[] = [];
  filteredUsers: User[] = [];
  userInput: string = '';
  isUserValid: boolean = true;
  showDropdown: boolean = true;
  contributerProjectID: any;
  isNewContributor: boolean = false;
  isDeleting: boolean[] = [];
  isUpdating: boolean[] = [];
  isDeletingSwipe: boolean[] = [];
  editMode: boolean[] = [];
  editedRole: string = '';
  roles: string[] = ['owner', 'contributor', 'reader'];
  initialRole: string;
  isUserAssigned: boolean;
  currentRole: string;
  getRolesData: any;

  constructor(
    private toastService: HotToastService,
    public service: ApiService,
    public modalService: NgbModal,
    private httpClient: HttpClient,
    private router: Router,
    public formBuilder: FormBuilder,
    private appObservable: AppObservable,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private websocketService: WebsocketService,
    private elementRef: ElementRef,
    private timezoneDatePipe: TimezoneDatePipe,private sanitizer: DomSanitizer
  ) {
    this.userData = sessionStorage.getItem(commonConst.userData);
    this.userName = JSON.parse(this.userData);
    this.userId = this.userName?.userId;
    this.createNewProjectForm = this.formBuilder.group({
      project_name: [
        '',
        [Validators.required, UsernameValidator.cannotContainSpace],
      ],
      user_id: [`${this.userId}`],
      description: ['', [Validators.required, this.descriptionValidator]],
    });
    this.appObservable.listen().subscribe((res: any) => {
      this.projectList();
    });
    this.socket = this.websocketService.connect(
      'ws://20.88.164.129:8080/ws/socket-server/'
    );
  }
  filterUsers(event: any) {
    this.userInput = event.target.value;
    this.filteredUsers = this.users.filter((user) =>
      user.username.toLowerCase().includes(this.userInput.toLowerCase())
    );
    if (!this.filteredUsers.length) {
      this.isUserValid = false;
    } else {
      this.isUserValid = true;
    }

    this.isUserAssigned = this.isUserExist();
  }

  isUserExist() {
    return this.usersAdded.some(
      (item) => item.user_name.toLowerCase() === this.userInput.toLowerCase()
    );
  }

  toggleEditMode(index: number) {
    this.editMode[index] = !this.editMode[index];
    this.editedRole = this.usersAdded[index].role;
  }

  onRoleChange(userAdded: any, newRole: any, index: any) {
    userAdded.role = newRole.target.value;
    console.log(userAdded);
    const modifiedAdded = [
      {
        id: userAdded.id,
        role: userAdded.role,
      },
    ];
    this.showDeleteDataSetDialog(userAdded, index, 'edit');
    this.editMode[index] = false;
  }

  cancelEdit(index: number) {
    this.editMode[index] = false;
  }

  onSelectUser(user: User) {
    this.userNameAdded = user.username;
    this.userInput = user.username;
    this.filteredUsers = [];
    this.isUserValid = true;
    this.isUserAssigned = this.isUserExist();
  }

  validateInput() {
    if (!this.users.some((user) => user.username === this.userNameAdded)) {
    }
  }
  descriptionValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const description = control.value;
    const lengthWithoutSpaces = description?.replace(/\s/g, '').length;
    if (lengthWithoutSpaces > 50) {
      return { invalidDescription: true };
    }
    return null;
  }

  addUserRole() {
    if (this.userNameAdded && this.userRole) {
      const contributerData = {
        project_id: this.contributerProjectID,
        user_name: this.userNameAdded,
        role: this.userRole,
        user_id: this.getUserId(this.userNameAdded),
      };
      this.isNewContributor = true;
      this.service
        .addContibuter(contributerData)
        .pipe(
          catchError((Error) => {
            this.isNewContributor = false;
            return Error(Error);
          })
        )
        .subscribe((res: any) => {
          this.getUserContributorList(this.contributerProjectID);
          this.isNewContributor = false;
          this.usersAdded.push({
            user_name: this.userNameAdded,
            role: this.userRole,
            user_id: this.getUserId(this.userNameAdded),
            project_id: this.contributerProjectID,
            created_by: '',
            created_at: '',
            modified_by: '',
            modified_at: '',
          });
          this.userNameAdded = '';
          this.userRole = '';
          this.userInput = '';
        });
    }
  }
  getUserId(username: string) {
    const selectedUser = this.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    return selectedUser.id;
  }
  deleteAddedUser(userData: any, index: number) {
    this.showDeleteDataSetDialog(userData, index, 'delete');
    console.log(userData);
  }

  getRolesAssigned(user_id: any, selecetdProjectName: string, projectId: any) {
    this.contributerProjectID = projectId;
    this.selectedProjectName = selecetdProjectName;
    this.usersAdded = [];
    this.getUserContributorList(projectId);
  }
  getUserContributorList(projectId: any) {
    this.service
      .getContibuterList(projectId)
      .pipe(
        catchError((Error) => {
          this.toastService.error('Unable to load contributors list');
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.usersAdded = res.data;
        this.currentRole = res.current_role;
      });
  }

  ngOnDestroy() {
    this.socket.close();
  }

  get errorWhiteSpaceMessage() {
    return this.createNewProjectForm.controls;
  }
  disableButton(): boolean {
    return this.createNewProjectForm.invalid;
  }
  get filteredProjectListData(): any[] {
    if (this.searchText.trim() === '') {
      return this.projectListData;
    } else {
      return this.projectListData.filter((source) =>
        source.project_name
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
      );
    }
  }

  updateUserRole(user: any, newRole: any) {
    user.role = newRole.target.value;
    console.log(user);
  }
  get isSearchEnable(): boolean {
    return this.projectListData.length > 0 ? true : false;
  }

  ngOnInit(): void {
    this.userData = sessionStorage.getItem(commonConst.userData);
    this.userName = JSON.parse(this.userData);
    this.userId = this.userName?.userId;
    this.projectList();
    this.getUserList();
  }

  getRandomColor(): string {
    let randomIndex = Math.floor(Math.random() * this.colors.length);
    while (randomIndex === this.lastColorIndex) {
      randomIndex = Math.floor(Math.random() * this.colors.length);
    }
    this.lastColorIndex = randomIndex;
    return this.colors[randomIndex];
  }

  projectList() {
    this.service
      .getProjectRoleList()
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          this.hideFetchingTablesText = true;
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        console.log(res);
        this.getRolesData = res;
        this.service
          .getSourceList()
          .pipe(
            catchError((Error) => {
              this.toastService.error(toastMessages.HttpRequestError);
              this.hideFetchingTablesText = true;
              return Error(Error);
            })
          )
          .subscribe((res: any) => {
            this.projectLoader = true;
            this.projectListData = res.Data.map((project: any) => ({
              ...project,
              randomColor: this.getRandomColor(),
            }));
            this.projectListData.forEach((project) => {
              const metaData = this.getRolesData.find(
                (data) => data.project_id === project.id
              );
              project.metaData = metaData;
            });
            console.log(this.projectListData);
          });
      });
  }
  getRolesDataList(data: any): string {
    console.log(data.metaData);
    const assignedTime = this.timezoneDatePipe.transform(data.metaData.assigned_at, 'medium', 'UTC');
    const modifiedTime = this.timezoneDatePipe.transform(data.metaData.modified_at, 'medium', 'UTC');
  
    const content = (
      'Your role: ' + `${data.metaData.cur_role} ` +
      'Assigned by: ' + `${data.metaData.assigned_by} ` +
      'Assigned at: ' + `${assignedTime} ` +
      'Modified by: ' + `${data.metaData.modified_by} ` +
      'Modified at: ' + `${modifiedTime}`
    );
  
    return this.sanitizer.sanitize(SecurityContext.HTML, content);
  }
  
  getUserList() {
    this.service
      .getUserList()
      .pipe(
        catchError((Error) => {
          this.toastService.error(toastMessages.HttpRequestError);
          this.hideFetchingTablesText = true;
          return Error(Error);
        })
      )
      .subscribe((res: any) => {
        this.users = res;
      });
  }

  exportAuditPDF() {
    saveAs(this.exportPdf, 'audit.pdf');
  }

  loadAudit(projectId: any) {
    this.auditProjectId = projectId;
    this.triggerAuditLogs = false;
    setTimeout(() => {
      this.triggerAuditLogs = true;
    }, 0);
  }

  openProjectDataSources(id: any, projectName: any) {
    // this.router.navigate([navigationRoutes.workflow + `${this.projectId}`], {state: {project_name: this.projectName, project_id: this.projectId}} );
    this.router.navigate([navigationRoutes.data_lineage], {
      state: {
        project_name: projectName,
        project_id: id,
      },
    });
    // this.router.navigate([navigationRoutes.projectDashboard + `${id}`]);
    sessionStorage.setItem('project_name', projectName);
    sessionStorage.setItem('project_id', id);
  }

  addProject() {
    this.isEdit = false;
  }

  closeCreateProjectModal() {
    this.exportReport = false;
    this.auditLogs = [];
    this.HideLogsText = true;
    this.modalService.dismissAll();
    this.createNewProjectForm.get('project_name')?.reset();
    this.createNewProjectForm.get('description')?.reset();
    this.currentRole = '';
    this.filteredUsers = [];
    this.userNameAdded = '';
    this.userRole = '';
    this.userInput = '';
    this.isUserAssigned = false;
    this.isUserValid = true;
  }

  createNewProject() {
    if (this.createNewProjectForm.invalid) {
      const controls = this.createNewProjectForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.invalidFields.push(name);
        }
      }
      this.toastService.warning(
        `${this.invalidFields}` + ' ' + toastMessages.fieldsMissing
      );
      this.invalidFields = [];
    } else {
      let uploadSourceFile = { ...this.createNewProjectForm.value };
      Object.keys(uploadSourceFile).forEach((key) => {
        if (typeof uploadSourceFile[key] === 'string') {
          uploadSourceFile[key] = uploadSourceFile[key].toUpperCase();
        }
      });
      uploadSourceFile['color_code'] = this.getRandomColor();

      this.httpClient
        .post(
          environment.ip + apiPaths.api.root + apiPaths.api.projectList,
          uploadSourceFile
        )
        .pipe(
          this.toastService.observe({
            loading: toastMessages.creatingNewProject,
            success: (s) => toastMessages.successfullyNewProject,
            error: (e) => toastMessages.errorCreatingProject,
          })
        )
        .subscribe(() => {
          this.closeButton.nativeElement.click();
          this.projectList();
          this.closeCreateProjectModal();
        });
    }
  }

  deleteProject(id: any, project_name: any) {
    this.projectData = [];
    this.projectData.push(id, project_name);
    this.openConfirmationDialog(this.projectData);
  }

  editProject(id: any, name: any, description: any) {
    this.isEdit = true;
    this.projectId = id;
    this.createNewProjectForm = this.formBuilder.group({
      project_name: [name, [Validators.required]],
      user_id: [`${this.userId}`],
      description: [description, [Validators.required]],
    });
  }

  updateProject(id: any, user_id: any) {
    if (this.createNewProjectForm.invalid) {
      const controls = this.createNewProjectForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          this.invalidFields.push(name);
        }
      }
      this.toastService.warning(
        `${this.invalidFields}` + ' ' + toastMessages.fieldsMissing
      );
      this.invalidFields = [];
    } else {
      let projectInfo = {
        id: id,
        user_id: user_id,
        project_name: this.createNewProjectForm.value.project_name,
        description: this.createNewProjectForm.value.description,
      };
      this.httpClient
        .put(
          environment.ip + apiPaths.api.root + apiPaths.api.projectList,
          projectInfo
        )
        .pipe(
          this.toastService.observe({
            loading: toastMessages.updatingProject,
            success: (s) => toastMessages.successfullyUpdatedProject,
            error: (e) => toastMessages.errorUpdatingProject,
          })
        )
        .subscribe(() => {
          this.closeButton.nativeElement.click();
          this.projectList();
          this.closeCreateProjectModal();
        });
    }
  }

  clearForm() {
    this.createNewProjectForm.reset();
  }

  submit() {
    if (!this.isEdit) {
      this.createNewProject();
    } else if (this.isEdit) {
      this.updateProject(this.projectId, this.userId);
    }
  }

  navigateGoldLayerDashboard(data: any) {
    sessionStorage.setItem('project_id', data.id);
    sessionStorage.setItem('project_name', data.project_name);

    this.service.goldLayerTablesList(data.id).subscribe((res: any) => {
      this.goldLayerTablesDataList = res;

      if (this.goldLayerTablesDataList.length === 0) {
        this.toastService.warning(toastMessages.noDashboard);
      } else {
        this.router.navigate([
          navigationRoutes.goldLayerDashboard + `${data.id}`,
        ]);
      }
    });
  }

  openConfirmationDialog(data: any) {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = data;
  }

  openProjectRules(data: any) {
    const modalRef = this.modalService.open(RulesDataViewComponent, {
      size: commonConst.modal_size_xl,
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = data;
  }

  getProjectRules(data: any) {
    sessionStorage.setItem('project_id', data.id);
    sessionStorage.setItem('project_name', data.project_name);
    this.router.navigate([navigationRoutes.rules + `${data.id}`]);
  }

  // Only AlphaNumeric with Some Characters [_ ]
  keyPressAlphaNumericWithCharacters(event: any) {
    var inp = String.fromCharCode(event.keyCode);
    // alphabets, numbers, underscore
    if (/[a-zA-Z_0-9 ]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  openDialog(
    enterAnimationDuration: string,
    exitAnimationDuration: string
  ): void {
    this.dialog.open(AuditReportComponent, {
      width: '520px',
      enterAnimationDuration,
      exitAnimationDuration,
      disableClose: true,
      data: {
        projectId: this.auditProjectId,
        csv: this.exportCSVAudits,
        pdf: this.exportPdf,
      },
    });
  }

  routeHome() {
    return `/projects`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Check if the click occurred outside of any dropdown
    const isOutsideDropdown = this.editMode.some((mode, index) => {
      const dropdownElement = document.getElementById(`editDropdown${index}`);
      return dropdownElement && !dropdownElement.contains(event.target as Node);
    });

    // Close edit mode for all rows if clicked outside of any dropdown
    if (isOutsideDropdown) {
      this.editMode.fill(false);
    }
  }

  showDeleteDataSetDialog(data: any, index: any, operation: any) {
    console.log(data);

    const modalRef = this.modalService.open(LogoutDialogComponent, {
      size: 'small',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.data = {
      action:
        operation === 'delete' ? 'delete contributer' : 'edit contributer',
      data: operation === 'delete' ? data.user_name : data.role,
    };
    if (operation === 'delete') {
      modalRef.result
        .then((result) => {
          if (result === 'closed') {
            this.isDeleting[index] = true;
            this.service
              .deleteContibuter(data.id)
              .pipe(
                catchError((Error) => {
                  this.isDeleting[index] = false;

                  return Error(Error);
                })
              )
              .subscribe((result) => {
                this.isDeleting[index] = false;
                this.isDeletingSwipe[index] = true;
                setTimeout(() => {
                  this.usersAdded.splice(index, 1);
                }, 550);

                setTimeout(() => {
                  this.isDeletingSwipe[index] = false;
                }, 550);
              });
          }
        })
        .catch((reason) => {});
    } else {
      modalRef.result
        .then((result) => {
          if (result === 'closed') {
            this.isUpdating[index] = true;
            const updatedContributed = [
              {
                id: data.id,
                role: data.role,
              },
            ];
            this.service
              .updateContibuter(updatedContributed)
              .pipe(
                catchError((Error) => {
                  this.isUpdating[index] = false;
                  return Error(Error);
                })
              )
              .subscribe((result) => {
                this.isUpdating[index] = false;
                this.getUserContributorList(this.contributerProjectID);
              });
          } else {
            this.getUserContributorList(this.contributerProjectID);
          }
        })
        .catch((reason) => {});
    }
  }
}
