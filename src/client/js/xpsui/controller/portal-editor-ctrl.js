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
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-headline.svg',
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
      'article' : {
        name: 'Article',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
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
      },
      'location' : {
        name: 'Location',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
        meta: {
          template: 'location',
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
      'news' : {
        name: 'News',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
        meta: {
          template: 'news',
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
      'video' : {
        name: 'Video',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
        meta: {
          template: 'video',
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
      'photo' : {
        name: 'photo',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
        meta: {
          template: 'photo',
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
      'riderszone' : {
        name: 'Riderszone',
        desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa aj ako link v zozname článkov',
        icon: 'img/block-article.svg',
        meta: {
          template: 'riderszone',
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
            title: 'Titulok',
            desc: 'Nadpis článku, každý článok by mal mať aspoň jeden nadpis. Nadpis článku sa používa ak ako link v zozname článkov',
            icon: 'img/block-headline.svg',
          },
          data: '<h1>...Titulok článku...</h1>',
          css: { cssClass: '' }
        },
      abstract: {
          meta: {
            name: 'abstract',
            element: '<section class="abstract"></section>',
            type: 'pure-html',
            title: 'Abstrakt',
            desc: 'Krátke zhrnutie článku',
            icon: 'img/block-abstract.svg',
          },
          data: '...Abstrakt článku...'
        },
      content: {
          meta: {
            name: 'content',
            element: '<section class="content"></section>',
            type: 'pure-html',
            title: 'Obsah',
            desc: 'Obsah článku obsahujúci hlavnú časť textu',
            icon: 'img/block-content.svg',
          },
          data: '<p>...Obsah článku...</p>'
        },
        matchResults: {
            meta: {
              name: 'match-results',
              element: '<section class="x-portal-competition-matches"><header>Výsledky</header></section>',
              type: 'match-results',
              title: 'Výsledky',
              desc: 'Časť obsahujúa výsledky súťaží.',
              icon: 'img/block-content.svg',
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
                title: 'Linka',
                desc: 'Linka na inú stránku',
                icon: 'img/block-link.svg',
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
            title: 'Obrázok',
            desc: 'Veľký obrázok do článku',
            icon: 'img/block-image.svg',
          },
          data: {
            img: ''
          }
        },
        image1170: {
            meta: {
              name: 'image1170',
              element: '<div></div>',
              type: 'image1170',
              title: 'Obrázok 1170px x 570px',
              desc: 'Obrázok 1170px x 570px.',
              icon: 'img/block-image.svg',
            },
            data: {
              img: ''
            }
          },
        video: {
            meta: {
              name: 'video',
              title: 'Embedované video',
              desc: 'Embedované video s titulkom a textom',
              icon: 'img/block-video.svg',
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
              title: 'Súbory',
              desc: 'Zoznam súborov',
              icon: 'img/block-filelist.svg',
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
            title: 'Kategória',
            desc: 'Zoznam článkov v danej kategórii',
            icon: 'img/block-category.svg',
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
              title: 'Prehľad',
              desc: 'Prehľad článkov pod sebou.',
              icon: 'img/block-overview.svg',
            },
            data: {
              tags: []
            }
          },
        ranking: {
            meta: {
              name: 'ranking',
              element: '<div></div>',
              type: 'ranking',
              title: 'Poradie',
              desc: 'Výsledky / poradie súťažiacich.',
              icon: 'img/block-ranking.svg',
            },
            data: {
              results: []
            }
          },
      gallery: {
          meta: {
            name: 'gallery',
            element: '<div></div>',
            type: 'gallery',
            title: 'Galéria',
            desc: 'Galéria fotografií',
            icon: 'img/block-gallery.svg',
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
            title: 'Výklad',
            desc: 'Najhorúcejšie články v prelínajúcom zobrazení výkladného okna',
            icon: 'img/block-topics.svg',
          },
          data: {
            tags: []
          },
          css: { cssClass: '' }
        },
      showcasevideo: {
          meta: {
            name: 'showcasevideo',
            element: '<div></div>',
            type: 'showcasevideo',
            title: 'Výklad s videami',
            desc: 'Videá v prelínajúcom zobrazení výkladného okna',
            icon: 'img/block-videoshowcase.svg',
          },
          data: {
            tags: []
          },
          css: { cssClass: '' }
        },
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
        for(var i = 0; i < pageBlocks.length; i++) {
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
    // 05.28.2015 Add a hover effect to display descriptions. Added by Tom Tanaka.
    $scope.hoverShowDesc = function(desc) {
        // Shows/hides the delete div on hover
    	$scope.msg = desc;
    }
    
    $scope.hoverCloseWhite = function() {
        // Change the color of the close button to white.
    	$scope.color = "white";
    }
    
    $scope.hoverCloseBlack = function() {
        // Change the color of the close button to black.
    	$scope.color = "black";
    }
    

    
  }]);
}(angular));
