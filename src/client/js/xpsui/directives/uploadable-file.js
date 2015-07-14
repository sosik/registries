(function(angular) {
	'use strict';

	var contentTypes = {
		'.pdf': 'application/pdf',
		'.xls': 'application/vnd.ms-excel',
		'.doc': 'application/msword',
		'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'.ppt': 'application/vnd.ms-powerpoint',
		'.odt': 'application/vnd.oasis.opendocument.text',
		'.bin': 'application/octet-stream',
		'.bmp': 'image/bmp',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.csv':'text/csv',
		'.zip':'application/zip'
	};

	function getContentType(fileName){
		var ext = fileName.substring(fileName.lastIndexOf('.'));
		return contentTypes[ext? ext.toLowerCase():"application/binary"];
	}

	angular.module('xpsui:directives')
	.directive('xpsuiUploadableFile', ['xpsui:FileUploadFactory','xpsui:NotificationFactory','$compile', '$translate', function(psFileUploadFactory,notificationFactory,$compile,$translate) {
		return {
			restrict: 'A',
			require: ['?ngModel', 'xpsuiUploadableFile'],
			scope: true,
			controller: function() {
					this.srcElm = null,
					this.imageProcessed = function(blob) {}
			},
			link: function(scope, elm, attrs, ctrls) {
				var fileButton = angular.element('<input type="file" style="display: none;"></input>');
				var chooseFileButton = angular.element(
						'<button class="btn-primary">'
						+ '<icon class="icon-open"></icon> ' + $translate.instant('generic.file.choose')
						+ '</button>');
				var imgLink = '';
				// elm.addClass('xpsui-uploadable-file');

				elm.append(fileButton);
				elm.append(chooseFileButton);

				chooseFileButton.on('click', function (evt) {
					// fileButton[0].files[0] = '';
					// fileButton[0].value = '';
					fileButton[0].click();
				});

				var commit = function() {
				};

				var imgCtrl = ctrls[1];
				fileButton.on('change', function(evt) {
					var file = fileButton[0].files[0];


					if (file) {
							if (imgCtrl && imgCtrl.srcElm) {
								var urlObject;
								if (typeof webkitURL !== 'undefined') {
								urlObject = webkitURL;
								} else {
									urlObject = URL;
								};
								imgCtrl.srcElm.src = urlObject.createObjectURL(file);
								imgCtrl.imageProcessed = function(blob) {
									var uploader = new psFileUploadFactory.FileUploader(scope, blob, getContentType(file.name), '/uploads/putgetpath/');
									uploader.upload(function(err, path) {
										if (err) {
											notificationFactory.error($translate.instant('generic.file.uploadFailed'));
											//return true;
										}

										elm.css('background-image', 'url(/photos/get/' + path+')');

										commit({fileId: path,fileName:file.name,size:file.size,contentType:getContentType(file.name)});
									});
								}
							} else {
								var uploader = new psFileUploadFactory.FileUploader(scope, file, getContentType(file.name), '/uploads/putgetpath/');
								uploader.upload(function(err, path) {
									if (err) {
										notificationFactory.error($translate.instant('generic.file.uploadFailed'));
										scope.$apply( function() { });
										return true;
									}

									// elm.css('background-image', 'url(/photos/get/' + path+')');
									commit({fileId: path,fileName:file.name,size:file.size,contentType:getContentType(file.name)});
								});
							}
						// if (file.type !== 'image/jpeg') {
						// 	//TODO do something clever
						// 	notificationFactory.error({translationCode:'psui.uploadable.image.unsupported.image.type'});
						// } else {
						// }
					}
				});

				function getReadableFileSizeString(fileSizeInBytes) {

					var i = -1;
					var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
					do {
						fileSizeInBytes = fileSizeInBytes / 1024;
						i++;
					} while (fileSizeInBytes > 1024);

					return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
				}

				var ngModel = ctrls[0];
				if (ngModel) {
					ngModel.$render = function() {
							if (ngModel.$viewValue && ngModel.$viewValue.fileName) {
								elm.html(
										'<div class="psui-attachment-name">'
										+ ' <a href="/uploads/get/' + ngModel.$viewValue.fileId + '" target="_blank" '
										+ '        class="psui-attachment-link fa fa-save" download="' + ngModel.$viewValue.fileName + '">'
										+ ' ' + ngModel.$viewValue.fileName + '</a>'
										+ ' <span>' + ngModel.$viewValue.fileName + '</span>'
										+ ' <em>(' + getReadableFileSizeString(ngModel.$viewValue.size) + ')</em>'
										+ '</div>'
										);
								$compile(elm.contents())(scope);
								elm.find('a').on('click', function(evt) {
									evt.stopPropagation();
									return false;
								});
							}
					};

					commit = function(val) {
						scope.$apply( function() {
							ngModel.$setViewValue(val);
							ngModel.$render();
						});
					};
				}
			}
		}
	}]);

}(window.angular));
