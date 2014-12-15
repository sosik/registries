(function(angular) {
  angular.module('portal-editor', ['psui-datepicker', 'xpsui:services', 'xpsui:directives'])
        .controller('portal-editor.editCtrl', ['$scope', '$sce', '$http', 'psui.notificationFactory', '$route', '$routeParams', '$location', 'xpsui:DateUtil', function($scope, $sce, $http, notificationFactory, $route, $routeParams, $location, dateUtils) {
    $scope.model = {
    };

    $scope.templates = {
      'index' : {
        name: 'Titulok',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa ak ako link v zozname článkov',
        icon: 'img/block-title.png',
        meta: {
          template: 'index',
          isIndex: false,
          isMenu: false,
          parentMenu: null,
          enabled: true,
          publishFrom: dateUtils.nowToReverse(),
          tags: []
        },
        data: [
          {
            meta: {
              type: 'pure-html',
              name: 'title',
              element: '<div></div>'
            },
            data: '<h1>...Titulok článku...</h1>'
          },
          {
            meta: {
              type: 'pure-html',
              name: 'abstract',
              element: '<section class="abstract"></section>'
            },
            data: '...Abstrakt článku, krátky popis a zdrnutie...'
          },
          {
            meta: {
              type: 'pure-html',
              name: 'contentBlock',
              element: '<section class="content"></section'

            },
            data: '<p>...Obsah článku...</p>'
          }
        ]
      },
      article : {
        name: 'Article',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa ak ako link v zozname článkov',
        icon: 'img/block-title.png',
        meta: {
          template: 'article',
          enabled: true,
          publishFrom: dateUtils.nowToReverse(),
          tags: []
        },
        data: [
          {
            meta: {
              type: 'pure-html',
              name: 'title',
              element: '<div></div>'
            },
            data: '<h1>...Titulok článku...</h1>'
          },
          {
            meta: {
              type: 'pure-html',
              name: 'abstract',
              element: '<section class="abstract"></section>'
            },
            data: '...Abstrakt článku, krátky popis a zdrnutie...'
          },
          {
            meta: {
              type: 'pure-html',
              name: 'contentBlock',
              element: '<section class="content"></section'

            },
            data: '<p>...Obsah článku...</p>'
          }
        ]
      }
    };

    $scope.blocks = {
      title: {
          meta: {
            name: 'title',
            element: '<div></div>',
            type: 'pure-html',
            desc: '<h1>Titulok</h1><p>Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa ak ako link v zozname článkov</p>',
            icon: 'img/block-title.png',
          },
          data: '<h1>...Titulok článku...</h1>'
        },
      abstract: {
          meta: {
            name: 'abstract',
            element: '<section class="abstract"></section>',
            type: 'pure-html',
            desc: '<h1>Abstrakt</h1><p>Krátke zhrnutie článku</p>',
            icon: 'img/block-abstract.png',
          },
          data: '...Abstrakt článku...'
        },
      content: {
          meta: {
            name: 'content',
            element: '<section class="content"></section>',
            type: 'pure-html',
            desc: '<h1>Obsah</h1><p>Obsah článku obsahujúci hlavnú časť textu</p>',
            icon: 'img/block-content.png',
          },
          data: '<p>...Obsah článku...</p>'
        },
      image: {
          meta: {
            name: 'image',
            element: '<div></div>',
            type: 'image',
            desc: '<h1>Obrázok</h1><p>Veľký obrázok do článku</p>',
            icon: 'img/block-image.png',
          },
          data: {
            img: ''
          }
        },
      category: {
          meta: {
            name: 'category',
            element: '<div></div>',
            type: 'category',
            desc: '<h1>Kategória</h1><p>Zoznam článkov v danej kategórii</p>',
            icon: 'img/block-category.png',
          },
          data: {
            tags: []
          }
        },
      gallery: {
          meta: {
            name: 'gallery',
            element: '<div></div>',
            type: 'gallery',
            desc: '<h1>Galéria</h1><p>Galéria fotografií</p>',
            icon: 'img/block-gallery.png',
          },
          data: {
            images: []
          }
        },
      showcase: {
          meta: {
            name: 'showcase',
            element: '<div></div>',
            type: 'showcase',
            desc: '<h1>Výklad</h1><p>Najhorúcejšie články v prelínajúcom zobrazení výkladného okna</p>',
            icon: 'img/block-topics.png',
          },
          data: {
            tags: []
          }
        }
      };

    //$scope.templateUrl = 'portal/templates/article.html';

    //$scope.model = angular.copy($scope.templates.article);

    console.log($routeParams);
    if ($routeParams.id) {
      $http({
        url: '/udao/get/portalArticles/' + $routeParams.id,
        method: 'GET',
      })
      .success(function(data, status, headers, config){
        $scope.model = data;
        $scope.viewTemplate = $scope.getViewTemplate();

      }).error(function(err) {
        notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
      });
    } else {
      $http({
        method : 'POST',
        url: '/portalapi/getByTags',
        data: {
          tags: ['menu:index']
        }
      })
      .success(function(data, status, headers, config) {
        if (data && data.length > 0 && data[0].id) {
          $location.path('/portal/edit/'+ data[0].id);
          //$route.updateParams({id: data[0].id});
        }
      }).error(function(err) {
        notificationFactory.error(err);
      });
    }
    function enterEditMode() {
      $scope.mode = 'edit';
      $scope.$broadcast('modechange');
    }

    $scope.edit = function addNew() {
      enterEditMode();
    };

    $scope.addNew = function addNew() {
      $scope.model = {};
      angular.copy($scope.templates.article, $scope.model);
      $scope.viewTemplate = $scope.getViewTemplate();

      enterEditMode();
    };

    $scope.findSurrogateTitle = function(pageBlocks) {
      if (pageBlocks) {
        for(i = 0; i < pageBlocks.length; i++) {
          if (pageBlocks[i].meta.name == 'title') {
            return pageBlocks[i].data.replace('<h1>', '').replace('</h1>', '');
          }
        }
      }
      return '';
    }

    $scope.save = function() {
      if ($scope.model.meta) {
        $scope.model.meta.lastModTimestamp = (new Date()).getTime();
        if (!$scope.model.meta.title) {
          var surrogateTitle = $scope.findSurrogateTitle($scope.model.data);
          $scope.model.meta.title = surrogateTitle;
        }
      }
      $http({
        url: '/udao/save/portalArticles',
        method: 'PUT',
        data: $scope.model
      })
      .success(function(data, status, headers, config){
        notificationFactory.clear();
        if (data.id) {
          $location.path('/portal/edit/'+ data.id);
          //$route.updateParams({id: data.id});
        } else if ($scope.model.id) {
          $route.reload();
        }
      }).error(function(err) {
        notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
      });
    };

    $scope.cancel = function() {
      $route.reload();
    };

    $scope.showBlockSelector = function showBlockSelector() {
      $scope.blockSelectorShown = true;
    };

    $scope.hideBlockSelector = function hideBlockSelector() {
      $scope.blockSelectorShown = false;
    };

    $scope.selectBlock = function(block) {
      $scope.blockSelectorShown = false;
      $scope.model.data.push($scope.blocks[block]);
      $scope.$broadcast('modechange');
    };

    $scope.makeSafe = function(str) {
      return $sce.trustAsHtml(str);
    };

    $scope.getViewTemplate = function() {
      if ($scope.model && $scope.model.meta && $scope.model.meta.template) {
        return '/portal/templates/'+$scope.model.meta.template+'.html';
      } else {
        return null;
      }
    };
  }])
  .controller('portal-editor.menuCtrl', [
      '$scope',
      '$sce',
      '$route',
      'schema-utils.SchemaUtilFactory',
      'psui.notificationFactory',
      '$http',
      '$location',
      function(
        $scope,
        $sce,
        $route,
        schemaUtilFactory,
        notificationFactory,
        $http,
        $location
      ) {
    var portalSchemaUri = schemaUtilFactory.decodeUri('uri://registries/portal#');
    var emptyMenu = {
      index: {
        name: 'ROOT',
        transCode: null,
        tags: [],
        subElements: [
        ]
      }
    };

    $scope.model = angular.copy(emptyMenu);

    $scope.cancel = function() {
      $route.reload();
    };

    $scope.save = function() {
      $http({
        url: '/udao/save/portalMenu',
        method: 'PUT',
        data: $scope.model
      })
      .success(function(data, status, headers, config){
        notificationFactory.clear();
        $route.reload();
      }).error(function(err) {
        notificationFactory.error({translationCode:'registry.unsuccesfully.saved', time:3000});
      });
    };

    $http({
      method : 'GET',
      url: '/udao/list/portalMenu',
      data: {
      }
    })
    .success(function(data, status, headers, config){
      if (data && data.length > 0 && data[0].index) {
        $scope.model = data[0];
      }
    }).error(function(err) {
      notificationFactory.error(err);
    });

  }])
  .directive('portalMenuEditor', ['$compile', function($compile) {
    return {
      restrict: 'A',
      scope: {
        index: '=portalMenuEditor',
        elementIdx: '=portalMenuIndex'
      },
      controller: ['$scope', function($scope) {
        this.remove = function(idx) {
          if ($scope.index && $scope.index.subElements) {
            $scope.index.subElements.splice(idx, 1);
          }
        };
        this.removeParent = function(idx) {
          $scope.$parent.removeFn(idx);
        };
        this.upInParent = function(idx) {
          var curr = $scope.$parent.index.subElements[idx];
          if (idx > 0) {
            $scope.$parent.index.subElements.splice(idx, 1);
            $scope.$parent.index.subElements.splice(idx-1, 0, curr);
          }
        };
        this.downInParent = function(idx) {
          var curr = $scope.$parent.index.subElements[idx];
          if (idx < $scope.$parent.index.subElements.length-1) {
            $scope.$parent.index.subElements.splice(idx, 1);
            $scope.$parent.index.subElements.splice(idx+1, 0, curr);
          }
        };
      }],
      require: ["^?portalMenuEditor"],
      link: function(scope, elm, attrs, ctrls) {
        scope.mode = 'view';
        scope.opened = false;

        elm.addClass('portal-menu-editor');

        var header = angular.element('<div class="portal-menu-header"></div>');
        var openIcon = angular.element('<i class="glyphicon glyphicon-minus-sign" style="padding-right:10px;"></i>');
        var children = angular.element('<div style="padding-left: 20px;"><div ng-repeat="c in index.subElements"><div portal-menu-editor="c" portal-menu-index="$index"></div></div></div>');
        var actionButtons = angular.element('<span style="padding-left: 10px;" class="psui-hidden"></span>');
        var editButton = angular.element('<i class="action-button glyphicon-pencil"></i>');
        var addButton = angular.element('<i class="action-button glyphicon-plus"></i>');
        var removeButton = angular.element('<i class="action-button glyphicon-minus" ng-click="removeParent()"></i>');
        var downButton = angular.element('<i class="action-button glyphicon-arrow-down" ng-click="downFn()"></i>');
        var upButton = angular.element('<i class="action-button glyphicon-arrow-up" ng-click="upFn()"></i>');

        var editPanel = angular.element('<table class="psui-hidden portal-menu-editor-edit-panel">' +
            '<tr><td>Meno:</td><td><input ng-model="index.name"</td></tr>' +
            '<tr><td>Tagy:</td><td><span portal-multistring-edit ng-model="index.tags"></span></td></tr>' +
            '</table>');
 

        editButton.on('click', function(evt) {
          editPanel.toggleClass('psui-hidden');
          scope.opened = !scope.opened;
          evt.stopPropagation();
        });

        addButton.on('click', function(evt) {
          scope.$apply(function () {
            scope.addNew();
          });
          evt.stopPropagation();
        });

        scope.removeParent = function() {
            if (ctrls[0]) {
              ctrls[0].removeParent(scope.elementIdx);
            }
          }

        scope.removeFn = function(idx) {
            console.log(idx);
            if (ctrls[0]) {
              ctrls[0].remove(idx);
            }
        };

        scope.upFn = function() {
            editPanel.removeClass('psui-hidden');
            editPanel.addClass('psui-hidden');
            children.removeClass('psui-hidden');
            children.addClass('psui-hidden');
            if (ctrls[0]) {
              ctrls[0].upInParent(scope.elementIdx);
            }
          }

        scope.downFn = function() {
            editPanel.removeClass('psui-hidden');
            editPanel.addClass('psui-hidden');
            children.removeClass('psui-hidden');
            children.addClass('psui-hidden');
            if (ctrls[0]) {
              ctrls[0].downInParent(scope.elementIdx);
            }
          }

        if (ctrls[0]) {
          actionButtons.append(editButton);
        }

        actionButtons.append(addButton);
        if (ctrls[0]) {
          actionButtons.append(removeButton);
          actionButtons.append(downButton);
          actionButtons.append(upButton);
        }

        header.on('click', function(evt) {
          if (scope.index.subElements.length > 0) {
            openIcon.toggleClass('glyphicon-plus-sign');
            openIcon.toggleClass('glyphicon-minus-sign');

            children.toggleClass('psui-hidden');
          }

          evt.stopPropagation();
        });

        header.on('mouseover', function() {
          actionButtons.removeClass('psui-hidden');
        });
        header.on('mouseleave', function() {
          actionButtons.addClass('psui-hidden');
        });
        var name = angular.element('<span>{{index.name}}</span>');

        header.append(openIcon);
        header.append(name);
        header.append(actionButtons);

        if (scope.index.subElements.length < 1) {
          openIcon.removeClass('glyphicon-minus-sign');
          openIcon.removeClass('glyphicon-plus-sign');
          openIcon.addClass('glyphicon-record');
        }

        elm.append(header);
        elm.append(editPanel);
        elm.append(children);
        $compile(editPanel)(scope);
        $compile(children)(scope);
        $compile(header)(scope);

        scope.addNew = function addNew() {
          scope.index.subElements.push({
            name: '...Nový...',
            transCode: null,
            tags: [],
            subElements: []
          });
          openIcon.addClass('glyphicon-minus-sign');
          openIcon.removeClass('glyphicon-record');
          openIcon.removeClass('glyphicon-plus-sign');
          children.removeClass('psui-hidden');
        };

      }
    };
  }])
  .directive('portalMultistringEdit', [function() {
    return {
      restrict: 'A',
      require: ['ngModel'],
      link: function(scope, elm, attrs, ctrls) {
        var ngModel = ctrls[0];

        elm.addClass('portal-multistring-edit');

        var container = angular.element('<div></div>');
        var input = angular.element('<input></input>');
        var addButton = angular.element('<button class="btn btn-primary">Pridať</button>');

        elm.addClass('portal-multistring-edit');

        ngModel.$render = function() {
          var i, xButton, stringElm;

          container.empty();
          for (i in ngModel.$modelValue) {
            stringElm = angular.element('<div class="portal-multistring-element"><span>'+ngModel.$modelValue[i]+'</span></div>');
            xButton = angular.element('<i class="glyphicon-remove"></i>');
            xButton.data('idx', i);

            xButton.on('click', function(evt) {
              scope.$apply(function() {
                ngModel.$modelValue.splice(angular.element(evt.target).data('idx'), 1);
                ngModel.$render();
              });
            });
            stringElm.append(xButton);
            container.append(stringElm);
          }
        };

        elm.append(container);
        elm.append(input);
        elm.append(addButton);

        input.on('change', function(evt) {
          scope.$apply(function() {
            ngModel.$modelValue.push(input.val());
            ngModel.$render();
            input.val('');
          });
        });

        elm.bind('focus', function(evt) {
          input[0].focus();
        });
      }
    };
  }])
  .directive('portalMenuRender', ['$http', '$route', '$compile', '$location', function($http, $route, $compile, $location) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs, ctrls) {
        var loadingDiv = angular.element('<div>Nahrávam...</div>');

        elm.append(loadingDiv);

        var menuHash = [];
        var counter = 0;

        function renderMenuEntry(data, element) {
          var menuEntry = angular.element('<div class="portal-menu-entry"><a ng-click="navigate('+ (counter++) +');">'+data.name+'</a></div>');

          menuHash.push(data.tags);

          var subMenu = angular.element('<div class="portal-sub-menu"></div>');
          for (var i = 0; i < data.subElements.length; ++i) {
            subMenu.append(angular.element('<div ng-click="navigate('+ (counter++) +')">'+ data.subElements[i].name+'</div>'));
            menuHash.push(data.subElements[i].tags);
          }
          menuEntry.append(subMenu);
          return(menuEntry);

        }

        $http({
          method : 'GET',
          url: '/udao/list/portalMenu',
          data: {
          }
        })
        .success(function(data, status, headers, config){
          elm.empty();
          if (data && data.length > 0 && data[0].index) {
            for (var i = 0; i < data[0].index.subElements.length; ++i) {
              var menuEntry = renderMenuEntry(data[0].index.subElements[i]);
              elm.append(menuEntry);
              $compile(menuEntry)(scope);
            }
          }
        }).error(function(err) {
          notificationFactory.error(err);
        });

        scope.navigate = function(i) {
          $http({
            method : 'POST',
            url: '/portalapi/getByTags',
            data: {
              tags: menuHash[i]
            }
          })
          .success(function(data, status, headers, config){
            if (data && data.length > 0 && data[0].id) {
              $location.path('/portal/edit/'+ data[0].id);
              //$route.updateParams({id: data[0].id});
            }
          }).error(function(err) {
            notificationFactory.error(err);
          });
        };
      }
    };
  }]);
}(angular));
