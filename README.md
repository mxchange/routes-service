# Routes service

## What is does
It gives you 3 properties to build you own navigation trees from, without having to redefine them, from the exisitng routes.
Works for lazy loaded routes as well!
This solution might not serve everyone's needs exactly, but there was a surprising lack of helpers to make this work. And I hope for some valuable feedback to improve this, and make it more flexible.

### Note
This is as of yet untested outside of the project it was used in!

# Usage
On your root app file's constructor:

```
constructor (public routesService: RoutesService)
```

Then add to your routes:

```
  data: {
      title: 'Page Title'
  }
```

Example:
```
import { Route } from '@angular/router';

import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { WelcomeComponent } from './welcome.component';
import { InfoComponent } from './info.component';

export const appRoutes: Route[] = [
  {
    path: 'home',
    component: HomeComponent,
    loadChildren: {
    	{
    		path: 'welcome',
	        data: {
	          title: 'Welcome Home'
	        },
	        component: WelcomeComponent,
	        loadChildren: {
		    	{
		    		path: 'info',
			        data: {
			          title: 'Information'
			        },
			        component: InfoComponent
			    }
		    }
	    }
    }
  },  
  {
    path: 'login',
    data: {
      title: 'Login',
      showInNav: false
    },
    component: LoginComponent
  }
];
```

You can now use it like:

```
	<div>
		<h2>{{ activeModule }}</h2>
	  	<div class="sub-route">
	    	{{ activeModuleSection }}
	  	</div>
	    <button
	     	*ngFor="let r of activeModuleRoutes"
	     	[routerLink]="r.path"
	    >
	     	{{ r.name }}
	    </button>>
	</div>
```


# API:

Properties:
```
  activeModule: string;
  activeModuleSection: string;
  activeModuleRoutes: { name: string; path: string; }[] = [];
```  

Let's say the current route is: `/home/welcome`
- `activeModule` - 1st level route path: 'home' (extracted from url)
- `activeModuleSection` - 2nd level route: `name`: `welcome` (from route `name` property)
- `activeModuleRoutes` - Array of routes: `{ name: "Information", path: "home/welcome/info" }` (from `data.title`, and the absolute path of the route)

Data:
- `title` - Name that will show in `activeModuleRoutes`
- `showInNav` - Will not add item in `activeModuleRoutes`