import { Router, Route, NavigationEnd } from '@angular/router';
import { Injectable } from '@angular/core';

import * as _ from 'lodash';

@Injectable()
export class RoutesService {
  private activeSubmodulePath: string;

  activeModule: string;
  activeModuleSection: string;
  activeModuleRoutes: { name: string; path: string; }[] = [];

  constructor (private router: Router) {

    // Listen to navigationEndEvent to push navtree
    router.events
      .filter((event: NavigationEnd) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => this.navigationEndEvent(event));
  }

  navigationEndEvent (event: NavigationEnd): void {
    // Set active modules
    const activeRouteArray: string[] = event.urlAfterRedirects.split('/');
    this.activeModule = activeRouteArray[1];
    this.activeSubmodulePath = activeRouteArray[2];

    // Get currentRoute object
    const currentRoute: object = this.getCurrentRoute();

    // Apply
    this.applyChildRoutes(currentRoute);
    this.applyActiveModuleSection(currentRoute);
  }

  getCurrentRoute (): object {
    // Find routes for current module
    const activeRouterConfig: any = _.find(this.router.config, { path: this.activeModule });
    const lazy: boolean = activeRouterConfig.hasOwnProperty('_loadedConfig');

    // Set route path
    const rootPath: string = activeRouterConfig.path;
    const name: string = activeRouterConfig.data.title;

    // Search activeRouterConfig for any routes
    const rootRouteChildren: Route[] = _.get(activeRouterConfig._loadedConfig, 'routes', []);
    const subRouteChildren: Route[] = _.get(activeRouterConfig._loadedConfig, 'routes[0].children', []);

    // Determine which routes to assign
    const subRouteHasChildren: boolean = subRouteChildren.length > 0;
    const childRoutes: Route[] = subRouteHasChildren ? subRouteChildren : rootRouteChildren;

    return {
      rootPath,
      name,
      childRoutes,
      lazy
    };
  }

  applyChildRoutes (currentRoute: any): void {
    // Reset
    this.activeModuleRoutes = [];
    // Map current routes to activeModuleRoutes
    currentRoute.childRoutes.map((route: any) => this.setActiveModuleRoute(route, currentRoute.rootPath));
  }

  setActiveModuleRoute (route: Route | any, domain: string): void {
    // Only push named routes
    if ('data' in route && route.data.showInNav !== false) {
      this.activeModuleRoutes.push({
        name: route.data.title,
        path: domain + '/' + route.path
      });
    }
  }

  applyActiveModuleSection (currentRoute: any): void {
    let fallbackName: string = '';

    // Set name to first route name, else fallback to route name
    fallbackName = currentRoute.lazy ? this.activeModuleRoutes[0].name : currentRoute.name;

    this.setActiveModuleSection(fallbackName);
  }

  getActiveModuleName (): string {
    let moduleName: string = '';
    this.activeModuleRoutes.map((navItem, index) => {
      // Find the route path and set name to activeModuleSection
      // & ignore query paramters
      if (navItem.path === this.activeModule + '/' + this.activeSubmodulePath.split('?')[0]) {
        moduleName = navItem.name;
      }
    });
    return moduleName;
  }

  setActiveModuleSection (fallbackName: string): void {
    // Reset
    this.activeModuleSection = '';
    // If sub-module path is defined / if you are not on a root-route
    if (this.activeSubmodulePath) {
      this.activeModuleSection = this.getActiveModuleName();
    }

    // If still nothing was set, set to fallback
    if (this.activeModuleSection === '') {
      this.activeModuleSection = fallbackName;
    }
  }
}
