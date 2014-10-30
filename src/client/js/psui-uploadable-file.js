angular.module('psui-uploadable-file', ['psui-uploadable-image'])
.directive('psuiUploadableFile', ['psFileUploadFactory','psui.notificationFactory', function(psFileUploadFactory,notificationFactory) {
	return {
		restrict: 'E',
		require: ['?ngModel', 'psuiUploadableFile'],
		scope: true,
		controller: function() {
			return {
				srcElm: null,
				imageProcessed: function(blob) {}
			};
		},
		link: function(scope, elm, attrs, ctrls) {
			var fileButton = angular.element('<input type="file"/></input>');

			elm.append(fileButton);
			// fileButton.addClass('psui-uploadable-file-fbutton');


			var commit = function() {
			};

			var imgCtrl = ctrls[1];
			fileButton.on('change', function(evt) {
				var file = fileButton[0].files[0];

				if (file) {
					if (file.type !== 'text/csv') {
						//TODO do something clever
						notificationFactory.error({translationCode:'psui.uploadable.image.unsupported.image.type'});
					} else {
						var uploader = new psFileUploadFactory.FileUploader(scope, file, file.type, '/uploads/putgetpath/');
						uploader.upload(function(err, path) {
							if (err) {
								notificationFactory.error(err);
							}
							commit(path);
						});
					}
				}
			});

			var ngModel = ctrls[0];
			if (ngModel) {
				ngModel.$render = function() {
				};

				commit = function(val) {
					scope.$apply( function() {
						console.log('commit ' +val);

						ngModel.$setViewValue(val);
					});
				};
			}
		}
	};
}]);
