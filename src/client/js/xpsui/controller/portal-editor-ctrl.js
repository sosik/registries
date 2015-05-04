(function(angular) {
  'use strict';

  angular.module('xpsui:controllers')
  .controller('xpsui:PortalEditorCtrl', ['$scope', '$sce', '$http', 'xpsui:NotificationFactory', 
    '$route', '$routeParams', '$location', 'xpsui:DateUtil', 
    function($scope, $sce, $http, notificationFactory, $route, $routeParams, $location, dateUtils) {
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
            data: '...Abstrakt článku, krátky popis a zhrnutie...'
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
            data: '...Abstrakt článku, krátky popis a zhrnutie...'
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
        matchResults: {
            meta: {
              name: 'match-results',
              element: '<section class="x-portal-competition-matches"><header>Výsledky</header></section>',
              type: 'match-results',
              desc: '<h1>Výsledky</h1><p>Časť obsahujúa výsledky súťaží.</p>',
              icon: 'img/block-content.png',
            },
            data: '<h1>Výsledky súťaží</h1>'
          },
//          matchStandings: {
//              meta: {
//                name: 'match-standings',
//                element: '<section class="x-portal-competition-matches"><header>Poradie</header></section>',
//                type: 'match-standings',
//                desc: '<h1>Poradie</h1><p>Časť obsahujúa poradie podľa výsledkov súťaží.</p>',
//                icon: 'img/block-content.png',
//              },
//              data: '<h1>Poradie</h1>'
//            },
          link: {
              meta: {
                name: 'link',
                desc: '<h1>Linka</h1><p>Linka na inú stránku</p>',
                icon: 'img/block-link.png',
                type: 'link',
              },
              data: {
                  href: 'www.example.com',
                  newWindow: false,
                  title: 'Example link',
                }
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
        video: {
            meta: {
              name: 'video',
              desc: '<h1>Embedované video</h1><p>Embedované video s titulkom a textom</p>',
              icon: 'img/block-image.png',
              type: 'video',
            },
            data: {
                src: '',
                title: 'Embedované video',
                subTitle: 'video',
                text: 'text k videu',
              }
          },
        fileList: {
            meta: {
              name: 'file-list',
              element: '<div></div>',
              type: 'file-list',
              desc: '<h1>Súbory</h1><p>Zoznam súborov</p>',
              icon: 'img/block-content.png',
            },
            data: {
              files: []
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
        overview: {
            meta: {
              name: 'overview',
              element: '<div></div>',
              type: 'overview',
              desc: '<h1>Prehľad</h1><p>Prehľad článkov pod sebou.</p>',
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
		document.querySelector('body').classList.add('x-dropdown-open');
    };

    $scope.hideBlockSelector = function hideBlockSelector() {
      $scope.blockSelectorShown = false;
      document.querySelector('body').classList.remove('x-dropdown-open');
    };

    $scope.selectBlock = function(block) {
      $scope.blockSelectorShown = false;
      document.querySelector('body').classList.remove('x-dropdown-open');
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
  }]);
}(angular));
