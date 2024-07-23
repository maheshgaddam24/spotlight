import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { commonConst } from './shared/Config/common-const';
import { navigationRoutes } from './shared/Config/navigation-routes';
import {  Renderer2, HostListener } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostListener('window:resize', ['$event'])
  showNavBar: boolean = false;
  sidebarExpanded = false;
  showTopNav: boolean = true;
  title = 'spotlight';
  ngOnInit(): void {
    this.checkWindowWidth();
  }
  
  constructor(
    private router: Router,
    translate: TranslateService,
    private activatedRoute: ActivatedRoute,private renderer: Renderer2
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.showTopNav =
          !this.activatedRoute.firstChild?.snapshot.data.hideTopNav;
        // this.sidebarExpanded = false;
        if (
          val.url == navigationRoutes.signup ||
          val.url == navigationRoutes.login ||

          val.url == '/'
        ) {
          this.showNavBar = false;
          this.showTopNav = false;
        } else if (val.url == '/project-view' || val.url == `/projects`) {
          this.showNavBar = false;
          this.showTopNav = true;
        } else {
          this.showTopNav = true;
          this.showNavBar = true;
        }
      }
    });
    translate.setDefaultLang(commonConst.translate_en);
    translate.use(commonConst.translate_en);
  }
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
  onResize(event: Event): void {
    this.checkWindowWidth();
  }
  onRouteChange(event: any) {
    if (!this.showNavBar) {
      const contentElement = document.querySelector('.content');
      if (contentElement) {
        contentElement.classList.add('noNavBar');
      }
    }
  }
  checkWindowWidth(): void {
    const windowWidth = window.innerWidth;
    if (windowWidth < 800) {
      this.showResolutionMessage();
    } else {
      this.hideResolutionMessage();
    }
  }
  
  
  showResolutionMessage(): void {
    const messageElement = this.renderer.createElement('div');
    this.renderer.addClass(messageElement, 'resolution-message');
    const messageText = this.renderer.createText('Need a bigger resolution display to use this application');
    this.renderer.appendChild(messageElement, messageText);
    const bodyElement = this.renderer.selectRootElement('body');
    this.renderer.appendChild(bodyElement, messageElement);
  }
  
  hideResolutionMessage(): void {
    const messageElement = document.querySelector('.resolution-message');
    if (messageElement) {
      messageElement.remove();
    }
  }
  
}
