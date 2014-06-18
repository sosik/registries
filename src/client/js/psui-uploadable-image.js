angular.module('psui-uploadable-image', []) 
.factory('psFileUploadFactory', ['$http', 	
	/**
	 * Factory method
	 */
	function($http) {
	var idCounter = 0;
	/**
	 * FileUploader constructor
	 * @param {$scope} $scope - scope to bind fileuploader to
	 * @param {File} file - file to upload
	 * @constructor file-upload-snippet.psFileUploadFactory~FileUploader
	 */
	var FileUploader = function($scope, data, contentType, url) {
		this.id = ++idCounter;
		this.$scope = $scope;
		this.data = data;
		this.xhr = new XMLHttpRequest();
		this.progress = 0;
		this.contentType = contentType;
		this.url = url;

		/**
		 * ddd
		 * @method
		 */
		this.upload = function(callback) {
			var that = this;
			that.callback = callback;


			this.xhr.upload.addEventListener('progress', function(evt) {
				if (evt.lengthComputable) {
					that.progress = evt.loaded / evt.total;
				}

				that.$scope.$emit('psui:fileupload-progress', {
					uploader: that,
				});
			});

			this.xhr.onreadystatechange = function() {
				if (that.xhr.readyState === 1) {
					that.$scope.$emit('psui:fileupload-start', {
						uploader: that,
					});
					that.xhr.setRequestHeader('content-type', that.contentType || 'application/octet-stream');
					that.xhr.send(that.data);
				} else if (that.xhr.readyState === 4) {
						that.progress = 1;
					if (that.xhr.status === 200) {
						that.$scope.$emit('psui:fileupload-success', {
							uploader: that,
						});
						that.callback(null, that.xhr.responseText);
					} else {
						that.$scope.$emit('psui-fileupload-fail', {
							uploader: that,
						});
						that.callback(that.xhr.status);
					}
				}
			};
			this.xhr.open('PUT', this.url);
		};
	};

	var exports = {
		/**
		 * xxx
		 * @property {FileUploader}
		 */
		FileUploader: FileUploader
	};

	return exports;
}])
.directive('psuiUploadableImage', ['psFileUploadFactory', function(psFileUploadFactory) {
	return {
		restrict: 'E',
		require: ['^ngModel'],
		link: function(scope, elm, attrs, ctrls) {
			var fileButton = angular.element('<input type="file"></input>');
			var imgLink = '';
			elm.addClass('psui-uploadable-image');
			
			elm.append(fileButton);
			fileButton.addClass('psui-uploadable-image-fbutton');

			elm.on('click', function(evt) {
				fileButton[0].click();
			});

			var commit = function() {
			};

			fileButton.on('change', function(evt) {
				var file = fileButton[0].files[0];

				if (file) {
					if (file.type !== 'image/jpeg') {
						//TODO do something clever
						alert('unsupported image type');
					} else {
						var uploader = new psFileUploadFactory.FileUploader(scope, file, file.type, '/schema/putgetpath//');
						uploader.upload(function(err, path) {
							if (err) {
								alert(err);
							}

							elm.css('background-image', 'url(/schema/get/' + path+')');
							commit('/schema/get/' + path);
						});
					}
				}
			});

			var ngModel = ctrls[0];
			if (ngModel) {
				ngModel.$render = function() {
					elm.css('background-image', 'url('+(ngModel.$viewValue || 'img/no_photo.jpg')+')');
				};

				commit = function(val) {
					scope.$apply( function() {
						ngModel.$setViewValue(val);
					});
				};
			}
		}
	}
}]);

