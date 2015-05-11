# How to use navigation service.

## Introduction

Navigation service helps implement navigation in registry controllers.

It is essentially a stack of past states. State is represented as a 2-ple (path, context).
Path is stored automatically from Angular's $location object. Context is optionally passed into service method.

There are five public methods in NavigationService - navigate(context), navigateToPath(path, context), back(), restore() and clear().

Flow starts with navigate(context) method. This stores the current path and passed context into the navigation. Optionally, navigateToPath(path, context) can be used when current path is different from target path, to store context with any arbitrary path.
Then back() or restore() return to previous states. clear() can be used before 
the navigate(context) call to clear the navigation.

## back() vs. restore()

back() can be used to implement stateless navigation. It sets the last location from navigation 
into $location.path and then removes the last element from navigation.
This way the page returns to previous location, but without restoring the context/state.

restore() can be used to implement navigation with state. First, it checks that current $location path equals
the path stored for last navigation item. Then returns the context for the last navigation item and removes
the last navigation item. This way the page stays in current location and state is restored from returned value
by the caller of restore() method.

## Example of controller

```javascript
	.controller('xpsui:AController', [
			'xpsui:NavigationService',
		function(navigationService) {

			// Navigation history is cleared, while creating the controller for the first time.
			$scope.firstInit = function() {
				navigationService.clear();
			}

			// Current state is stored, when moving to new path
			$scope.gotoNext = function() {
				navigationService.navigate($scope.model);
				$scope.model = {};
			};

			// State to be filled is stored, when moving to new form
			$scope.moveToNewForm = function() {
				navigationService.navigateToPath('/another/form', { 'obj1.objInner.field1': 'value1', 'obj2.objInner.field2': 'value2' });
			};

			// State is restored when moving back in history
			$scope.goBack = function() {
				var restoreObj = navigationService.restore();
				if (restoreObj) {
					$scope.model = restoreObj;
				}
			};

		}]);
```
